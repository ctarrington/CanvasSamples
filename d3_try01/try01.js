$(function() {
	function updateAll()
	{
		updateCircles();
		updateList();
	}
	
	function updateCircles()
	{
		var color = $('input#color').val();
		var circle = svg.selectAll('circle').data(data);
		circle.enter().append('circle')
			.attr("r",  function(d) { return Math.sqrt(2*d.value); })
			.attr("cy", function(d) { return d.y; } )
			.attr("cx", function(d) { return d.x; } )
			.attr("fill", color);
		circle.exit().remove();	
	}
	
	function updateList()
	{
		var li = ul.selectAll("li").data(data);
		li.enter().append("li").text(function (d) { return '('+d.x+', '+d.y+') = '+d.value; });
		li.exit().remove();
	}
	
	function randomInt(max)
	{
	    var raw = Math.random()*max;
	    return Math.round(raw);
	}


	var data = [{x:12, y:10, value: 40}, {x:35, y:35, value: 100}];	

	var ul = d3.select('div#list').append('ul');

	var svg = d3.select('div#circles').append('svg');
	svg.attr('width', 200).attr('height', 200);
	
	
	updateCircles();
	updateList();
	
	$('button#new').click(function() {
		data.push({x:randomInt(200), y:randomInt(200), value:randomInt(200)});
		updateAll();
	});
	
	$('button#remove').click(function() {
		data.shift();
		updateAll();
	});
});

