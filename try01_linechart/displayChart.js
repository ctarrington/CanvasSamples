$(document).ready(function() {
	
	var configLine = {
		graphset: [
		{plot:{exact:true, decimals:4},
		 type: 'line',
		 series: [{"line-width":1}]
		}]
	};
	
	var configScatter = {
		graphset: [
		{plot:{exact:true, decimals:4},
		 type: 'scatter',
		 series: [{"line-width":1, marker: {size: 1}, values: null}]
		}]
	};
	
	var config = configLine;
	
	function parseFormattedData(data)
	{
		var HEADER_REGEXP = /^\w.*[\r\f\n]+$/;
		
		var parsed = {};
		parsed.headers = [];
		
		var lines = data.split("\n");		
		for (var ctr=0; ctr<lines.length;ctr++)
		{
			var line = lines[ctr];	
			var found = HEADER_REGEXP.test(line);	
			if (found)
			{
				parsed.headers.push(line.trim());
			}
		}
		
		return parsed;
	}
	
	
	function processData(data)
	{
		var parsed_data = parseFormattedData(data);
		
		console.log("data: "+data);
		var raw_values = data.split(',');
		var values = [];
		
		for (var ctr=0;ctr<raw_values.length;ctr++)
		{
			values[ctr] = parseFloat(raw_values[ctr], 10);
		}

		/*var interval = Math.PI/50;
    	values = [];
    	for (var ctr = 0; ctr < 2*100; ctr++) 
    	{
    		var y = 10 * Math.sin(ctr * interval) + 3 * Math.sin(ctr * interval * 4) + 1 * Math.sin(ctr * interval * 8);
        	values[ctr] = [ctr, y];
    	}*/
    	
    	//values = [[1,3], [2,5], [4,8], [1,7],[2,10]];
		
		console.log("values: "+values.join());
		
		config.graphset[0].series[0].values = values;
		
		zingchart.render({
			data : config,
			width : 460,
			height : 460,
			container : 'zingchart'
		});
		
	}
	
	$.get('short_formatted_longdate_vs_decimal.txt', processData);

});