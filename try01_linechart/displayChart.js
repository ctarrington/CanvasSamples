$(document).ready(function() {
	
	var NUMERIC_DATA_REGEXP = /^\d+\.{0,1}\d+\s+/;
	var SHORT_DATE_TIME_REGEXP = /^\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}:\d{2}(\.\d+){0,1}\s+/;
	var LONG_DATE_TIME_REGEXP = /^^[a-zA-Z]{3}\s+\d{2}\s+\d{4}\s\d{2}:\d{2}:\d{2}(\.\d+){0,1}\s+/;
	var SHORT_DATE_REGEXP = /^\d{2}\/\d{2}\/\d{4}\s+/;
	var LONG_DATE_REGEXP = /^[a-zA-Z]{3}\s+\d{2}\s+\d{4}\s+/;		
	var EXPRESSIONS = [NUMERIC_DATA_REGEXP, SHORT_DATE_TIME_REGEXP, LONG_DATE_TIME_REGEXP, SHORT_DATE_REGEXP, LONG_DATE_REGEXP];
	
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
	
	
	function isNumber(n) 
	{
  		return !isNaN(parseFloat(n)) && isFinite(n);
	}

	function parseNextData(line)
	{		
		var match = null;
		
		for (var ctr=0;ctr<EXPRESSIONS.length;ctr++)
		{
			var matches = line.match(EXPRESSIONS[ctr]);
			
			if (matches) 
			{
				match = matches[0].trim();
				break;
			}
		}
				
		return match;		
	}
	
	function parseDataLine(line)
	{
		var dataForLine = [];
		while (true)
		{
			line = line.trim() +' ';  // we need a space at the end of the line, as the regexps use the space as part of the match
			var data = parseNextData(line);
								
			if (!data)
			{
				break;
			}
			else
			{
				line = line.substr(data.length);
				if (isNumber(data))
				{
					data = parseFloat(data);
				}
				dataForLine.push(data);				
			}				
		}
		
		return dataForLine;
	}
	
	function parseOutputFromFreeFlyer(data)
	{
		var DESCRIPTION_REGEXP = /^\S+/;
		var COLUMN_HEADER_REGEXP = /^\s+[a-zA-Z]+/;
		
		var parsed = {};
		parsed.descriptionLines = [];		
		parsed.columnHeaderLines = [];
		parsed.dataLines = [];
		parsed.data = [];
		
		var lines = data.split("\n");		
		for (var ctr=0; ctr<lines.length;ctr++)
		{
			var line = lines[ctr];
			
			if (line.trim().length == 0)
			{
				continue;
			}	
			
			if (DESCRIPTION_REGEXP.test(line))
			{
				parsed.descriptionLines.push(line.trim());
				continue;
			}
			
			var dataForLine = parseDataLine(line);
			if (dataForLine.length > 0) 
			{
				parsed.data.push(dataForLine);
				continue;
			}
			
			if (COLUMN_HEADER_REGEXP.test(line))
			{
				parsed.columnHeaderLines.push(line.trim());
				continue;
			}
			
			
		}
		
		return parsed;
	}
	
	
	function processData(data)
	{
		var parsed = parseOutputFromFreeFlyer(data);
		var data = parsed.data;
		
		config.graphset[0].series[0].values = data;
		
		zingchart.render({
			data : config,
			width : 460,
			height : 460,
			container : 'zingchart'
		});
		
	}
	
	$.get('short_formatted_longdate_vs_decimal.txt', processData);

});