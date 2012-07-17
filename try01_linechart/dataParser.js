var dataParser = dataParser || {};

(function() {
	
	DataType = {
	DATE: {name: "Date"},
	TIME: {name: "Time"},
	DATE_TIME: {name: "DateTime"},
	SCALAR: {name: "Scalar"},
};
	
	var NUMERIC_DATA = {regexp: /^-?\d+(\.\d+)?\s+/, convertor: parseFloat, dataType: DataType.SCALAR};
	var SHORT_DATE_TIME = {regexp: /^\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}:\d{2}(\.\d+)?\s+/, convertor: convertShortDateTime, dataType: DataType.DATE_TIME};
	var LONG_DATE_TIME = {regexp: /^[a-zA-Z]{3}\s\d{2}\s\d{4}\s\d{2}:\d{2}:\d{2}(\.\d+)?\s+/, convertor: convertLongDateTime, dataType: DataType.DATE_TIME};
	var SHORT_DATE = {regexp: /^\d{2}\/\d{2}\/\d{4}\s+/, convertor: convertShortDate, dataType: DataType.DATE};
	var LONG_DATE = {regexp: /^[a-zA-Z]{3}\s+\d{2}\s+\d{4}\s+/, convertor: convertLongDate, dataType: DataType.DATE};
	var TIME = {regexp: /^\d{2}:\d{2}:\d{2}(\.\d+)?\s+/, convertor: convertTime, dataType: DataType.TIME};	
	var PARSERS = [NUMERIC_DATA, SHORT_DATE_TIME, LONG_DATE_TIME, SHORT_DATE, LONG_DATE, TIME];
	
	
	function isNumber(n) 
	{
  		return !isNaN(parseFloat(n)) && isFinite(n);
	}
	
	function convertShortDate(rawvalue)
	{
		return $.datepicker.parseDate('mm/dd/yy', rawvalue).getTime();
	}
	
	function convertLongDate(rawvalue)
	{
		return $.datepicker.parseDate('M dd yy', rawvalue).getTime();
	}
	
	function convertShortDateTime(rawvalue)
	{
		var d = $.datepicker.parseDate('mm/dd/yy', rawvalue)
		
		var rawtime = rawvalue.substr(11);
		addTimeToDate(d, rawtime);						
		return d.getTime();
	}
	
	function convertLongDateTime(rawvalue)
	{
		var d = $.datepicker.parseDate('M dd yy', rawvalue);
		var rawtime = rawvalue.substr(12);
		addTimeToDate(d, rawtime);		
		return d.getTime();
	}
	
	function convertTime(rawvalue)
	{
		var d = new Date();		
		addTimeToDate(d, rawvalue);						
		return d.getTime();
	}
	
	function addTimeToDate(date, rawtime)
	{
		var elements = rawtime.split(/[:\.]/);
		
		if (elements.length >= 3)
		{
			date.setHours(parseInt(elements[0]));
			date.setMinutes(parseInt(elements[1]));
			date.setSeconds(parseInt(elements[2]));
		}
		
		if (elements.length == 4)
		{
			date.setMilliseconds(elements[3]);
		}
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
				return {match: match, value: convertedValue, dataType: PARSERS[ctr].dataType};
			}
		}
				
		return null;
	}
	
	function parseDataLine(line)
	{
		var dataForLine = {};
		dataForLine.values = [];
		dataForLine.types = [];
		
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
				dataForLine.values.push(data.value);
				dataForLine.types.push(data.dataType);				
			}				
		}
		
		return dataForLine;
	}
	
	function parseOutputFromAnalysis(data)
	{
		var DESCRIPTION_REGEXP = /^\S+/;
		var COLUMN_HEADER_REGEXP = /^\s+[a-zA-Z]+/;
		
		var parsed = {};
		parsed.xaxis = {};
		parsed.yaxis = {};
		
		
		parsed.descriptionLines = [];		
		parsed.columnHeaderLines = [];
		parsed.data = [];
		
		var minX = Number.MAX_VALUE;
		var maxX = -Number.MAX_VALUE;
		
		
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
			if (dataForLine.values.length > 0) 
			{
				parsed.data.push(dataForLine.values);
				parsed.xaxis.dataType = dataForLine.types[0];
				parsed.yaxis.dataType = dataForLine.types[1];
				
				minX = Math.min(minX, dataForLine.values[0]);
				maxX = Math.max(maxX, dataForLine.values[0]);				
				continue;
			}
			
			if (COLUMN_HEADER_REGEXP.test(line))
			{
				parsed.columnHeaderLines.push(line.trim());
				continue;
			}			
			
		}
		
		
		parsed.xaxis.min = minX;
		parsed.xaxis.max = maxX;
		
		return parsed;
	}
	
	// public exposures
	dataParser.DataType = DataType;
	dataParser.parseOutputFromAnalysis = parseOutputFromAnalysis;
	
})();

