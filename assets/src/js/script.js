function init() {
    console.log("hi");
     
       userNameFieldEl = document.querySelector('#name-textfield');
       
       userLocationEl = document.querySelector('#user-coords');
       locationListEl = document.querySelector('#location-list');
       userRadiusEl = document.querySelector('#radius-field');
       userActivityEl = document.querySelector('#activity-dropdown');
        
       signupBtnEl = document.querySelector('#signup');
       loginBtnEl = document.querySelector('#login');
       submiBtnEl = document.querySelector('#submitBtn');
       userFormEl= document.querySelector('#form-area');
   
       let userMapmarker;
       let mapMarkers=[];
       let testData=[];
       
       // locCoords={};
   
       const objCoords = {
           lat:0,
           lon:0
       }
   
       const objPOIRecord = {
           id:0,
           name:'', // possibly
           coords: {lat:0,lon:0}, // a single objCoord
           type:'' // type of POI - portage, trail, etc.
       }
   
       const objUserRecord = {
           name :'',
           id:0,
           knownAddresses:[], //array of address strings (remember to uppercase)
           knownLocs:[], // array of objCoords
           inclPOIs:[], // array of objPOIRecords
           lastActivityPref:''
       }
   
       function ProcessFormGroup(event) {
           event.preventDefault();
           console.log(event.this);
           if (!objCurrentUser.id) {
               PopModal("Please sign in or sign up first!")
           } else {
               PopModal ("Updating!"+userActivityEl.value);
               objCurrentUser.lastActivityPref=userActivityEl.value;
               UpdateUserList(objCurrentUser);
           }
   
       }
   
   
   
       // function GenerateTestData() {
       //     tempObjArray=JSON.parse(localStorage.getItem("slc-test-data"));
       //     if (!tempObjArray) {
       //         let tempObjArr=[];
               
       //         for (x=0;x<5;x++) {
       //             let tmpObj=objPOIRecord;
       //             tmpObj.type=['Running','Cycling','Hiking','Kayaking'][Math.floor(Math.random()*4)];
       //             tmpObj.coords.lat=43.6532+(Math.floor(Math.random*(64.2823-43.6532)));
       //             tmpObj.coords.lon=-79.3832+(Math.floor(Math.random*(-135.0000-(-79.3832))));
       //             tmpObj.name=(['White','Black','Grey','Red','Green','Blue'][Math.floor(Math.random()*6)])+' '+(['Bear','Salmon','Moose','Starling','Pigeon','Crow'][Math.floor(Math.random()*6)])+' '+(['Lake','Creek','Beach','Mountain','Trail','Grotto'][Math.floor(Math.random()*6)]);
       //             tempObjArr.push(tmpObj);
       //         }
       //         console.log(tempObjArr);
       //         localStorage.setItem("slc-test-data", JSON.stringify(tempObjArr));
       //         testData=tempObjArr;
       //     }
       // }
   
       async function ProcessSignup(event) {
           
           event.preventDefault();
           console.log("hit signup");
           let objTempUser=objUserRecord;
           alert("SIGN UP!"+event.target.getAttribute('id'));
           objTempUser.name=prompt("WHAT IS YOUR NAME?");
           alert("HI "+objTempUser.name);
           objTempUser.id=GenerateUniqueID();
           alert("YOUR UNIQUE ID IS "+objTempUser.id);
           let x=await GetUserLocation();
           console.log('code advanced');
           console.log('outside of it'+x.lat+" "+x.lon);
           objTempUser.knownAddresses.push(x); //change this to GetAddressFromStreet function
           objTempUser.knownLocs.push(x);
           objCurrentUser = objTempUser;
           UpdateUserList(objCurrentUser);
           GenerateRoutes(20,objCurrentUser.knownLocs[0]);
       }
   
       function ProcessLogin(event) {
           event.preventDefault();
           PopModal("LOGIN!"+event.target.getAttribute('id'));
           let tmpName=AskModal("NAME??");
           let tmpID=prompt("ID??");
           let found=UserFound(tmpName,tmpID);
           console.log(found);
           if (found) {
               console.log(found.name);
               objCurrentUser=found;
               PopModal (`Welcome, ${objCurrentUser.name}.`);
               InitMap();
               GenerateRoutes(20,objCurrentUser.knownLocs[0]);
           } else {
               PopModal("User not found!");
           }
           
       }
   
   
       let GenerateRoutes = function(num,origin,map) {
           // num is the number of routes we are asking to generate
           // origin is the origin point (lat, lon object) around which the routes will be generated
       
           let localRouteArray=[{}]; // array of local routes
           let routes = [{}];
       
           // fetching the data for the trails
           fetch("https://secure.geonames.org/searchJSON?country=ca&maxRows=1000&featureClass=R&featureClass=L&featureCode=TRL&featureCode=AMUS&featureCode=PRK&featureCode=RGNH&username=" + geonames.key)
          
           // Converting received data to JSON
           .then(response=> response.json())
           .then(json => {
         
              // geo location for trail
              let distance = [];
              for (let j=0; j < 1000; j++) { // get the distance criteria for each point
               // distance criteria is calculated as the minimum of sum of square difference of geo coordinates
               distance.push(Math.abs(origin.lat - json.geonames[j].lat) + Math.abs(origin.lon - json.geonames[j].lng));
              }
              distance = distance.slice(1);
              distance.sort(function(a, b){return a - b}); // sort array in ascending way
              
               // return the requested number of routes by comparing the lowest geo distance criteria to the sorted array of lowest distances (distance[])
               for (let i = 0; i < 1000; i++) {
                   for (let j = 0; j < num; j++) {
                   if (distance[j] === (Math.abs(origin.lat - json.geonames[i].lat) + Math.abs(origin.lon-json.geonames[i].lng))) {
                       routes.push({lat: json.geonames[i].lat, lon:json.geonames[i].lng, name: json.geonames[i].name, province: json.geonames[i].adminName1, country: json.geonames[i].countryName });
                   };
               };
       
              };
              /*
              routeLoc.lat = json.geonames[j].lat;
              routeLoc.lon = json.geonames[j].lng;
              routeLoc.name = json.geonames[j].name; // park name
              routeLoc.province = json.geonames[j].adminName1; // province
              routeLoc.country = json.geonames[j].countryName; // country
              */
           
           //
           routes = routes.slice(1);
           for (let x = 0; x < num; x++) {
               //initialise a temporary object variable
             let tmpObj={};
             //generate random id
             tmpObj.id=Math.ceil(Math.random()*1000000);
             //make the individual route, within a certain hardcoded area around the origin point, by adding random distances to the origin
             //tmpObj.polyline = [{}];
             // tmpObj.polyline=MakeRoute(origin.lat+((Math.random()*0.002)-(Math.random()*0.001)),origin.lon+((Math.random()*0.002)-(Math.random()*0.001)));
             //tmpObj.polyline[0] = {lat: origin.lat, lon: origin.lon};
             tmpObj.polyline = routes[x]; // this is replaced from dummy randomization with the real data, one geo point per route, name, province and country added into routes[{object}]
             // randomise activity
             tmpObj.activity=['cycling','running'][Math.floor(Math.random()*2)];
             // randomise name
             tmpObj.owner=['Claire','Ron','Tawnee','Miriam','John','Robert','Ahmed', 'Fumi'][Math.floor(Math.random()*8)];
             // add the temporary object to the localRouteArray (which this function will return) before iterating the process again
             localRouteArray.push(tmpObj);
           };
           console.log('lrl '+localRouteArray.length); 
           for (xi=0;xi<localRouteArray.length;xi++) {
               console.log('testing success '+localRouteArray[xi]);
               console.log("generic test");
           InitMap();
           // PopulateRoutes();
         
       
           // .then scope ends here
       }
       
       });
           
           
       localRouteArray = localRouteArray.slice(1);
       return localRouteArray;
       };
   
   
       function InitMap() {
           // Set the initial view of the map on the user's last location
           map.setView([objCurrentUser.knownLocs[0].lat, objCurrentUser.knownLocs[0].lon])
       userMapMarker=L.marker([objCurrentUser.knownLocs[0].lat, objCurrentUser.knownLocs[0].lon]).addTo(map);
       // Fetch map tiles based on current view
       L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
           maxZoom: 19,
           attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
       }).addTo(map);
       if (objCurrentUser.lastActivityPref) {
           console.log("yielded "+objCurrentUser.lastActivityPref)
           userActivityEl.value=objCurrentUser.lastActivityPref;
       }
       }
   
       function UpdateMap({lat,lon}) {
           map.setView([lat,lon])
           if (objCurrentUser.lastActivityPref) {
               userActivityEl.value=objCurrentUser.lastActivityPref;
           }
       }
   
   
   
       // STORAGE FUNCTIONS
   
       function UpdateUserList(objCurrentUser) {
           let objTmpUserList = RetrieveUserList();
           for (x=0;x<objTmpUserList.length;x++) {
               if (objTmpUserList[x].id===objCurrentUser.id) {
                   objTmpUserList[x]=objCurrentUser;
                   WriteUserList(objTmpUserList);
                   return
               }
           }
           objTmpUserList.push(objCurrentUser);
           WriteUserList(objTmpUserList);
           return
       }
   
       function WriteUserList(objList) {
           localStorage.setItem("slc-user-list", JSON.stringify(objList));
       }
   
       function RetrieveUserList() {
           let objTemp={};
           objTemp=JSON.parse(localStorage.getItem("slc-user-list"));
           if (objTemp) {return objTemp;} else {return []}
       }
   
       function UserFound(name, id) {
           objTemp=RetrieveUserList();
           for (x=0;x<objTemp.length;x++) {
               if (objTemp[x].name==name && objTemp[x].id==id) {
                   return objTemp[x];
               }
           }
           return false;
       }
       
   
   
       // UTILITY FUNCTIONS
   
       PopModal = (text) => alert(text);
       AskModal = (text) => prompt(text);
   
       GenerateUniqueID = () => Math.ceil(Math.random()*1000000);
   
       function RestoreDropdownValue() {
           //Will restore dropdown based on user record.
       }
   
       function GetUserLocation() {
           let p = new Promise(function (resolve,reject) {
           navigator.geolocation.getCurrentPosition(glResolve, glReject);
           function glResolve(pos) {
           console.log("loc success inside"+pos.coords.latitude+pos.coords.longitude);
           resolve(pos);}
           function glReject() {reject({lat:43.6532,lon:-79.3832});}
   
           })
           return {lat:43.6532,lon:-79.3832}; // placeholder
       }
   
       // CODE EXECUTION
   
       let objCurrentUser=objUserRecord;
       let map = L.map('map').setView([0,0], 16);
   
       signupBtnEl.addEventListener('click', ProcessSignup);
       loginBtnEl.addEventListener('click', ProcessLogin);
       userFormEl.addEventListener('submit', ProcessFormGroup);
   
   
   }
   
   init();