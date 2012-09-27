$(function() {

var data = [{x:12, y:10, value: 40}, {x:35, y:35, value: 100}];

var ul = d3.select('div#list').append('ul');

var li = ul.selectAll("li").data(data);

li.enter().append("li").text(function (d) { return '('+d.x+', '+d.y+') = '+d.value; });
li.exit().remove();



var svg = d3.select('div#circles').append('svg');
svg.attr('width', 200).attr('height', 200);
svg.selectAll('circle').data(data).enter().append('circle');

d3.selectAll("circle")
	.attr("r",  function(d) { return Math.sqrt(2*d.value); } )
	.attr("cy", function(d) { return d.y; } )
	.attr("cx", function(d) { return d.x; } );

});