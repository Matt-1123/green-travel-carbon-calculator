const from = document.querySelector("#from");
const to = document.querySelector("#to");
const output = document.querySelector("#test-output");
const getDistance = document.querySelector("#get-distance");

// Set map options

const latLng = { lat: 42.6526, lng: -73.7562 };
const mapOptions = {
  center: latLng,
  zoom: 7,
  mapTypeId: "roadmap",
};

// Create Map
const mapEl = document.querySelector("#map");
const map = new google.maps.Map(mapEl, mapOptions);

// Create a Directions service object to use the route method and get a result for our request
const directionsService = new google.maps.DirectionsService();

// Create a DirectionsRenderer object to display route on map
const directionsDisplay = new google.maps.DirectionsRenderer();

// Bind the directionsRenderer to the map
directionsDisplay.setMap(map);

// function
const calcRoute = () => {
  // create request
  const request = {
    origin: from.value,
    destination: to.value,
    travelMode: google.maps.TravelMode.DRIVING, // WALKING, TRANSIT, BICYCLING
  };

  // Pass the request to the route method
  directionsService.route(request, (result, status) => {
    console.log(request);
    if (status == google.maps.DirectionsStatus.OK) {
      // Get distance

      output.textContent = result.routes[0].legs[0].distance.text;

      // Display route
      directionsDisplay.setDirections(result);
    } else {
      // Delete route from map
      directionsDisplay.setDirections({ routes: [] });

      // Recenter map to default
      map.setCenter(latLng);

      // Show error message
      output.textContent = "Error";
    }
  });
};

// Create autocomplete
// const options = {
//   types: ["(cities)"],
// };

const autocompleteFrom = new google.maps.places.Autocomplete(from);
const autocompleteTo = new google.maps.places.Autocomplete(to);

// Event Listeners
getDistance.addEventListener("click", calcRoute());
