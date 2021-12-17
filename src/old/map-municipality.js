/**
 * 
 */

		var map = L.map('map').setView([44, 20], 7);

		L.tileLayer('http://{s}.tile.cloudmade.com/{key}/22677/256/{z}/{x}/{y}.png', {
			attribution: 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2012 CloudMade',
			key: 'BC9A493B41014CAABB98F0471D759707'
		}).addTo(map);
		
		var info = L.control();

		info.onAdd = function (map) {
		    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
		    this.update();
		    return this._div;
		};

		// method that we will use to update the control based on feature properties passed
		info.update = function (props) {
		    this._div.innerHTML = '<h4>Total regional development incentives</h4>' +  (props ?
		        '<b>' + props.OPSTINA + '</b><br />' + 
		        'Maticni broj: ' + props.MAT_BR_OPS + '<br />' +
		        'Value: ' + props.value //+ people / mi<sup>2</sup>'
		        : 'Hover over a state');
		};

		info.addTo(map);
		

		//var baseballIcon = L.icon({
		//	iconUrl: 'baseball-marker.png',
		//	iconSize: [32, 37],
		//	iconAnchor: [16, 37],
		//	popupAnchor: [0, -28]
		//});

		function onEachFeature(feature, layer) {
			//var popupContent = "<p>I started out as a GeoJSON " +
			//		feature.geometry.type + ", but now I'm a Leaflet vector!</p>";

			//if (feature.properties && feature.properties.popupContent) {
			//	popupContent += feature.properties.popupContent;
			//}

			var popupContent = "";

			if (feature.properties && feature.properties.OPSTINA) {
				popupContent += "<p>Municipality: " + feature.properties.OPSTINA + "</p>";
			}

			if (feature.properties && feature.properties.OKRUG) {
				popupContent += "<p>Area: " + feature.properties.OKRUG + "</p>";
			}

			if (feature.properties && feature.properties.NSTJ_CODE_OKRUG) {
				popupContent += "<p>NSTJ area code: " + feature.properties.NSTJ_CODE_OKRUG + "</p>";
			}

			if (feature.properties && feature.properties.REGION) {
				popupContent += "<p>Region: " + feature.properties.REGION + "</p>";
			}

			if (feature.properties && feature.properties.NSTJ_CODE_REGION) {
				popupContent += "<p>NSTJ region code: " + feature.properties.NSTJ_CODE_REGION + "</p>";
			}
			
			if (feature.properties && feature.properties.MAT_BR_OPS) {
				popupContent += "<p>Municipality id no.: " + feature.properties.MAT_BR_OPS + "</p>";
			}

			if (feature.properties && feature.properties.SIF_OKRUGA) {
				popupContent += "<p>Area code: " + feature.properties.SIF_OKRUGA + "</p>";
			}

			if (feature.properties && feature.properties.AREA) {
				popupContent += "<p>Total area: " + feature.properties.AREA + "</p>";
			}

			if (feature.properties && feature.properties.PERIMETER) {
				popupContent += "<p>Total perimeter: " + feature.properties.PERIMETER + "</p>";
			}

			layer.bindPopup(popupContent);
			
			layer.on({
		        mouseover: highlightFeature,
		        mouseout: resetHighlight,
	//	        click: zoomToFeature
		    });
		}
		
		var colorGradeValues = [0, 1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000];
		var colors = ["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)",
		              "rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)"];
		
		function getColorFromValue(value) {
			for (var i = colorGradeValues.length; i > 0; i--) {
				if (value > colorGradeValues[i]) {
					return colors[i];
				}
			}
			return colors[0];
		}
		
		function municipalityStyle(feature, layer) {
			var color = "#FFFFFF";
			if (feature.properties.value > 100) {
				color = "#AAAAAA";
			} 
			return {
			    weight: 2,
			    color: "#999",
			    opacity: 1,
			    fillColor: color,
			    fillOpacity: 0.8
			};
		}


		var hashValues = getHashObservationValues();
		//TODO there are no values yet
		
		var geojson;

		function highlightFeature(e) {
		    var layer = e.target;

		    layer.setStyle({
		        weight: 5,
		        color: '#666',
		        dashArray: '',
		        fillOpacity: 0.7
		    });

		    if (!L.Browser.ie && !L.Browser.opera) {
		        layer.bringToFront();
		    }

		    info.update(layer.feature.properties);
		}
		
		function resetHighlight(e) {
		    geojson.resetStyle(e.target);

		    info.update();
		}
		
		function zoomToFeature(e) {
		    map.fitBounds(e.target.getBounds());
		}
		
		//L.geoJson([bicycleRental, campus], {

		//	style: function (feature) {
		//		return feature.properties && feature.properties.style;
		//	},

		//	onEachFeature: onEachFeature,

		//	pointToLayer: function (feature, latlng) {
		//		return L.circleMarker(latlng, {
		//			radius: 8,
		//			fillColor: "#ff7800",
		//			color: "#000",
		//			weight: 1,
		//			opacity: 1,
		//			fillOpacity: 0.8
		//		});
		//	}
		//}).addTo(map);

		
		geojson = L.geoJson(municipalitiesData, {

			style: municipalityStyle,

			onEachFeature: onEachFeature,

// 				pointToLayer: function (feature, latlng) {
// 					return L.circleMarker(latlng, {
// 						radius: 8,
// 						fillColor: "#ff7800",
// 						color: "#000",
// 						weight: 1,
// 						opacity: 1,
// 						fillOpacity: 0.8
// 					});
// 				}
		}).addTo(map);
		

		var legend = L.control({position: 'bottomright'});

		legend.onAdd = function (map) {

		    var div = L.DomUtil.create('div', 'info legend'),
		        grades = colorGradeValues,
		        labels = [];

		    // loop through our density intervals and generate a label with a colored square for each interval
		    for (var i = 0; i < colorGradeValues.length; i++) {
		        div.innerHTML +=
		            '<i style="background:' + getColorFromValue(colorGradeValues[i] + 1) + '"></i> ' +
		            colorGradeValues[i] + (colorGradeValues[i + 1] ? '&ndash;' + colorGradeValues[i + 1] + '<br>' : '+');
		    }

		    return div;
		};


		legend.addTo(map);
		
		
		//L.geoJson(freeBus, {

		//	filter: function (feature, layer) {
		//		if (feature.properties) {
		//			// If the property "underConstruction" exists and is true, return false (don't render features under construction)
		//			return feature.properties.underConstruction !== undefined ? !feature.properties.underConstruction : true;
		//		}
		//		return false;
		//	},

		//	onEachFeature: onEachFeature
		//}).addTo(map);

		//var coorsLayer = L.geoJson(coorsField, {

		//	pointToLayer: function (feature, latlng) {
		//		return L.marker(latlng, {icon: baseballIcon});
		//	},

		//	onEachFeature: onEachFeature
		//}).addTo(map);

