// Set the URL for the earthquake data in GeoJSON format
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Declare a variable to store the GeoJSON data
var geoJson;

// Use D3 to retrieve the GeoJSON data from the USGS API
d3.json(queryUrl).then(function (data) {
  // Once the data is retrieved, call the createFeatures function to create map layers
  createFeatures(data.features);
});

// Define the createFeatures function to create map layers based on the earthquake data
function createFeatures(earthquakeData) {
  // Use Leaflet to create a GeoJSON layer for the earthquakes
  var earthquakes = L.geoJSON(earthquakeData, {
    // Call the createPopup function to create a popup for each earthquake
    onEachFeature: createPopup,
    // Call the createMarker function to create a marker for each earthquake
    pointToLayer: createMarker,
  });

  // Call the createMap function to create the map and add the earthquake layer to it
  createMap(earthquakes);
}

// Define the createPopup function to create a popup for each earthquake
function createPopup(feature, layer) {
  // Use the feature properties to create a formatted popup with details about the earthquake
  return layer.bindPopup(
    "<h3>" +
      feature.properties.place +
      "</h3><hr><p>" +
      new Date(feature.properties.time) +
      "</p><hr><p>Magnitude: " +
      feature.properties.mag +
      "</p><p>Depth: " +
      feature.geometry.coordinates[2] + 
      " km</p>"
  );
}

// Define the createMarker function to create a circle marker for each earthquake
function createMarker(feature, latlng) {
  // Extract the earthquake magnitude and depth data
  var mag = feature.properties.mag;
  var depth = feature.geometry.coordinates[2];
  // Calculate the radius of the circle marker based on the earthquake magnitude
  var radius = mag * 3;
  // Get the color for the circle marker based on the earthquake depth
  var color = getColor(depth);
  
  // Use Leaflet to create a circle marker with the earthquake location, size, and color
  return L.circleMarker(latlng, {
    radius: radius,
    fillColor: color,
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  });
}

// Define the getColor function to get a color for a circle marker based on the earthquake depth
function getColor(d) {
  return d > 90
    ? "#1a9641"
    : d > 60
    ? "#a6d96a"
    : d > 50
    ? "#ffffbf"
    : d > 40
    ? "#fdae61"
    : d > 30
    ? "#d7191c"
    : "#f7f7f7";
}
  
  function createMap(earthquakes) {
    //Define variables for base layers
    var Satellite = L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "mapbox/satellite-v9",
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY,
      }
    );
  
    var darkmap = L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "mapbox/dark-v10",
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY,
      }
    );
  
    var Outdoors = L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "mapbox/outdoors-v11",
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY,
      }
    );
  
    //create separate layer groups
    var baseMaps = {
      Satellite: Satellite,
      "Dark Map": darkmap,
      Outdoors: Outdoors,
    };
  
    var overlayMaps = {
      Earthquakes: earthquakes,
    };
  
    var myMap = L.map("map", {
      center: [44.5, -89.5],
      zoom: 3,
      layers: [darkmap, earthquakes, Outdoors],
    });
  
    L.control
      .layers(baseMaps, overlayMaps, {
        collapsed: false,
      })
      .addTo(myMap);
  
    // Create legend parameters
    var legend = L.control({ position: "bottomleft" });
    legend.onAdd = function () {
      var div = L.DomUtil.create("div", "info legend");
      var limits = ["90+", "60+", "50+", "40+", "30+", "20+", "10+"];
      var colors = ["#1a9641", "#a6d96a", "#ffffbf", "#fdae61", "#d7191c", "#4d4d4d", "#f7f7f7"];
      var labels = [];
    
      var legendInfo =
        '<h1 style="color:Green">Earthquake Map</h1>' +
        '<div class="labels">' +
        '<div class="min">' +
        "</div>" +
        '<div class="max">' +
        "</div>" +
        "</div>";
    
      div.innerHTML = legendInfo;
    
      for (var i = 0; i < limits.length; i++) {
        labels.push(
          '<li style="background-color: ' +
            colors[i] +
            '; width: 20px; padding-right: 10px">' +
            limits[i] +
            "</li>"
        );
      }
    
      div.innerHTML += "<ul>" + labels.join("") + "</ul>";
      return div;
    };
    
    legend.addTo(myMap);
  }