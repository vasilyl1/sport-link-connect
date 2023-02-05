function init() {

    userNameFieldEl = document.querySelector('#name-textfield');

    userLocationEl = document.querySelector('#user-coords');
    locationListEl = document.querySelector('#location-list');
    userRadiusEl = document.querySelector('#radius-field');

    userActivityEl = document.querySelector('#activity-dropdown');
    signupBtnEl = document.querySelector('#signup');
    loginBtnEl = document.querySelector('#login');
    submiBtnEl = document.querySelector('#submitBtn');
    userFormEl = document.querySelector('#form-area');

    alertMessageEl = document.querySelector('#alertMessage');

    signupModalSubmitBtnEl = document.querySelector('#signupSubmit');

    loginModalSubmitBtnEl = document.querySelector('#loginSubmit');

    nameModalSignupEl = document.querySelector('#userName');
    emailModalSignUpEl = document.querySelector('#email-signup');
    passwordModalSignUpEl = document.querySelector('#password-signup');
    emailModalLoginEl = document.querySelector('#email-login');
    passwordModalLoginEl = document.querySelector('#password-login');
    locationFieldEl = document.querySelector('#location-field');
    buttonSignup = document.querySelector("#signup"); // signup button
    buttonLogin = document.querySelector("#login"); // login button
    buttonClose = document.querySelector("#close"); // close button for the alert
    buttonClose1 = document.querySelector("#close1"); // close button for the login modal
    buttonClose2 = document.querySelector("#close2"); // close button for the signup modal

    let objCurrentUser = {};


    let localRouteArray = [{}]; // array of local routes
    let userMapMarker;
    let mapMarkers = [];
    let testData = [];


    // locCoords={};

    const objCoords = {
        lat: 0,
        lon: 0
    }

    // Definition of point-of-interest object

    const objPOIRecord = {
        id: 0,
        name: '',
        coords: { lat: 0, lon: 0 }, // a single objCoord
        type: '' // type of POI - portage, trail, etc.
    }

    // Definition of object user record

    const objUserRecord = {
        name: '',
        id: 0,
        knownAddresses: [], //array of address strings (remember to uppercase)
        knownLocs: [], // array of objCoords
        inclPOIs: [], // array of objPOIRecords
        lastActivityPref: ''
    }

    // processing for location/activity submission

    function ProcessFormGroup(event) {
        event.preventDefault();
        if (!objCurrentUser.id) {

            PopModal("Please sign in or sign up first!")
        } else {
            objCurrentUser.lastActivityPref = userActivityEl.value;
            UpdateUserList(objCurrentUser);
            if (locationFieldEl.value) {
                GeoByAddress(locationFieldEl.value);

            }
        }

    }

    let GeoByAddress = function (address) { // returns an object {lan,lat} the corresponding geo location point to the address requested, string is to be utf8 url encoded

        let geoLoc = { lat: 0, lon: 0 };
        processedAddress = address.replace(/\s/g, '+');
        console.log(processedAddress);
        fetch("https://nominatim.openstreetmap.org/?addressdetails=1&q=" + processedAddress + "&format=json&limit=1")
            // Converting received data to JSON
            .then(response => response.json())
            .then(json => {
                console.log(json);
                geoLoc.lat = json[0].lat;
                geoLoc.lon = json[0].lon;
                objCurrentUser.knownLocs[0] = { lat: geoLoc.lat, lon: geoLoc.lon };
                ClearMarkers();
                GenerateRoutes(20, objCurrentUser.knownLocs[0]);


            });
        return geoLoc;


    };


    async function ProcessSignup(event) {

        event.preventDefault();
        ClearMarkers();
        console.log("hit signup");
        let checkedLoc;
        objCurrentUser = objUserRecord;
        let objTempUser = objUserRecord;
        // alert("SIGN UP!"+event.target.getAttribute('id'));
        objTempUser.name = nameModalSignupEl.value;
        // alert("HI "+objTempUser.name);
        console.log("modal name " + objTempUser.name);
        objTempUser.id = GenerateUniqueID();
        // alert("YOUR UNIQUE ID IS "+objTempUser.id);
        objTempUser.password = passwordModalSignUpEl.value;
        console.log("modal password " + objTempUser.password);
        objTempUser.email = emailModalSignUpEl.value;
        console.log("modal email " + objTempUser.email);
        console.log("modal id " + objTempUser.id);

        GetUserLocation()
            .then((position) => {
                console.log("gotposition" + position);
                checkedLoc = { lat: position.coords.latitude, lon: position.coords.longitude };
                objTempUser.inclPOIs = [];
                objTempUser.knownLocs[0] = checkedLoc;
                objCurrentUser = objTempUser;
                UpdateUserList(objCurrentUser);
                GenerateRoutes(20, objCurrentUser.knownLocs[0]);
            })
            .catch((err) => {
                console.error(err.message);
                checkedLoc = { lat: 43.6532, lon: -79.3832 };
                objTempUser.inclPOIs = [];
                objTempUser.knownLocs[0] = checkedLoc;
                objCurrentUser = objTempUser;
                UpdateUserList(objCurrentUser);
                GenerateRoutes(20, objCurrentUser.knownLocs[0]);
            });
        console.log('code advanced');
        console.log('outside of it' + x.lat + " " + x.lon);
        hideSignupModal();

    }

    function ProcessLogin(event) {
        event.preventDefault();
        // objCurrentUser={};
        // objCurrentUser=objUserRecord;
        let tmpEmail = emailModalLoginEl.value;
        let tmpPass = passwordModalLoginEl.value;
        let found = UserFound(tmpEmail, tmpPass);
        hideLoginModal();
        console.log(found);
        if (found) {
            objCurrentUser = found;
            console.log("current user set to " + objCurrentUser.name);
            PopModal("Welcome, " + objCurrentUser.name + "!");
            // GenerateRoute;s(20,objCurrentUser.knownLocs[0]);
            ClearMarkers();
            GetUserLocation()
                .then((position) => {
                    console.log("gotposition" + position);
                    checkedLoc = { lat: position.coords.latitude, lon: position.coords.longitude };
                    objCurrentUser.knownLocs[0] = checkedLoc;
                    // UpdateUserList(objCurrentUser);
                    GenerateRoutes(20, objCurrentUser.knownLocs[0]);
                })
                .catch((err) => {
                    console.error(err.message);
                    checkedLoc = { lat: 43.6532, lon: -79.3832 }
                    objCurrentUser.knownLocs[0] = checkedLoc;
                    // UpdateUserList(objCurrentUser);
                    GenerateRoutes(20, objCurrentUser.knownLocs[0]);
                });
        } else {
            PopModal("User not found!");
        }

    }


    let GenerateRoutes = function (num, origin, map) {
        // num is the number of routes we are asking to generate
        // origin is the origin point (lat, lon object) around which the routes will be generated

        localRouteArray = [];
        ClearMarkers();
        let routes = [{}];

        // fetching the data for the trails
        fetch("https://secure.geonames.org/searchJSON?country=ca&maxRows=1000&featureClass=R&featureClass=L&featureCode=TRL&featureCode=AMUS&featureCode=PRK&featureCode=RGNH&username=" + geonames.key)

            // Converting received data to JSON
            .then(response => response.json())
            .then(json => {

                // geo location for trail
                let distance = [];
                for (let j = 0; j < 1000; j++) { // get the distance criteria for each point
                    // distance criteria is calculated as the minimum of sum of square difference of geo coordinates
                    distance.push(Math.abs(origin.lat - json.geonames[j].lat) + Math.abs(origin.lon - json.geonames[j].lng));
                }
                distance = distance.slice(1);
                distance.sort(function (a, b) { return a - b }); // sort array in ascending way

                // return the requested number of routes by comparing the lowest geo distance criteria to the sorted array of lowest distances (distance[])
                for (let i = 0; i < 1000; i++) {
                    for (let j = 0; j < num; j++) {
                        if (distance[j] === (Math.abs(origin.lat - json.geonames[i].lat) + Math.abs(origin.lon - json.geonames[i].lng))) {
                            routes.push({
                                lat: json.geonames[i].lat, lon: json.geonames[i].lng, name: json.geonames[i].name,
                                province: json.geonames[i].adminName1, country: json.geonames[i].countryName, id: json.geonames[i].geonameId, class: json.geonames[i].fclName
                            });
                        };
                    };

                };
        

                //
                routes = routes.slice(1);
                for (let x = 0; x < num; x++) {
                    //initialise a temporary object variable
                    let tmpObj = {};
                    //generate random id
                    tmpObj.id = Math.ceil(Math.random() * 1000000);
                    //make the individual route, within a certain hardcoded area around the origin point, by adding random distances to the origin
                    //tmpObj.polyline = [{}];
                    // tmpObj.polyline=MakeRoute(origin.lat+((Math.random()*0.002)-(Math.random()*0.001)),origin.lon+((Math.random()*0.002)-(Math.random()*0.001)));
                    //tmpObj.polyline[0] = {lat: origin.lat, lon: origin.lon};
                    tmpObj.polyline = routes[x]; // this is replaced from dummy randomization with the real data, one geo point per route, name, province and country added into routes[{object}]
                    // randomise activity
                    tmpObj.activity = ['cycling', 'running'][Math.floor(Math.random() * 2)];
                    // randomise name
                    tmpObj.owner = ['Claire', 'Ron', 'Tawnee', 'Miriam', 'John', 'Robert', 'Ahmed', 'Fumi'][Math.floor(Math.random() * 8)];
                    // add the temporary object to the localRouteArray (which this function will return) before iterating the process again
                    localRouteArray.push(tmpObj);
                };


                InitMap();
                PopulateRoutes(localRouteArray);


                // .then scope ends here


            });


        localRouteArray = localRouteArray.slice(1);
        return localRouteArray;
    };

    function PopulateRoutes(objRoute) {
        for (xi = 0; xi < objRoute.length; xi++) {
            console.log(objRoute.length);
            mapMarkers[xi] = L.marker([objRoute[xi].polyline.lat, objRoute[xi].polyline.lon]).addTo(map).on('dblclick', ProcessMarkerClick);
            // let otherFaves=CheckFavourites(objRoute[xi].polyline.name);
            // console.log(otherFaves);
            // +"<br>("+otherFaves+")"
            mapMarkers[xi].bindPopup(objRoute[xi].polyline.name).openPopup();

            // console.log(mapMarkers[xi]);
        }
        InitFavourites(mapMarkers);
        UpdateMap(objCurrentUser.knownLocs[0]);


    }

    function InitFavourites(markers) {
        console.log("init-favs" + markers.length);
        for (x = 0; x < markers.length; x++) {
            markerSelected = markers[x].getPopup();

            let rPoiNAME = markerSelected.getContent()
            let poiNAME = rPoiNAME.split('<')[0];
            if ([poiNAME] === '') { rPoiNAME = poiNAME }
            // let favesString=CheckFavourites(poiNAME);
            // console.log("favesstring "+favesString);
            // if (favesString) {favesString=`(${favesString})`}
            console.log("popupyielded " + poiNAME);
            console.log("also-user " + objCurrentUser);
            for (y = 0; y < objCurrentUser.inclPOIs.length; y++) {
                console.log("bindingnew " + objCurrentUser.inclPOIs[y].polyline.name + " here");
                // let favesString=CheckFavourites(poiNAME);
                // console.log("favesstring "+favesString);
                // if (favesString!='') {favesString=`<br>(${favesString})`}
                if (poiNAME === objCurrentUser.inclPOIs[y].name) {
                    markers[x].bindPopup(poiNAME + "<br><b>Favourited!</b>");
                    // let favesString=CheckFavourites(poiNAME);
                    // console.log("favesstring "+favesString);
                    // if (favesString!='') {favesString=`<br>(${favesString})`}
                    // re these three
                }
            }
        }

    }

    function ClearMarkers() {
        if (userMapMarker) { userMapMarker.remove(); }
        if (mapMarkers) {
            for (x = 0; x < mapMarkers.length; x++) {
                mapMarkers[x].remove();
            }
        }
        mapMarkers.length = 0;
    }

    function ProcessMarkerClick(event) {
        markerSelected = event.target.getPopup();
        let rPoiNAME = markerSelected.getContent()
        let poiNAME = rPoiNAME.split('<')[0];
        if ([poiNAME] === '') { rPoiNAME = poiNAME }
        console.log("poiName in click is" + poiNAME);
        let favesString = CheckFavourites(poiNAME);
        console.log("favesstring " + favesString);
        if (favesString != '') { favesString = `<br>(${favesString})` }
        //careful re these three
        for (x = 0; x < localRouteArray.length; x++) {
            if (localRouteArray[x].polyline.name === poiNAME) {
                if (checkPolys(poiNAME, objCurrentUser)) {
                    objCurrentUser.inclPOIs.push(localRouteArray[x]);
                    console.log("not already there");
                }
                event.target.bindPopup(localRouteArray[x].polyline.name + favesString + "<br><b>Favourited!</b>");
                event.target.openPopup();
            }
        }
        function checkPolys(featName, curUser) {
            for (xk = 0; xk < curUser.inclPOIs.length; xk++) {
                if (curUser.inclPOIs[xk].polyline.name === featName) { return false; }
            }
            return true;
        }
        UpdateUserList(objCurrentUser);
    }






    function InitMap() {
        if (!map) { map = L.map('map').setView([0, 0], 17); }
        // Set the initial view of the map on the user's last location
        map.setView([objCurrentUser.knownLocs[0].lat, objCurrentUser.knownLocs[0].lon])
        userMapMarker = L.marker([objCurrentUser.knownLocs[0].lat, objCurrentUser.knownLocs[0].lon]).addTo(map);
        userMapMarker.bindPopup(objCurrentUser.name).openPopup();
        // Fetch map tiles based on current view
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        if (objCurrentUser.lastActivityPref) {
            console.log("yielded " + objCurrentUser.lastActivityPref)
            userActivityEl.value = objCurrentUser.lastActivityPref;
        }
    }

    function UpdateMap({ lat, lon }) {
        map.setView([lat, lon])
        if (objCurrentUser.lastActivityPref) {
            userActivityEl.value = objCurrentUser.lastActivityPref;
        }
    }



    // STORAGE FUNCTIONS

    function UpdateUserList(objCurrentUser) { // retreives the user list from local storage, updates the current user fields, writes the data back
        let objTmpUserList = RetrieveUserList();
        for (x = 0; x < objTmpUserList.length; x++) {
            if (objTmpUserList[x].id === objCurrentUser.id) {
                objTmpUserList[x] = objCurrentUser;
                WriteUserList(objTmpUserList);
                return
            }
        }
        objTmpUserList.push(objCurrentUser);
        WriteUserList(objTmpUserList);
        return
    }

    function WriteUserList(objList) { // write user credentials to local storage
        localStorage.setItem("slc-user-list", JSON.stringify(objList));
    }

    function RetrieveUserList() { // read all users credentials from the local storage
        let objTemp = {};
        objTemp = JSON.parse(localStorage.getItem("slc-user-list"));
        if (objTemp) { return objTemp; } else { return [] }
    }

    function UserFound(email, password) { // checks if the user is in the stored list
        objTemp = RetrieveUserList();
        for (x = 0; x < objTemp.length; x++) {
            if (objTemp[x].email == email && objTemp[x].password == password) {
                return objTemp[x];
            }
        }
        return false;
    }

    function CheckFavourites(name) {
        objTemp = RetrieveUserList();
        console.log("cf name is" + name)
        let tempUsers = [];
        for (x = 0; x < objTemp.length; x++) {
            for (y = 0; y < objTemp[x].inclPOIs.length; y++) {
                if ((objTemp[x].inclPOIs[y].polyline.name === name) && (objTemp[x].id != objCurrentUser.id)) {
                    tempUsers.push(objTemp[x].name);
                    console.log("found a favourite also: " + tempUsers.join(", "));
                }
            }
        }
        return tempUsers.join(", ");
    }





    // UTILITY FUNCTIONS

    PopModal = (text) => {
        alertMessageEl.innerHTML = text;
        showAlertModal();


    }
    AskModal = (text) => prompt(text);

    GenerateUniqueID = () => Math.ceil(Math.random() * 1000000);



    function RestoreDropdownValue() {
        //Will restore dropdown based on user record.
    }

    function GetUserLocation() {
        return new Promise(function (glResolve, glReject) {
            navigator.geolocation.getCurrentPosition(glResolve, glReject);


        })
    }


    // show and hide the modal

    function showAlertModal() {
        document.getElementById("AlertModal").classList.remove("hidden");
        // document.getElementById("AlertModal-background").classList.remove("hidden");
        // document.getElementById("AlertModal-background").classList.add("opacity-75");
        document.getElementById("map").classList.add("hidden");
    }
    function hideAlertModal() {
        document.getElementById("AlertModal").classList.add("hidden");
        // document.getElementById("AlertModal-background").classList.remove("opacity-75");
        // document.getElementById("AlertModal-background").classList.add("hidden");
        document.getElementById("map").classList.remove("hidden");
    }

    function showLoginModal() {
        document.getElementById("loginModal").classList.remove("hidden");
        document.getElementById("loginModal-background").classList.remove("hidden");
        document.getElementById("loginModal-background").classList.add("opacity-75");
        document.getElementById("map").classList.add("hidden");
    }

    function hideLoginModal() {
        document.getElementById("loginModal").classList.add("hidden");
        document.getElementById("loginModal-background").classList.remove("opacity-75");
        document.getElementById("loginModal-background").classList.add("hidden");
        document.getElementById("map").classList.remove("hidden");
    }

    function showSignupModal() {
        document.getElementById("signupModal").classList.remove("hidden");
        document.getElementById("signupModal-background").classList.remove("hidden");
        document.getElementById("signupModal-background").classList.add("opacity-75");
        document.getElementById("map").classList.add("hidden");
    }

    function hideSignupModal() {
        document.getElementById("signupModal").classList.add("hidden");
        document.getElementById("signupModal-background").classList.remove("opacity-75");
        document.getElementById("signupModal-background").classList.add("hidden");
        document.getElementById("map").classList.remove("hidden");
    }

    // LISTENERS

    objCurrentUser = objUserRecord;
    let map;
    signupModalSubmitBtnEl.addEventListener('click', ProcessSignup);
    buttonSignup.addEventListener("click", showSignupModal); // adds listener when signup button clicked
    buttonLogin.addEventListener("click", showLoginModal); // adds listener when login button clicked
    buttonClose.addEventListener("click", hideAlertModal); // adds listener when close button clicked
    buttonClose1.addEventListener("click", hideLoginModal); // adds listener when close button clicked
    buttonClose2.addEventListener("click", hideSignupModal); // adds listener when close button clicked
    document.getElementById("loginModal-background").addEventListener("click",hideLoginModal); // The background that becomes darker and blurred when the modal is shown
    document.getElementById("signupModal-background").addEventListener("click",hideSignupModal); // The background that becomes darker and blurred when the modal is shown
    loginModalSubmitBtnEl.addEventListener('click', ProcessLogin);
    userFormEl.addEventListener('submit', ProcessFormGroup);


}

init();
