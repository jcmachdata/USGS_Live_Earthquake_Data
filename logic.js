
// Store our API endpoint inside queryUrl
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

function createFeatures(earthquakeData, tectonicData) {

    var tectonics = L.geoJSON(tectonicData, {
        color: "orange",
      })
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + "Magnitude: " + feature.properties.mag);
          },

          pointToLayer: function (feature, latlng) {
            return new L.circle(latlng,
              {radius: getRadius(feature.properties.mag),
              fillColor: getColor(feature.properties.mag),
              fillOpacity: .6,
              color: "#000",
              stroke: true,
              weight: .8
          })
        }
        });

    createMap(earthquakes, tectonics);
}

 // Sending our earthquakes layer to the createMap function

function createMap(earthquakes, tectonics) {

    // Define streetmap and darkmap layers
    const streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.streets",
            accessToken: API_KEY
    });

    const darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.dark",
            accessToken: API_KEY
    });

    const satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: API_KEY
});

    // Define a baseMaps object to hold our base layers
    const baseMaps = {
            "Street Map": streetmap,
            "Dark Map": darkmap,
            "Satellite": satellite
    };

    // // Create tectonic layer
    // var tectonicPlates = new L.LayerGroup();

    // Create overlay object to hold our overlay layer
    const overlayMaps = {
            Earthquakes: earthquakes,
            tectonicPlates: tectonics
    };

    // Create our map, giving it the streetmap, tectonic plates, and earthquakes layers to display on load
    const myMap = L.map("map", {
            center: [39.68, -111.00],
            zoom: 5,
            layers: [streetmap, earthquakes, tectonics]
    });

    // // add tectonic plates 
    // d3.json(tectonicPlatesURL, function(tectonicData) {
    //     L.geoJson(tectonicData, {
    //         color: "yellow",
    //         weight: 10
    //     })
    //     .addTo(tectonicPlates);
    // });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
    }).addTo(myMap);

   // Create legend
   var legend = L.control({
    position: "bottomright"
    });

    legend.onAdd = function(myMap) {
      var div = L.DomUtil.create("div", "info legend"),
      grades = [0, 1, 2, 3, 4, 5],
      labels = [];


    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
        '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
        return div;
    };

    legend.addTo(myMap);

}

(async function(){
    const data = await d3.json(url);
    const tectonic = await d3.json(tectonicPlatesURL);
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features, tectonic.features);
})()


// function for magnitude colors
function getColor(magnitude) {
    if (magnitude > 5) {
        return 'red'
    } else if (magnitude > 4) {
        return 'orange'
    } else if (magnitude > 3) {
        return 'purple'
    } else if (magnitude > 2) {
        return 'yellow'
    } else if (magnitude > 1) {
        return 'green'
    } else {
        return 'lightgreen'
    }
};

// create radius function
function getRadius(magnitude) {
    return magnitude * 10000;
};

// function getRadius(magnitude) {
//     return Math.pow(magnitude, 10)/15;
// };

