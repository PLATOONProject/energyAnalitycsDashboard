/**
 * 
 */

var map = L.map('map').setView([44, 20], 7);

//SPARQL
var hashObservationValues = new Object();
var minObservationValue = 0;
var maxObservationValue = 0;

var codePrefix = "http://elpo.stat.gov.rs/lod2/RS-DIC/geo/";

var cbfunc = function(results) {
	minObservationValue = 0;
	maxObservationValue = 0;
	
	for (var i = 0; i < results.length; i++) {
		var uri = results[i].rsgeo.uri;
		var code = uri.substring(codePrefix.length, uri.length);
		var value = results[i].observation;
		hashObservationValues[code] = value;
		
		//find min and max values
		var intValue = parseInt(value);
		if (code.length == 4) {//only region data
			if (maxObservationValue == 0 || intValue > maxObservationValue) {
				maxObservationValue = intValue;
			} 
			if (minObservationValue == 0 || intValue < minObservationValue) {
				minObservationValue = intValue;
			}
		}
		
	}


  $("body").css("cursor", "default");
  refreshLeafletLayer();
  
};

function refreshLeafletLayer() {
	info.update();
	
	recalculateColorGradeValues();
	map.removeControl(legend);
	legend.addTo(map);
	
	map.removeLayer(geojson);
	geojson = L.geoJson(regionsData, {
		style: regionStyleHash,
		onEachFeature: onEachFeature,
	}).addTo(map);
}

var yearUrl = '<http://elpo.stat.gov.rs/lod2/RS-DIC/time/Y2009>';
var incentiveUrl = '<http://stat.apr.gov.rs/lod2/RS-DIC/IncentivePurpose/Total>';

$(document).ready(function() {
	 // Setup the ajax indicator ("loading")
	$('body').append('<div id="ajaxBusy"><p><img src="resources/images/loading.gif"></p></div>');
	 
	$('#ajaxBusy').css({
		display:"none",
		margin:"0px",
		paddingLeft:"0px",
		paddingRight:"0px",
		paddingTop:"0px",
		paddingBottom:"0px",
		position:"absolute",
		right:"3px",
		top:"3px",
		width:"auto"
	});
	 
	
	$("#run_sparql").click(function(e) {
		  runSparql();
		  return false;
	});
});

//Ajax activity indicator bound to ajax start/stop document events
$(document).ajaxStart(function(){
	$('#ajaxBusy').show();
}).ajaxStop(function(){
	$('#ajaxBusy').hide();
});

function runSparql() {
	$("body").css("cursor", "progress");
	
	$.sparql("http://fraunhofer2.imp.bg.ac.rs/sparql")
	  .prefix("rs","http://elpo.stat.gov.rs/lod2/RS-DIC/rs/")
	  .prefix("geo","http://elpo.stat.gov.rs/lod2/RS-DIC/geo/")
	  .prefix("apr","http://stat.apr.gov.rs/lod2/")
	  .prefix("sdmx-measure","http://purl.org/linked-data/sdmx/2009/measure#")
	  .select(["?time", "?incentive", "?rsgeo", "?observation"])
	    .where("?y","rs:geo", "?rsgeo")
	    .where("?y","rs:time", "?time")
	    .where("?y","apr:incentiveAim", "?incentive")
	    .where("?y","rs:time", yearUrl )
	    .where("?y","apr:incentiveAim", incentiveUrl )
	    .where("?y","sdmx-measure:obsValue", "?observation")
	  .execute(cbfunc);

};

function setYear() {
	year = $("#year").val();
	yearUrl = '<http://elpo.stat.gov.rs/lod2/RS-DIC/time/Y' + year + '>';
}

function setIncentive() {
	incentiveCode = $("#incentive").val();

	incentiveUrl = '<http://stat.apr.gov.rs/lod2/RS-DIC/IncentivePurpose/' + incentiveCode + '>';
}

L.tileLayer('http://{s}.tile.cloudmade.com/{key}/22677/256/{z}/{x}/{y}.png', {
	attribution: 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2012 CloudMade',
	key: 'BC9A493B41014CAABB98F0471D759707'
}).addTo(map);

//ADD INFO WINDOW TO MAP
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
	var valueRS = "No data";
	if (hashObservationValues["RS"] != null) {
		valueRS = hashObservationValues["RS"];
	}
	
	var defaultHTML = '<b>' + 'Area: Serbia </b><br />' + 
	    'NSTJ code: RS <br />' + 
	    'Value: ' + valueRS;
	
	var value = "No data";
	if (props != null && hashObservationValues[props.NSTJ_CODE_REGION] != null) {
		value = hashObservationValues[props.NSTJ_CODE_REGION];
	}
    this._div.innerHTML = '<h4>Total regional development incentives</h4>' +  (props ?
        '<b>' + 'Region:' + props.REGION + '</b><br />' + 
        'NSTJ code: ' + props.NSTJ_CODE_REGION + '<br />' + 
        'Value: ' + value//+ ' people / mi<sup>2</sup>'
        : defaultHTML);
};

info.addTo(map);

function onEachFeature(feature, layer) {
	//DEFINE POPUPS FOR REGIONS
	var popupContent = "";

	if (feature.properties && feature.properties.REGION) {
		popupContent += "<p>Region: " + feature.properties.REGION + "</p>";
	}

	if (feature.properties && feature.properties.NSTJ_CODE_REGION) {
		popupContent += "<p>NSTJ region code: " + feature.properties.NSTJ_CODE_REGION + "</p>";
	}
	
	if (feature.properties && feature.properties.value) {
		popupContent += "<p>Value: " + hashObservationValues[feature.properties.NSTJ_CODE_REGION] + "</p>";
	}

	if (feature.properties && hashObservationValues[feature.properties.NSTJ_CODE_REGION] == null) {
		popupContent += "<p>Value: No data</p>";
	}

	layer.bindPopup(popupContent);
	

	//DEFINE ONMOUSEOVER, ONMOUSEOUT
	layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
//	        click: zoomToFeature
    });
}

function regionStyleRegion(feature, layer) {
	var color = getColorFromRegionCode(feature.properties.NSTJ_CODE_REGION);
	return getStyle(color);
}

function regionStyleValue(feature, layer) {
	var color = getColorFromValue(feature.properties.value);
	return getStyle(color);
}

function getColorFromRegionCode(code) {
	var color = "rgb(247,251,255)";
	if (code == "RS11") {
		color = "rgb(222,235,247)";
	} else if (code == "RS12") {
		color = "rgb(198,219,239)";
	} else if (code == "RS21") {
		color = "rgb(158,202,225)";
	} else if (code == "RS22") {
		color = "rgb(107,174,214)";
	} else if (code == "RS23") {
		color = "rgb(66,146,198)";
	}
	
	return color;
}


//FIND STYLE (COLOR) BASED ON THE OBSERVATION VALUE
var whiteColor = "rgb(255,255,255)";
var colorGradeValues = [0, 1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000];
var colors = ["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)",
            "rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)"];

function recalculateColorGradeValues() {
	var range = maxObservationValue - minObservationValue;
	var step = range / colorGradeValues.length;
	var roundStep = Math.round(step / 100000) * 100000;
	
	if (roundStep == 0) {
		roundStep = 100000;
	}
	
	//find the largest multiple of roundStep which is lower than minObservationValue
	var firstRangeValue = 0;
	while (firstRangeValue + roundStep < minObservationValue) {
		firstRangeValue += roundStep;
	}
	
	//create new colorGradeValues elements
	for (var i = 0; i < colorGradeValues.length; i++) {
		colorGradeValues[i] = firstRangeValue + i * roundStep;
	}
}

function getColorFromValue(value) {
	for (var i = colorGradeValues.length - 1; i >= 0; i--) {
		if (value > colorGradeValues[i]) {
			return colors[i];
		}
	}
	return whiteColor;// 0 = No data
}

function regionStyleHash(feature, layer) {
	var color = getColorFromHash(feature.properties.NSTJ_CODE_REGION);
	return getStyle(color);
}

function getStyle(color) {
	return {
	    weight: 2,
	    color: "#999",
	    opacity: 1,
	    fillColor: color,
	    fillOpacity: 0.8
	};
}

function getColorFromHash(code) {
	var value = hashObservationValues[code];
	return getColorFromValue(value);
}

//ADD LAYER TO MAP
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

geojson = L.geoJson(regionsData, {
	style: regionStyleHash,
	onEachFeature: onEachFeature,
}).addTo(map);

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < colorGradeValues.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColorFromValue(colorGradeValues[i] + 1) + '"></i> ' +
            colorGradeValues[i] + (colorGradeValues[i + 1] ? '&ndash;' + colorGradeValues[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);
