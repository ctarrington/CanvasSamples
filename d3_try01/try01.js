$(function() {

var ul = d3.select('#circles01').append('ul');

var li = ul.selectAll("li").data([32, 57, 293]);

li.enter().append("li").text(function (d) { return 'data: '+d; });
li.exit().remove();

});