var dataParser = dataParser || {};

(function() {
	
	DataType = {
	DATE: {name: "Date"},
	TIME: {name: "Time"},
	DATE_TIME: {name: "DateTime"},
	SCALAR: {name: "Scalar"},
	STRING: {name: "String"},
};
	
	var NUMERIC_DATA = {regexp: /^-?\d+(\.\d+)?\s+/, convertor: parseFloat, dataType: DataType.SCALAR};
	var SHORT_DATE_TIME = {regexp: /^\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}:\d{2}(\.\d+)?\s+/, convertor: convertShortDateTime, dataType: DataType.DATE_TIME};
	var LONG_DATE_TIME = {regexp: /^[a-zA-Z]{3}\s\d{2}\s\d{4}\s\d{2}:\d{2}:\d{2}(\.\d+)?\s+/, convertor: convertLongDateTime, dataType: DataType.DATE_TIME};
	var SHORT_DATE = {regexp: /^\d{2}\/\d{2}\/\d{4}\s+/, convertor: convertShortDate, dataType: DataType.DATE};
	var LONG_DATE = {regexp: /^[a-zA-Z]{3}\s+\d{2}\s+\d{4}\s+/, convertor: convertLongDate, dataType: DataType.DATE};
	var TIME = {regexp: /^\d{2}:\d{2}:\d{2}(\.\d+)?\s+/, convertor: convertTime, dataType: DataType.TIME};
	var COLUMN_HEADER =  {regexp: /^(\S\s?)+/, convertor: null, dataType: DataType.STRING};
	var PARSERS = [NUMERIC_DATA, SHORT_DATE_TIME, LONG_DATE_TIME, SHORT_DATE, LONG_DATE, TIME, COLUMN_HEADER];
	
	var CURRENT_DATE = new Date();
	
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
		var d = new Date(CURRENT_DATE.getTime());		
		addTimeToDate(d, rawvalue);						
		return d.getTime();
	}
	
	function addTimeToDate(date, rawtime)
	{
		var elements = rawtime.split(/[:\.]/);
		
		if (elements.length >= 3)
		{
			date.setHours(parseInt(elements[0], 10));
			date.setMinutes(parseInt(elements[1], 10));
			date.setSeconds(parseInt(elements[2], 10));
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
								
			if (!data || data.value === null)
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
	
	function ensureSequence(parsed, sequenceIndex)
	{
		if (!parsed.sequences[sequenceIndex])
		{
			parsed.sequences[sequenceIndex] = {};
			parsed.sequences[sequenceIndex].dataPairs = [];
			parsed.sequences[sequenceIndex].headers = [];
		}
	}
	
	function parseOutputFromAnalysis(data)
	{
		var DESCRIPTION_REGEXP = /^\S+/;
		
		var parsed = {};
		parsed.xaxis = {};
		parsed.xaxis.min = Number.MAX_VALUE;
		parsed.xaxis.max = -Number.MAX_VALUE;
		parsed.xaxis.dataType = null;
		parsed.xaxis.headers = [];
		
		parsed.sequences = [];
		
		parsed.descriptionLines = [];		
		parsed.columnHeaderLines = [];
		
		
		var lines = data.split("\n");	
		for (var line_ctr=0; line_ctr<lines.length;line_ctr++)
		{
			var line = lines[line_ctr];
			
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
				if (dataForLine.types[0] === DataType.STRING)  // column headers
				{
					parsed.xaxis.headers.push(dataForLine.values[0]);
					
					for (var ctr=1; ctr < dataForLine.values.length; ctr++)
					{
						ensureSequence(parsed, ctr-1);
						
						var seq = parsed.sequences[ctr-1];
						seq.headers.push([dataForLine.values[ctr]]);
					}
				}
				else  // data
				{
					parsed.xaxis.dataType = dataForLine.types[0];				
					parsed.xaxis.min = Math.min(parsed.xaxis.min, dataForLine.values[0]);
					parsed.xaxis.max = Math.max(parsed.xaxis.max, dataForLine.values[0]);
					
					var xvalue = dataForLine.values[0];
					
					for (var ctr=1; ctr < dataForLine.values.length; ctr++)
					{
						ensureSequence(parsed, ctr-1);
						
						var seq = parsed.sequences[ctr-1];
						seq.dataPairs.push([xvalue, dataForLine.values[ctr]]);
						seq.dataType = dataForLine.types[ctr];
					}
				}
				
				continue;
			}			
			
		}
		
		return parsed;
	}
	
	// public exposures
	dataParser.DataType = DataType;
	dataParser.parseOutputFromAnalysis = parseOutputFromAnalysis;
	
})();

