$(document).ready(function() {
	
	var DATATYPE_TO_TRANSFORM = {};
	DATATYPE_TO_TRANSFORM[dataParser.DataType.DATE.name] = {type: "date", all:"%D, %d %M %Y"};
	DATATYPE_TO_TRANSFORM[dataParser.DataType.DATE_TIME.name] = {type: "date", all:"%D, %d %M %Y<br />%h:%i %A"};
	DATATYPE_TO_TRANSFORM[dataParser.DataType.TIME.name] = {type: "date", all:"%h:%i"};
	
	var config = {
		graphset: [
		{plot:{exact:true, decimals:4},
		 type: 'line',
		 "scale-y":{
		 	"zooming":true,
		 	"min-value":"auto"
		 },
         "scale-x":{
         	"zooming":true,
            "min-value":null
         },            
		 series: []
		}]
	};
	
	
	function processData(rawdata)
	{
		var parsed = dataParser.parseOutputFromAnalysis(rawdata);
		var data = parsed.data;
		
		for (var series_ctr=0; series_ctr < data[0].length-1;series_ctr++)
		{
			config.graphset[0].series[series_ctr] = {"line-width": 1};					
			config.graphset[0].series[series_ctr].values = [];
			
			for (var row_ctr = 0; row_ctr < data.length; row_ctr++)
			{
				config.graphset[0].series[series_ctr].values[row_ctr] = [data[row_ctr][0], data[row_ctr][series_ctr+1]];
			}			
		}
		
		config.graphset[0]["scale-x"]["min-value"] = parsed.xaxis.min;
		
		if (parsed.xaxis.dataType && DATATYPE_TO_TRANSFORM[parsed.xaxis.dataType.name])
		{
			config.graphset[0]["scale-x"].transform = DATATYPE_TO_TRANSFORM[parsed.xaxis.dataType.name];
		}
		
		if (parsed.yaxis.dataType && DATATYPE_TO_TRANSFORM[parsed.yaxis.dataType.name])
		{
			config.graphset[0]["scale-y"].transform = DATATYPE_TO_TRANSFORM[parsed.yaxis.dataType.name];
		}		
		
		zingchart.render({
			data : config,
			width : 460,
			height : 460,
			container : 'zingchart'
		});
		
	}
	
	$.get('short_formatted_longdate_vs_decimal.txt', processData);
	//$.get('formatted_dt_vs_decimals.txt', processData);
	
	
	

});