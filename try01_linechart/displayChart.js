var config = {
	graphset: [{type: 'line',
	series: [{values: [5, 10, 15, 0, 10, 5]}]
	}]
};

window.onload = function() {
	zingchart.render({
		data : config,
		width : 460,
		height : 460,
		container : 'zingchart'
	});
}