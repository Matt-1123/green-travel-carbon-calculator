// const express = require("express");
// const { createProxyMiddleware } = require("http-proxy-middleware");

// Create Express Server
// const app = express();

// Configuration
// const PORT = 3000;
// const HOST = "localhost";
// const API_SERVICE_URL = "https://api.triptocarbon.xyz/v1/footprint";

// api GET endpoint
// app.get("/info", (req, res, next) => {
//   res.send("test");
// });

// Authorization
// app.use("", (req, res, next) => {
//   if (req.headers.authorization) {
//     next();
//   } else {
//     res.sendStatus(403);
//   }
// });

// Proxy endpoints
// app.use(
//   "/tripToCarbon",
//   createProxyMiddleware({
//     target: API_SERVICE_URL,
//     changeOrigin: true,
//     // This way, when we, for example, send a request to localhost:3000/tripToCarbon/?activity=10&activityType=miles&country=def&mode=taxi, the URL will be rewritten to <API_SERVICE_URL>/?activity=10&activityType=miles&country=def&mode=taxi
//     pathRewrite: {
//       [`^/tripToCarbon`]: "",
//     },
//   })
// );

// Start the Proxy
// app.listen(PORT, HOST, () => {
//   console.log(`Starting Proxy at ${HOST}:${PORT}`);
// });

// DOM Elements
const usedOrigin = document.querySelector("#used-origin");
const usedDestination = document.querySelector("#used-destination");
const usedDistance = document.querySelector("#used-distance");
const usedMapContainer = document.querySelector("#used-map-container");
const avoidedOrigin = document.querySelector("#avoided-origin");
const avoidedDestination = document.querySelector("#avoided-destination");
const avoidedDistance = document.querySelector("#avoided-distance");
const avoidedMapContainer = document.querySelector("#avoided-map-container");
const calcImpact = document.querySelector("#calculate-impact");

// Calculate 'Used' Distances and Generate Map
const calculateUsedImpact = (mapType, travelMode) => {
  const mapOptions = {
    zoom: 7,
    mapTypeId: "roadmap",
  };

  // Create Map
  const map = new google.maps.Map(usedMapContainer, mapOptions);

  // Create a directionsService object to use the route method and get a result for the origin/destination/travelType request
  const directionsService = new google.maps.DirectionsService();

  // Create a DirectionsRenderer object to display route on map
  const directionsDisplay = new google.maps.DirectionsRenderer();

  // Bind the directionsRenderer to the map
  directionsDisplay.setMap(map);

  // create request object
  const request = {
    origin: usedOrigin.value,
    destination: usedDestination.value,
    travelMode: google.maps.TravelMode[travelMode.toUpperCase()], // WALKING, TRANSIT, BICYCLING
  };

  // Pass the request to the route method
  directionsService.route(request, (result, status) => {
    console.log(request);
    if (status == google.maps.DirectionsStatus.OK) {
      // Get distance
      usedDistance.textContent = result.routes[0].legs[0].distance.text;
      // Display route
      directionsDisplay.setDirections(result);
      usedMapContainer.classList.remove("is-hidden");
    } else {
      console.log("error");
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
  calculateUsedImpact("roadmap", "driving");
  usedOrigin.setAttribute("disabled", "disabled");
  usedDestination.setAttribute("disabled", "disabled");
});
