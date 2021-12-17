  	  var data;
	  var data1;
	  var data2;
	  var drawReady = 0;
	  var mode = 0;

	  $(document).ready(function(){
		  $("#air_temperature").click(function(){
			  drawReady = 0;
			  mode = 1;
			  getAirTemperature();
	      });
		  
		  $("#panel_temperature").click(function(){
			  drawReady = 0;
			  mode = 1;
			getPanelTemperature();
	      });
		  
		  $("#temperatures").click(function(){
			  drawReady = 0;
			  mode = 2;
			getAirTemperature();
			getPanelTemperature();
	      });
		  
		  $("#get_data").click(function(){
			 if(document.getElementById("air_temperature_cb").checked && document.getElementById("panel_temperature_cb").checked){
				drawReady = 0;
				mode = 2;
				getAirTemperature();
				getPanelTemperature();
				$("#container").html('<div style="margin: auto; width: 200px; position: relative; top: 150px; font-family: Arial, Helvetica, sans-serif; font-size: 40px; font-weight: bold;">Loading...</div>');
			 } 
			 else if(document.getElementById("air_temperature_cb").checked){
				drawReady = 0;
				mode = 1;
				getAirTemperature();
				$("#container").html('<div style="margin: auto; width: 200px; position: relative; top: 150px; font-family: Arial, Helvetica, sans-serif; font-size: 40px; font-weight: bold;">Loading...</div>');
			 }
			 else if(document.getElementById("panel_temperature_cb").checked){
				drawReady = 0;
				mode = 1;
				getPanelTemperature();
				$("#container").html('<div style="margin: auto; width: 200px; position: relative; top: 150px; font-family: Arial, Helvetica, sans-serif; font-size: 40px; font-weight: bold;">Loading...</div>');
			 }
		  });
	  });
	  
	  var getAirTemperatureResults = function(results){
		  results = results.results.bindings;
		  var prefix = "http://platoon.eu/SolarArray/Pilot2A/Observation/1/AirTemperatureEvaluation/";
		  data = []
		  for(var i = 0; i < results.length; i++){
			  var uri = results[i].air_temperature.value;
			  if(!uri.startsWith(prefix))
				  continue;
			  var dateTime = uri.substring(prefix.length, uri.length);
			  var value = results[i].value.value;
			  var dt = dateTime.split("T");
			  var date = dt[0].split("-");
			  var time = dt[1].split(":");
			  data.push([Date.UTC(date[0], date[1], date[2], time[0], time[1], time[2]), parseFloat(value)]);
		  }
		  data = data.sort((a, b) =>{
			return a[0] - b[0];
		  });
		  
		  data = filterData(data);
		  
		  if(mode == 2){
			  drawReady++;
			  data1 = data;
			  if(drawReady == 2)
				  draw2(data1, data2, $("#fromDate").val() + " - " + $("#toDate").val());
		  }
		  else{
			  draw(data, 'Air temperature', $("#fromDate").val() + " - " + $("#toDate").val(), 'Air temperature');
		  }
		  
		  return data;
	  }
	  
	  var getPanelTemperatureResults = function(results){
		  results = results.results.bindings;
		  var prefix = "http://platoon.eu/SolarArray/Pilot2A/Observation/1/PanelTemperatureEvaluation/";
		  data = []
		  for(var i = 0; i < results.length; i++){
			  var uri = results[i].panel_temperature.value;
			  if(!uri.startsWith(prefix))
				  continue;
			  var dateTime = uri.substring(prefix.length, uri.length);
			  var value = results[i].value.value;
			  var dt = dateTime.split("T");
			  var date = dt[0].split("-");
			  var time = dt[1].split(":");
			  data.push([Date.UTC(date[0], date[1], date[2], time[0], time[1], time[2]), parseFloat(value)]);
		  }
		  data = data.sort((a, b) =>{
			return a[0] - b[0];
		  });
		  
		  data = filterData(data);
		  
		  if(mode == 2){
			  drawReady++;
			  data2 = data;
			  if(drawReady == 2)
				  draw2(data1, data2, $("#fromDate").val() + " - " + $("#toDate").val());
		  }
		  else{
			  draw(data, 'Temperature of PV panel', $("#fromDate").val() + " - " + $("#toDate").val(), 'Temperature of PV panel');
		  }
		  return data;
	  }
	  
	  
	  function filterData(data){
		  var fromDate = $("#fromDate").val();
		  var toDate = $("#toDate").val();
		  if(fromDate == "" || toDate == "")
			  return data;
		  frd = fromDate.split("-");
		  frD = Date.UTC(frd[0], frd[1] - 1, frd[2]);
		  tod = toDate.split("-");
		  toD = Date.UTC(tod[0], parseInt(tod[1]) - 1, tod[2]);
		  var lb = 0;
		  var ub = data.length;
		  for(var i = 0; i < data.length; i++){
			  if(data[i][0] < frD)
				  lb++;
			  if(data[i][0] > toD){
				  ub = i;
				  break;
			  }
		  }
		  return data.slice(lb, ub);
	  }
	  
	  
	  function draw(data, title, subtitle, dataName){
		  const chart = Highcharts.chart('container', {
			chart: {
				zoomType: 'x'
			},

			title: {
				text: title
			},

			subtitle: {
				text: subtitle
			},

			tooltip: {
				valueDecimals: 2
			},

			xAxis: {
				type: 'datetime'
			},

			series: [{
				data: data,
				lineWidth: 0.5,
				name: dataName
			}]
		});	
	  }
	  
	  function draw2(data1, data2, subtitle){
		  const chart = Highcharts.chart('container', {
			chart: {
				zoomType: 'x'
			},

			title: {
				text: 'Comparsion of air and panel temperatures'
			},

			subtitle: {
				text: 'Jul \'16 - May \'18'
			},

			tooltip: {
				valueDecimals: 2
			},

			xAxis: {
				type: 'datetime'
			},

			series: [{
				data: data1,
				lineWidth: 0.5,
				name: 'Air temperature'
			},
			{
				data: data2,
				lineWidth: 0.5,
				name: 'Panel temperature'
			}]
		});	
	  }
	  
	  function getAirTemperature(){
		  var sparqlQuery="PREFIX seas: <https://w3id.org/seas/> " +
		  "SELECT DISTINCT ?air_temperature ?value " +
		  "WHERE { ?air_temperature seas:evaluatedSimpleValue ?value. " +
		  'FILTER(regex(?air_temperature, "AirTemperature", "i")) }';
		  
		  var endpoint = 'http://147.91.50.174:8891/sparql';
		  var queryUrlEncoded = endpoint + '?query=' + $.URLEncode(sparqlQuery);
		  $.getJSON(queryUrlEncoded, getAirTemperatureResults);
	  }
	  
	  function getPanelTemperature(){
		  var sparqlQuery="PREFIX seas: <https://w3id.org/seas/> " +
		  "SELECT DISTINCT ?panel_temperature ?value " +
		  "WHERE { ?panel_temperature seas:evaluatedSimpleValue ?value. " +
		  'FILTER(regex(?panel_temperature, "PanelTemperature", "i")) }';
		  
		  var endpoint = 'http://147.91.50.174:8891/sparql';
		  var queryUrlEncoded = endpoint + '?query=' + $.URLEncode(sparqlQuery);
		  $.getJSON(queryUrlEncoded, getPanelTemperatureResults);
	  }
	  
	  
	  
    	  