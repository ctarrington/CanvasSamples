var zingCharter = zingCharter || {};

(function() {
	
	var DATATYPE_TO_TRANSFORM = {};
	DATATYPE_TO_TRANSFORM[dataParser.DataType.DATE.name] = {type: "date", all:"%D, %d %M %Y"};
	DATATYPE_TO_TRANSFORM[dataParser.DataType.DATE_TIME.name] = {type: "date", all:"%D, %d %M %Y<br />%h:%i %A"};
	DATATYPE_TO_TRANSFORM[dataParser.DataType.TIME.name] = {type: "date", all:"%h:%i"};
	
	var gui = {behaviors: [/*{id:"ViewSource",enabled:"none"},*/ {id:"BugReport",enabled:"none"},{id:"LogScale",enabled:"none"}]};
	
	var plotarea = {
		"position":"0% 0%",
		"margin-top":60,
		"margin-right":50,
		"margin-left":50,
		"margin-bottom":100
	};
	
	var graphsetTitle = {
		text: null,
	 	"background-color":"#def",        
        "position":"0% 0%",
        "height":47,
        "font-size":18,
        "padding-top":-5,
        "margin-top":10,
        "margin-right":0,
        "margin-left":0,
        "margin-bottom":10,
        "color":"#000"
    };
    
    var graphsetSubtitle = {text:null, color:"#000"};
    
    var guide = {
            "visible":true,
            "alpha":1,
            "tooltip-text":"%v",
            "line-color":"#000000",
            "line-width":1,
            "line-gap-size":0,
            "decimals":2
    };
      
    var legend = {
    		"position":"0% 85%",
            "margin-left":10,
            "margin-right":10,
            "margin-top":10,
            "margin-bottom":10,
            "layout":"1x",
            "alpha":0.63,
            "background-color":"#def",
            "draggable":false,
            "drag-handler":"icon",
            "minimize": false,
            "item":{
                "toggle":true,
                "toggle-action":"hide"
            },
            "footer":{
                "text":"Click item to toggle visibility.",
                "color":"#000",
                "alpha":1,
                "background-color":"#9be"
            }
    };
	
	var config = {
		gui: gui, 
		exact:true,
		graphset: [
		{
		 plotarea: plotarea,
		 title: graphsetTitle,
		 subtitle: graphsetSubtitle,
		 legend: legend,
		 guide: guide,
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
	
	function createChart(containerId, parsedData, params)
	{
		// populate config from params or use defaults
		var params = params || {};
		graphsetTitle.text = params.plotTitle || "Default Title";
		graphsetSubtitle.text = params.plotSubtitle || "";
		
		var sequences = parsedData.sequences;
		for (var sequence_ctr = 0; sequence_ctr < sequences.length; sequence_ctr++)
		{
			config.graphset[0].series[sequence_ctr] = {"line-width": 1};
			config.graphset[0].series[sequence_ctr].values = sequences[sequence_ctr].dataPairs;
			config.graphset[0].series[sequence_ctr].text = sequences[sequence_ctr].headers[0];
		}
		
		config.graphset[0]["scale-x"]["min-value"] = parsedData.xaxis.min;
		
		if (parsedData.xaxis.dataType && DATATYPE_TO_TRANSFORM[parsedData.xaxis.dataType.name])
		{
			config.graphset[0]["scale-x"].transform = DATATYPE_TO_TRANSFORM[parsedData.xaxis.dataType.name];
		}
		
		if (sequences[0].dataType && DATATYPE_TO_TRANSFORM[sequences[0].dataType.name])
		{
			config.graphset[0]["scale-y"].transform = DATATYPE_TO_TRANSFORM[sequences[0].dataType.name];
		}
		
		if (parsedData.xaxis.dataType === DataType.SCALAR)
		{
			delete config.graphset[0].guide;
		}		
		
		zingchart.render({
			data : config,
			width : 460,
			height : 460,
			container : containerId
		});
	}
	
	
	// public exposures
	zingCharter.createChart = createChart;
	
})();
