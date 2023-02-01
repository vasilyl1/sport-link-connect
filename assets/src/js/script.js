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
       console.log("loc success");
    }
    function glError() {
     console.log("location error");
        locCoords= {lat:43.6532,lon:-79.3832};
    }
    navigator.geolocation.getCurrentPosition(glSuccess, glError);
    return locCoords;
}

// The following will likely be wrapped in a 'general setup' function; keeping it in global scope
// for simplicity's sake

// console.log(GetUserLocation());
objTestUserRecord.lat=GetUserLocation().lat;
objTestUserRecord.lon=GetUserLocation().lon;
    let map = L.map('map').setView([objTestUserRecord.lat, objTestUserRecord.lon], 17);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);


  
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
