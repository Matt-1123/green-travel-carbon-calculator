//const axios = require("axios");

// DOM Elements
const usedOrigin = document.querySelector("#used-origin");
const usedDestination = document.querySelector("#used-destination");
const usedDistance = document.querySelector("#used-distance");
const usedMapContainer = document.querySelector("#used-map-container");
const avoidedTravelType = document.querySelector("#avoided-travel-type");
const avoidedVehicle = document.querySelector("#vehicle-data");
const vehicleMakeDropdown = document.querySelector("#vehicle-make-dropdown");
const vehicleModelDropdown = document.querySelector("#vehicle-model-dropdown");
const avoidedOrigin = document.querySelector("#avoided-origin");
const avoidedDestination = document.querySelector("#avoided-destination");
const avoidedDistance = document.querySelector("#avoided-distance");
const avoidedMapContainer = document.querySelector("#avoided-map-container");
const calcImpact = document.querySelector("#calculate-impact");

// Populate 'Vehicle Make' Dropdown
const vehicleMakes = async () => {
  try {
    const result = await axios.get(
      "https://www.carboninterface.com/api/v1/vehicle_makes",
      {
        headers: {
          Authorization: "Bearer 92TNSMqdWepCrr3xJLeu3w",
          "Content-Type": "application/json",
        },
      }
    );
    console.log(result.data);
    result.data.forEach((make) => {
      const makeName = make.data.attributes.name;
      const makeID = make.data.id;
      const option = document.createElement("option");
      option.text = makeName;
      option.setAttribute("value", makeID);
      // option.setAttribute("data-id", makeID);
      vehicleMakeDropdown.appendChild(option);
    });
  } catch (err) {
    console.error(err);
  }
};

// Populate 'Vehicle Models' Dropdown
const displayModels = async (make) => {
  try {
    const result = await axios.get(
      `https://www.carboninterface.com/api/v1/vehicle_makes/${make}/vehicle_models`,
      {
        headers: {
          Authorization: "Bearer 92TNSMqdWepCrr3xJLeu3w",
          "Content-Type": "application/json",
        },
      }
    );
    console.log(result.data);
    result.data.reverse().forEach((model) => {
      const modelName = `${model.data.attributes.name} (${model.data.attributes.year})`;
      const modelID = model.data.id;
      const option = document.createElement("option");
      option.text = modelName;
      option.setAttribute("value", modelID);
      vehicleModelDropdown.appendChild(option);
    });
  } catch (err) {
    console.error(err);
  }
};

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
    if (status == google.maps.DirectionsStatus.OK) {
      // Get distance
      let distance = result.routes[0].legs[0].distance.text;
      usedDistance.textContent = distance;
      // Display route
      directionsDisplay.setDirections(result);
      usedMapContainer.classList.remove("is-hidden");
      // Get kg CO2 from distance
      tripToCarbon(distance);
    } else {
      console.log("error");
    }
  });
};

const tripToCarbon = async (distance, vehicle) => {
  const tripData = {
    type: "vehicle",
    distance_unit: "mi",
    distance_value: distance,
    vehicle_model_id: vehicle,
  };

  try {
    const result = await axios.post(
      "https://www.carboninterface.com/api/v1/estimates",
      tripData,
      {
        headers: {
          Authorization: "Bearer 92TNSMqdWepCrr3xJLeu3w",
          "Content-Type": "application/json",
        },
      }
    );
    console.log(result.data.data.attributes.carbon_kg);
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

avoidedTravelType.addEventListener("change", () => {
  if (avoidedTravelType.value === "vehicle") {
    avoidedVehicle.classList.remove("is-hidden");
  } else {
    avoidedVehicle.classList.add("is-hidden");
  }
});

vehicleMakeDropdown.addEventListener("change", (e) => {
  const makeID = e.target.value;
  if (makeID) {
    vehicleModelDropdown.classList.remove("is-hidden");
  }
  displayModels(makeID);
});

vehicleMakes();
