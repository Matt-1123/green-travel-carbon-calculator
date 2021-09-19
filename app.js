// DOM Elements
const usedOrigin = document.querySelector("#used-origin");
const usedDestination = document.querySelector("#used-destination");
const avoidedOrigin = document.querySelector("#avoided-origin");
const avoidedDestination = document.querySelector("#avoided-destination");
const calcImpact = document.querySelector("#calculate-impact");

// Calculate Distances
const calculateImpact = (
  usedOrigin,
  usedDestination,
  avoidedOrigin,
  avoidedDestination
) => {
  // Create a directionsService object to use the route method and get a result for the origin/destination/travelType request
  const directionsService = new google.maps.DirectionsService();

  // Create a DirectionsRenderer object to display route on map
  const directionsDisplay = new google.maps.DirectionsRenderer();

  // create request object
  const request = {
    origin: usedOrigin,
    destination: usedDestination,
    travelMode: google.maps.TravelMode.DRIVING, // WALKING, TRANSIT, BICYCLING
  };

  // Pass the request to the route method
  directionsService.route(request, (result, status) => {
    console.log(request);
    if (status == google.maps.DirectionsStatus.OK) {
      // Get distance

      console.log(result.routes[0].legs[0].distance.text);
    }
  });
};

// Places Autocomplete
const autocompleteUsedOrigin = new google.maps.places.Autocomplete(usedOrigin);
const autocompleteUsedDestination = new google.maps.places.Autocomplete(
  usedDestination
);
const autocompleteAvoidedOrigin = new google.maps.places.Autocomplete(
  avoidedOrigin
);
const autocompleteAvoidedDestination = new google.maps.places.Autocomplete(
  avoidedDestination
);

// Event Handlers
calcImpact.addEventListener("click", (e) => {
  e.preventDefault();
  calculateImpact(
    usedOrigin.value,
    usedDestination.value,
    avoidedOrigin.value,
    avoidedDestination.value
  );
  usedOrigin.setAttribute("disabled", "disabled");
});
