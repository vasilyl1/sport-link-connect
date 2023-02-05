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

/*let geonames = {
    key: "vlikhovaido"
} */


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






