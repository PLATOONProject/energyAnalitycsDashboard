/*
 * Creates Highstock chart
 * @param {String} containerName 
 * @param {Array} chartData - Array of [<milliseconds since Jan 1st 1970>, value]
 * @return {String} titleText
 * @return {String} subtitleText
 * @return {String} seriesName
 * @return {String} chartType - 'line' or 'column'
 * @return {String} granularity - for label formatting - 'Y' or 'M' or 'D'
 */
 
function createTimeChart(containerName, chartData, titleText, subtitleText, seriesName, chartType, granularity) {
	var labelFormatM = '%Y';
	var labelFormatW = '%Y';
	var labelFormatD = '%Y';
	if (granularity === 'M') {
		labelFormatM = '%Y-%m';
		labelFormatW = '%Y-%m';
		labelFormatD = '%Y-%m';
	} else if (granularity === 'D') {
		labelFormatM = '%Y-%m';
		labelFormatW = '%Y<br/>%m-%d';
		labelFormatD = '%Y<br/>%m-%d';
	}
	
	chart = Highcharts.chart('container', {

    title: {
        text: 'Solar Employment Growth by Sector, 2010-2016'
    },

    subtitle: {
        text: 'Source: thesolarfoundation.com'
    },

    yAxis: {
        title: {
            text: 'Number of Employees'
        }
    },

    xAxis: {
        accessibility: {
            rangeDescription: 'Range: 2010 to 2017'
        }
    },

    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
    },

    plotOptions: {
        series: {
            label: {
                connectorAllowed: false
            },
            pointStart: 2010
        }
    },

    series: [{
        name: 'Installation',
        data: [43934, 52503, 57177, 69658, 97031, 119931, 137133, 154175]
    }, {
        name: 'Manufacturing',
        data: [24916, 24064, 29742, 29851, 32490, 30282, 38121, 40434]
    }, {
        name: 'Sales & Distribution',
        data: [11744, 17722, 16005, 19771, 20185, 24377, 32147, 39387]
    }, {
        name: 'Project Development',
        data: [null, null, 7988, 12169, 15112, 22452, 34400, 34227]
    }, {
        name: 'Other',
        data: [12908, 5948, 8105, 11248, 8989, 11816, 18274, 18111]
    }],

    responsive: {
        rules: [{
            condition: {
                maxWidth: 500
            },
            chartOptions: {
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom'
                }
            }
        }]
    }

});
	
	chart.redraw();
	
	$('#' + containerName).show('slow', function() {
	    // Animation complete.
	});
}
