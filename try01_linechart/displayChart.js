$(document).ready(function() {
	
	var config = {
		graphset: [
		{plot:{exact:true, decimals:4},
		 type: 'line',
		 series: [{"line-width":1, values: [5, 12, 18, 0, 10, 5]}]
		}]
	};
	
	function processData(data)
	{
		console.log("data: "+data);
		var raw_values = data.split(',');
		var values = [];
		
		for (var ctr=0;ctr<raw_values.length;ctr++)
		{
			values[ctr] = parseFloat(raw_values[ctr], 10);
		}

		
		console.log("values: "+values);
		
		config.graphset[0].series[0].values = values;
		
		zingchart.render({
			data : config,
			width : 460,
			height : 460,
			container : 'zingchart'
		});
		
	}
	
	$.get('oneline.dat', processData);

});