
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



userFormEl= document.querySelector('#form-area');
userNameFieldEl = document.querySelector('#name-textfield');
userNameBtnEl = document.querySelector('#submitBtn');
userLocationEl = document.querySelector('#user-coords');
locationListEl = document.querySelector('#location-list');
userRadiusEl = document.querySelector('#radius-field')


objTestUserRecord = {
    name:'',
    id: 0,
    lat:0,
    lon:0,
    interestRadius:0,
    inclroutes: [],
    exclroutes: []

}

objTestRoute = {
    id:0,
    polyline:[],
    date:0,
    activity:'',
    owner:''

}

function GenerateRoutes(num,origin,map) {
    let localRouteArray=[];
    for (x=0;x<num;x++) {
      let tmpObj={};
      tmpObj.id=Math.ceil(Math.random()*1000000);
      tmpObj.polyline=MakeRoute(origin.lat+((Math.random()*0.002)-(Math.random()*0.001)),origin.lon+((Math.random()*0.002)-(Math.random()*0.001)));
      tmpObj.activity=['cycling','running'][Math.floor(Math.random()*2)];
      tmpObj.owner=['Claire','Ron','Tawnee','Miriam','John','Robert','Ahmed', 'Fumi'][Math.floor(Math.random()*8)];
      localRouteArray.push(tmpObj);
    }

    function MakeRoute(mrLat,mrLon) {
        let rgMrArray=[];
        let numPoints=Math.floor(Math.random()*3)+2;
        let oldPoint={lat:mrLat, lon:mrLon}
        rgMrArray.push(oldPoint); //push zeroth
        for (i=0;i<numPoints;i++) {
            oldPoint.lat=oldPoint.lat+(Math.random()*0.0001);
            oldPoint.lon=oldPoint.lon+(Math.random()*0.0001);
            rgMrArray.push({lat:oldPoint.lat,lon:oldPoint.lon});
        }
        return rgMrArray;
    }
return localRouteArray;
}

function GetUserLocation() {
    let locCoords={lat:43.6532,lon:-79.3832}
    function glSuccess(pos) {
        locCoords= {lat:pos.coords.latitude, lon:pos.coords.longitude}
       // locCoords={lat:43.6532,lon:-79.3832};
    }
    function glError() {
        alert('location error!');
        locCoords= {lat:43.6532,lon:-79.3832};
    }
    navigator.geolocation.getCurrentPosition(glSuccess, glError);
    return locCoords;
}

// The following will likely be wrapped in a 'general setup' function; keeping it in global scope
// for simplicity's sake


    let map = L.map('map').setView([43.6532, -79.3832], 17);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    console.log(GetUserLocation());
    objTestUserRecord.lat=GetUserLocation().lat;
    objTestUserRecord.lon=GetUserLocation().lon;
    userLocationEl.innerHTML=(`${objTestUserRecord.lat},${objTestUserRecord.lon}`);
    let userMapMarker=L.marker([objTestUserRecord.lat, objTestUserRecord.lon]).addTo(map);
    let userMapRadius=L.circle([objTestUserRecord.lat, objTestUserRecord.lon],{radius: objTestUserRecord.interestRadius, color:'blue', fillColor:'blue', fillOpacity: 0.25}).addTo(map);
    

    let randomRoutes=GenerateRoutes(20,{lat:43.6532,lon:-79.3832},map);
    console.log(randomRoutes);
    let mapActivityLines=[];
    // draw polylines
    for (n=0;n<20;n++) {
        rngDrawTmp=[]; //converting obj lat lon to array
        for (n2=0;n2<randomRoutes[n].polyline.length;n2++) {
            rngDrawTmp.push([randomRoutes[n].polyline[n2].lat,randomRoutes[n].polyline[n2].lon]);
        }
        console.log(rngDrawTmp);
        let lineColor;
        if (randomRoutes[n].activity==='cycling') {lineColor='yellow';} else {lineColor='red';}
        mapActivityLines[n]=L.polyline(rngDrawTmp,{color: lineColor}).addTo(map);
    

    }


function formSubmitHandler(event) {
    event.preventDefault();
    objTestUserRecord.interestRadius=userRadiusEl.value();
    console.log("radius"+tmpObj.interestRadius);
}






userFormEl.addEventListener('submit', formSubmitHandler);

// let GPX = getAthleteGPX (552, 5); // request geo points for athlete 552 route 5
// for (let i = 0; i < GPX.length; i++) {console.log("Geolocation " + GPX[i].lon + " " + GPX[i].lat)}



// alert("You will be redirected to STRAVA now to consent the data exchange");

// GET to the authorization page for the user to authorize the access

// fetch("https://www.strava.com/oauth/authorize?response_type=code&client_id=" + stravaSecret.client_id + "&redirect_uri=" + "localhost" /*+ stravaSecret.redirect_uri */ + "&approval_prompt=auto&scope=read")
   
    // Converting received data to JSON
//    .then(response => response.json())
//    .then(json => {
  /*
        // Create a variable to store HTML
        let li = `<tr><th>Name</th><th>Email</th></tr>`;
       
        // Loop through each data and add a table row
        json.forEach(user => {
            li += `<tr>
                <td>${user.name} </td>
                <td>${user.email}</td>        
            </tr>`;
    
        });
    */

    // Display result
 //   console.log(json);

    // document.getElementById("users").innerHTML = li;
//});

