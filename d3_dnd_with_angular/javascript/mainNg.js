var drag = d3.behavior.drag()
    .origin(Object)
    .on("drag", doDrag);

function doDrag(d) {
    d.x = d3.event.x;
    d.y = d3.event.y;
    updateLabelsAndBoxDivs();
}

function updateLabelsAndBoxDivs() {
    var boxDivs = d3.select("div#container").selectAll("div.box").data(boxes);

    // only on enter (first time through)
    boxDivs.enter().append('div')
        .attr('class', 'box')
        .style("background-color", function(d) { return d.color; })
        .html(function(d,ctr) {
            var contentHtml = sprintf('<div id="boxContent%(id)d" class="boxContent" ng-controller="Thing1Ctrl"><input type="text" ng-model="person.name" placeholder="Enter the name" /> {{person}}</div>',{id: ctr} );
            return contentHtml;
        });

    // every time
    boxDivs
        .style('top', function(d) { var newY = d.y+20; return ''+newY+'px'; })
        .style("left", function(d) { return ''+d.x+'px'; });



    var labelDivs = d3.select("div#container").selectAll("div.boxLabel").data(boxes);

    // only on enter (first time through)
    labelDivs.enter().append('div')
        .attr('class', 'boxLabel')
        .style("background-color", function(d) { return d.color; })
        .html(function(d) {
            var labelHtml = d.title;
            return labelHtml;
        })
        .call(drag);

    // every time
    labelDivs
        .style('top', function(d) { return ''+d.y+'px'; })
        .style("left", function(d) { return ''+d.x+'px'; });

}

var boxes = [
    {x:2, y:2, color:'red', title: 'Thing 1'},
    {x:2, y:102, color:'blue', title: 'Thing 2'},
    {x:2, y:202, color:'green', title: 'Thing 3'}
];

angular.module('layout.service', []).
    value('layoutService', {

        register: function(title) {

        },
        onUpdate: function(callback) {

        }
    });

angular.module('DndWithD3App', ['layout.service']);

function Thing1Ctrl($rootScope, $scope, layoutService) {

    $scope.person = {
        name:'Fred',
        height:0
    };
}

updateLabelsAndBoxDivs();
