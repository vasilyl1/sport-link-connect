userFormEl= document.querySelector('#form-area');
userNameFieldEl = document.querySelector('#name-textfield');
userNameBtnEl = document.querySelector('#submitBtn');
userLocationEl = document.querySelector('#user-coords');
locationListEl = document.querySelector('#location-list');
userRadiusEl = document.querySelector('#radius-field')

// This is the format of the user object. This is the object that will be written directly to the 
// localstorage JSON for each user of the application. 
// id: unique id, to be randomly generated
// name: user's name
// lat, lon: latitude and longitude of the user's location
// interestRadius: radius of the user's interest range, in km
// inclroutes: array of route objects (in the format of objTestRoute, line 27) the user expressed interest in
// exclroutes: array of route objects, as above, which the user has explicitly rejected
objTestUserRecord = {
    name:'',
    id: 0,
    lat:0,
    lon:0,
    interestRadius:0,
    inclroutes: [],
    exclroutes: []

}


// This is the basic object for storing routes. Unique id, polyline is an array of objects with properties of lat:#, lon:#
// activity relates to the relevant athletic activity
// owner is the name of the individual associated by "Strava" with the route

objTestRoute = {
    id:0,
    polyline:[],
    date:0,
    activity:'',
    owner:''

}

function GenerateRoutes(num,origin,map) {
    // num is the number of routes we are asking to generate
    // origin is the origin point (lat, lon object) around which the routes will be randomly generated

    // localRouteArray initialised
    let localRouteArray=[];
    //
    for (x=0;x<num;x++) {
        //initialise a temporary object variable
      let tmpObj={};
      //generate random id
      tmpObj.id=Math.ceil(Math.random()*1000000);
      //make the individual route, within a certain hardcoded area around the origin point, by adding random distances to the origin
      tmpObj.polyline=MakeRoute(origin.lat+((Math.random()*0.002)-(Math.random()*0.001)),origin.lon+((Math.random()*0.002)-(Math.random()*0.001)));
      // randomise activity
      tmpObj.activity=['cycling','running'][Math.floor(Math.random()*2)];
      // randomise name
      tmpObj.owner=['Claire','Ron','Tawnee','Miriam','John','Robert','Ahmed', 'Fumi'][Math.floor(Math.random()*8)];
      // add the temporary object to the localRouteArray (which this function will return) before iterating the process again
      localRouteArray.push(tmpObj);
    }

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
    // return the whole object - name, id, polyline, activity, etc.
return localRouteArray;
}

function GetUserLocation() {
    // ... we're still working on this. There's some unpleasant scoping error
    // which is preventing the nested functions from accessing this locCoords variable,
    // probably something stupid
    let locCoords={lat:43.6532,lon:-79.3832}
    function glSuccess(pos) {
        locCoords= {lat:pos.coords.latitude, lon:pos.coords.longitude}
       // locCoords={lat:43.6532,lon:-79.3832};
       console.log("loc success"+locCoords.lat+locCoords.lon);
       return locCoords;
    }
    function glError() {
     console.log("location error");
        locCoords= {lat:43.6532,lon:-79.3832};
        return locCoords;
    }
    navigator.geolocation.getCurrentPosition(glSuccess, glError);
    return locCoords;
}

// The following will likely be wrapped in a 'general setup' function; keeping it in global scope
// for simplicity's sake

console.log(GetUserLocation());
// obtain location coordinates for the user, place them in the user object
objTestUserRecord.lat=GetUserLocation().lat;
objTestUserRecord.lon=GetUserLocation().lon;
console.log("forsomereason"+objTestUserRecord.lat+"  "+objTestUserRecord.lon)
// center map on user location contained in the user object
    let map = L.map('map').setView([objTestUserRecord.lat, objTestUserRecord.lon], 17);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);


  
    userLocationEl.innerHTML=(`${objTestUserRecord.lat},${objTestUserRecord.lon}`);
    // spawn the marker on the map according to user location
    let userMapMarker=L.marker([objTestUserRecord.lat, objTestUserRecord.lon]).addTo(map);
    let userMapRadius=L.circle([objTestUserRecord.lat, objTestUserRecord.lon],{radius: objTestUserRecord.interestRadius, color:'blue', fillColor:'blue', fillOpacity: 0.25}).addTo(map);
    
 // make 20 random routes, using the above-defined generator function
    let randomRoutes=GenerateRoutes(20,{lat:43.6532,lon:-79.3832},map);
    console.log(randomRoutes);
    let mapActivityLines=[];
    // draw polylines on the actual map
    for (n=0;n<20;n++) {
        rngDrawTmp=[]; //converting obj lat lon to array lat lon, to suit the requirements
        // of the LeafletAPI
        for (n2=0;n2<randomRoutes[n].polyline.length;n2++) {
            rngDrawTmp.push([randomRoutes[n].polyline[n2].lat,randomRoutes[n].polyline[n2].lon]);
        }
        console.log(rngDrawTmp);
        let lineColor;
        if (randomRoutes[n].activity==='cycling') {lineColor='yellow';} else {lineColor='red';}
        //  draw route objects on the map
        mapActivityLines[n]=L.polyline(rngDrawTmp,{color: lineColor}).addTo(map);
    

    }


function formSubmitHandler(event) {
    event.preventDefault();
    objTestUserRecord.interestRadius=userRadiusEl.value();
    console.log("radius"+tmpObj.interestRadius);
}






userFormEl.addEventListener('submit', formSubmitHandler);
