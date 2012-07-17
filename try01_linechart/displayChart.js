$(document).ready(function() {
	
	var NUMERIC_DATA_REGEXP = {regexp: /^\d+\.{0,1}\d+\s+/, convertor: parseFloat};
	var SHORT_DATE_TIME_REGEXP = {regexp: /^\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}:\d{2}(\.\d+){0,1}\s+/, convertor: null};
	var LONG_DATE_TIME_REGEXP = {regexp: /^^[a-zA-Z]{3}\s+\d{2}\s+\d{4}\s\d{2}:\d{2}:\d{2}(\.\d+){0,1}\s+/, convertor: null};
	var SHORT_DATE_REGEXP = {regexp: /^\d{2}\/\d{2}\/\d{4}\s+/, convertor: convertShortDate};
	var LONG_DATE_REGEXP = {regexp: /^[a-zA-Z]{3}\s+\d{2}\s+\d{4}\s+/, convertor: null};	
	var PARSERS = [NUMERIC_DATA_REGEXP, SHORT_DATE_TIME_REGEXP, LONG_DATE_TIME_REGEXP, SHORT_DATE_REGEXP, LONG_DATE_REGEXP];
	
	var configLine = {
		graphset: [
		{plot:{exact:true, decimals:4},
		 type: 'line',
		 "scale-x":{
            "max-items":5,
            "min-value":1339992000000-1000*60*60*24,
            "step":1000*60,
            "transform":{
                "type":"date",
                "all":"%D, %d %M %Y<br />%h:%i %A"
            }},
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
	
	function convertShortDate(rawvalue)
	{
		return $.datepicker.parseDate('mm/dd/yy', rawvalue).getTime();
	}

	function parseNextData(line)
	{		
		var match = null;
		
		for (var ctr=0;ctr<PARSERS.length;ctr++)
		{
			var matches = line.match(PARSERS[ctr].regexp);
			
			if (matches) 
			{
				match = matches[0].trim();
				var convertedValue = match;
				
				if (PARSERS[ctr].convertor)
				{
					convertedValue = PARSERS[ctr].convertor(match);
				}
				return {match: match, value: convertedValue};
			}
		}
				
		return null;
	}
	
	function parseDataLine(line)
	{
		var dataForLine = [];
		while (true)
		{
			line = line.trim() +' ';  // we need a space at the end of the line, as the regexps use the space as part of the match
			var data = parseNextData(line);
								
			if (!data || !data.value)
			{
				break;
			}
			else
			{
				line = line.substr(data.match.length);
				if (isNumber(data.value))
				{
					data.value = parseFloat(data.value);
				}
				dataForLine.push(data.value);				
			}				
		}
		
		return dataForLine;
	}
	
	function parseOutputFromAnalysis(data)
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
	
	
	function processData(rawdata)
	{
		var parsed = parseOutputFromAnalysis(rawdata);
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