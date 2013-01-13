var drag = d3.behavior.drag()
    .origin(Object)
    .on("drag", doDrag);

function doDrag(d) {
    d.x = d3.event.x;
    d.y = d3.event.y;
    updateBoxDivs();
}

function updateBoxDivs() {
    var boxDivs = d3.select("div#container").selectAll("div.box").data(boxes);

    // only on enter (first time through)
    boxDivs.enter().append('div')
        .attr('class', 'box')
        .call(drag)
        .style("background-color", function(d) { return d.color; })
        .html(function(d,ctr) {
            var labelHtml = sprintf('<div class="boxLabel">%(title)s</div>', d);
            var contentHtml = sprintf('<div id="boxContent%(id)d" class="boxContent"><a href="http://www.google.com">Click Me</a></div>',{id: ctr} );

            return labelHtml+contentHtml;
        });

    // every time
    boxDivs
        .style('top', function(d) { return ''+d.y+'px'; })
        .style("left", function(d) { return ''+d.x+'px'; });

}

var boxes = [
    {x:2, y:2, color:'red', title: 'Thing 1'},
    {x:2, y:102, color:'blue', title: 'Thing 2'},
    {x:2, y:202, color:'green', title: 'Thing 3'}
];

updateBoxDivs();


