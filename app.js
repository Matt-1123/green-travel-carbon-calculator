// DOM Elements
const usedOrigin = document.querySelector("#used-origin");
const usedDestination = document.querySelector("#used-destination");
const usedDistance = document.querySelector("#used-distance");
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
      usedDistance.textContent = result.routes[0].legs[0].distance.text;
      console.log(result.routes[0].legs[0].distance.text);
      tripToCarbon(result.routes[0].legs[0].distance.text);
    }
  });
};

const tripToCarbon = async (miles) => {
  console.log("trip to carbon" + " " + miles);
  try {
    const { data } = await axios({
      method: "GET",
      url: "https://api.triptocarbon.xyz/v1/footprint?activity=10&activityType=miles&country=def&mode=taxi",
      // error: Reason: CORS header 'Access-Control-Allow-Origin' missing
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSMissingAllowOrigin
    });
    usedDistance.textContent = data;
  } catch (err) {
    console.error(err);
  }
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
