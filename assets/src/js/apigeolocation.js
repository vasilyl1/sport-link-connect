
// Redirect the user to GET https://www.strava.com/oauth/authorize

/*

fetch(url, {options})
.then(data => {
    // Do some stuff here
})
.catch(err => {
    // Catch and display errors
})

// GET

fetch("https://jsonplaceholder.typicode.com/users")
   
    // Converting received data to JSON
    .then(response => response.json())
    .then(json => {
  
        // Create a variable to store HTML
        let li = `<tr><th>Name</th><th>Email</th></tr>`;
       
        // Loop through each data and add a table row
        json.forEach(user => {
            li += `<tr>
                <td>${user.name} </td>
                <td>${user.email}</td>        
            </tr>`;
        });
  
    // Display result
    document.getElementById("users").innerHTML = li;
});

// POST

fetch("https://jsonplaceholder.typicode.com/posts", {
     
    // Adding method type
    method: "POST",
     
    // Adding body or contents to send
    body: JSON.stringify({
        title: "foo",
        body: "bar",
        userId: 1
    }),
     
    // Adding headers to the request
    headers: {
        "Content-type": "application/json; charset=UTF-8"
    }
})
 
// Converting to JSON
.then(response => response.json())
 
// Displaying results to console
.then(json => console.log(json));

*/


let getAthleteGPX = function (id, route) { //id = identifier of the athlete, route = identifier of the route
    
    // reads the geo location points for the specified athlete and their route

    if (id===0) {console.log("no athlete has been specified"); return NIL; }

    let GPX = [
        {lat: 43.661370, lon: -79.396260}, //Toronto1
        {lat: 43.641870, lon: -79.386440},  //Toronto2
        {lat: 43.640580, lon: -79.388920},  //Toronto3
        {lat: 43.653860, lon: -79.392770}  //Toronto4
    ];
    return GPX;
};

let GeoByAddress = function (address) { // returns an object {lan,lat} the corresponding geo location point to the address requested, string is to be utf8 url encoded

    let geoLoc = {lat:0, lng:0};

    fetch("https://secure.geonames.org/geoCodeAddressJSON?q=" + address + "&username=" + geonames.key)
   
    // Converting received data to JSON
    .then(response => response.json())
    .then(json => {
  
       geoLoc.lat = json.address.lat;
       geoLoc.lng = json.address.lng
       
        });
    return geoLoc;
  

};

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
});
    
    // decommisioned
/*
    function MakeRoute(mrLat,mrLon) {
        // mrLat and mrLon are coordinates passed by the parent function (line 54),
        // the randomised origin points of individual routes
        // initialise temporary array of lat-lon coordinates
        let rgMrArray=[];
        // randomise number of nodes (points) to be included in the polygon, between 2 and 5?
        let numPoints=Math.floor(Math.random()*3)+2;
        // the starting point for the polygon
        let oldPoint={lat:mrLat, lon:mrLon}
        rgMrArray.push(oldPoint); //push initial point to array of coordinates as point zero
        for (i=0;i<numPoints;i++) {
            // iterate for the number of points randomised on line 69
            // offset the coordinates by an arbitrary small amount
            oldPoint.lat=oldPoint.lat+(Math.random()*0.0001);
            oldPoint.lon=oldPoint.lon+(Math.random()*0.0001);
            // push the newly modified oldPoint to the temporary array before iterating again,
            // with the modified oldPoint as the starting point of the next line/jump
            rgMrArray.push({lat:oldPoint.lat,lon:oldPoint.lon});
        }
        // return the assembled polyline
        return rgMrArray;
    }
    // return the whole object - name, id, polyline, activity, etc. */
localRouteArray = localRouteArray.slice(1);
return localRouteArray;
};



// let GPX = getAthleteGPX (552, 5); // request geo points for athlete 552 route 5
// for (let i = 0; i < GPX.length; i++) {console.log("Geolocation " + GPX[i].lon + " " + GPX[i].lat)}



// alert("You will be redirected to STRAVA now to consent the data exchange");

// GET to the authorization page for the user to authorize the access

// fetch("https://www.strava.com/oauth/authorize?response_type=code&client_id=" + stravaSecret.client_id + "&redirect_uri=" + "localhost" /*+ stravaSecret.redirect_uri */ + "&approval_prompt=auto&scope=read")
   
    // Converting received data to JSON
//    .then(response => response.json())
//    .then(json => {

    // Display result
 //   console.log(json);

    // document.getElementById("users").innerHTML = li;
//});

