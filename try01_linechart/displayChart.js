$(document).ready(function() {
	
	function processData(rawdata)
	{
		var parsed = dataParser.parseOutputFromAnalysis(rawdata);
		
		var params = {};
		params.plotTitle = 'A Title for the Plot';
		params.plotSubtitle = 'A subtitle';
		
		
		zingCharter.createChart('zingchart', parsed, params);
	}
	
	$.get('short_formatted_longdate_vs_decimal.txt', processData);
	//$.get('formatted_dt_vs_decimals.txt', processData);
});