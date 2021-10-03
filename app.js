// DOM Elements
const usedTravelType = document.querySelector("#used-travel-type");
const usedOrigin = document.querySelector("#used-origin");
const usedDestination = document.querySelector("#used-destination");
const usedDistance = document.querySelector("#used-distance");
const usedMapContainer = document.querySelector("#used-map-container");
const avoidedTravelType = document.querySelector("#avoided-travel-type");
const addVehicleLabel = document.querySelector("#add-vehicle-label");
const vehicleMakeContainer = document.querySelector("#vehicle-make-dropdown");
const vehicleMakeDropdown = document.querySelector(
  "#vehicle-make-dropdown select"
);
const vehicleModelContainer = document.querySelector("#vehicle-model-dropdown");
const vehicleModelDropdown = document.querySelector("#vehicle-model-dropdown");
const avoidedOrigin = document.querySelector("#avoided-origin");
const avoidedDestination = document.querySelector("#avoided-destination");
const avoidedDistance = document.querySelector("#avoided-distance");
const avoidedEmissions = document.querySelector("#avoided-emissions");
const avoidedEmissionsText = document.querySelector("#avoided-emissions p");
const avoidedMapContainer = document.querySelector("#avoided-map-container");
const calcImpact = document.querySelector("#calculate-impact");
const distanceContainer = document.querySelectorAll(".distance-container");

// Populate 'Vehicle Make' Dropdown
const vehicleMakes = async () => {
  try {
    const result = await axios.get(
      "https://www.carboninterface.com/api/v1/vehicle_makes",
      {
        headers: {
          Authorization: `Bearer ${config.CARBON_INTERFACE_BEARER_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
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
          Authorization: `Bearer ${config.CARBON_INTERFACE_BEARER_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    result.data.reverse().forEach((model) => {
      const modelName = `${model.data.attributes.name} (${model.data.attributes.year})`;
      const modelID = model.data.id;
      const option = document.createElement("option");
      option.text = modelName;
      option.setAttribute("value", modelID);
      document
        .querySelector("#vehicle-model-dropdown select")
        .appendChild(option);
    });
  } catch (err) {
    console.error(err);
  }
};
// ---------------------------------------- //
// Calculate 'Used' Distances and Generate Map
// ---------------------------------------- //
const calculateUsedImpact = (travelMode) => {
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
    } else {
      console.log("error");
    }
  });
};

// ---------------------------------------- //
// Calculate 'Avoided' Distances and Generate Map
// ---------------------------------------- //

const calculateAvoidedImpact = (travelMode) => {
  const mapOptions = {
    zoom: 7,
    mapTypeId: "roadmap",
  };

  // Create Map
  const map = new google.maps.Map(avoidedMapContainer, mapOptions);

  // Create a directionsService object to use the route method and get a result for the origin/destination/travelType request
  const directionsService = new google.maps.DirectionsService();

  // Create a DirectionsRenderer object to display route on map
  const directionsDisplay = new google.maps.DirectionsRenderer();

  // Bind the directionsRenderer to the map
  directionsDisplay.setMap(map);

  // create request object
  const request = {
    origin: avoidedOrigin.value,
    destination: avoidedDestination.value,
    travelMode: google.maps.TravelMode[travelMode.toUpperCase()], // WALKING, TRANSIT, BICYCLING
  };

  // Pass the request to the route method
  let avoidedDistanceValue;
  directionsService.route(request, (result, status) => {
    if (status == google.maps.DirectionsStatus.OK) {
      // Get distance
      avoidedDistanceValue = parseFloat(result.routes[0].legs[0].distance.text);
      avoidedDistance.textContent = avoidedDistanceValue + " mi";
      // Display route
      directionsDisplay.setDirections(result);
      avoidedMapContainer.classList.remove("is-hidden");

      // Calculate avoided carbon emissions
      tripToCarbon(avoidedDistanceValue, vehicleModelId);
    } else {
      console.error(google.maps.DirectionsStatus);
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
          Authorization: `Bearer ${config.CARBON_INTERFACE_BEARER_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    avoidedEmissions.classList.remove("is-hidden");
    avoidedEmissionsText.textContent = `${result.data.data.attributes.carbon_kg} kg CO2`;
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

// ---------------------------------------- //
// Event Handlers
// ---------------------------------------- //
calcImpact.addEventListener("click", (e) => {
  e.preventDefault();
  calculateUsedImpact(usedTravelType.value);
  calculateAvoidedImpact(avoidedTravelType.value);

  // Display Distances
  distanceContainer.forEach((div) => div.classList.remove("is-hidden"));

  // Disable inputs
  usedOrigin.setAttribute("disabled", "disabled");
  usedDestination.setAttribute("disabled", "disabled");
});

avoidedTravelType.addEventListener("change", () => {
  if (avoidedTravelType.value === "driving") {
    addVehicleLabel.classList.remove("is-hidden");
    vehicleMakeContainer.classList.remove("is-hidden");
    vehicleMakes();
  } else {
    avoidedVehicle.classList.add("is-hidden");
  }
});

vehicleMakeDropdown.addEventListener("change", (e) => {
  const makeID = e.target.value;
  if (makeID) {
    vehicleModelContainer.classList.remove("is-hidden");
  }
  displayModels(makeID);
});

let vehicleModelId;
vehicleModelDropdown.addEventListener("change", (e) => {
  vehicleModelId = e.target.value;
});

// Auto fill avoided origin when checked
const sameOrigin = document.querySelector("#same-origin");
sameOrigin.addEventListener("change", () => {
  if (sameOrigin.checked) {
    avoidedOrigin.value = usedOrigin.value;
  } else {
    avoidedOrigin.value = "";
  }
});

// Auto fill avoided destination when checked
const sameDestination = document.querySelector("#same-destination");
sameDestination.addEventListener("change", () => {
  if (sameDestination.checked) {
    avoidedDestination.value = usedDestination.value;
  } else {
    avoidedDestination.value = "";
  }
});
