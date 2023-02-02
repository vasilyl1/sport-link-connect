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
    console.log(randomRoutes.length);
    console.log(randomRoutes[1]);
    console.log(randomRoutes[1].polyline.lon);
    let mapActivityLines=[];
    // draw polylines on the actual map
    for (let n=0;n<20;n++) {
        rngDrawTmp=[]; //converting obj lat lon to array lat lon, to suit the requirements
        // of the LeafletAPI
        //for (let n2=0;n2<randomRoutes[n].polyline.length;n2++) {
        //    rngDrawTmp.push([randomRoutes[n].polyline[n2].lat,randomRoutes[n].polyline[n2].lon]);
        //}
        rngDrawTmp.push([randomRoutes[n].polyline.lat,randomRoutes[n].polyline.lon]);
        //console.log(rngDrawTmp);
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




console.log (GeoByAddress("Museumplein+6+amsterdam")); // returns object {lat,lon} for the address provided as a string, string is to be utf8 url encoded

userFormEl.addEventListener('submit', formSubmitHandler);
