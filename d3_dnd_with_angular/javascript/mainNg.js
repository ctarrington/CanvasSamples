
angular.module('layout.service', []).
    value('layoutService', (function() {

        var SMALL_WIDTH = 170;
        var SMALL_HEIGHT = 100;
        var LABEL_HEIGHT = 20;
        var SPACER = 10;

        var rawBoxes = [
            {color:'red', title: 'Thing 1'},
            {color:'blue', title: 'Thing 2'},
            {color:'green', title: 'Thing 3'}
        ];

        var boxes = rawBoxes.map(function(item, index) {
            return {
                color: item.color,
                title: item.title,
                id: 'boxContent'+index,
                x: 2,
                y: index*(SMALL_HEIGHT+LABEL_HEIGHT+SPACER)
            };
        });

        var drag = d3.behavior.drag()
            .origin(Object)
            .on("drag", doDrag);

        function doDrag(d) {
            d.x = d3.event.x;
            d.y = d3.event.y;
            idToCallbackMap[d.id]('dragging');
            updateLabelsAndBoxDivs();
        }

        function asPx(value)
        {
            return ''+value+'px';
        }

        function updateLabelsAndBoxDivs() {
            var boxDivs = d3.select("div#container").selectAll("div.box").data(boxes);

            // only on enter (first time through)
            boxDivs.enter().append('div')
                .attr('class', 'box small')
                .style("background-color", function(d) { return d.color; })
                .html(function(d,ctr) {
                    var contentHtml = sprintf('<div id="boxContent%(id)d" class="boxContent" ng-controller="Thing1Ctrl"><input type="text" ng-model="person.name" placeholder="Enter the name" /> {{state}} {{person}} </div>',{id: ctr} );
                    return contentHtml;
                });

            // every time
            boxDivs
                .style('top', function(d) { var newY = d.y+20; return asPx(newY); })
                .style("left", function(d) { return asPx(d.x); })
                .style("width", function(d) { return asPx(SMALL_WIDTH); })
                .style("height", function(d) { return asPx(SMALL_HEIGHT); });



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
                .style('top', function(d) { return asPx(d.y); } )
                .style("left", function(d) { return asPx(d.x); } )
                .style("width", function(d) { return asPx(SMALL_WIDTH); })
                .style("height", function(d) { return asPx(LABEL_HEIGHT); });

        }

        updateLabelsAndBoxDivs();

            var idToCallbackMap = {};

            var serviceObject = {
                addSizeListener: function(boxId, callback) {
                    idToCallbackMap[boxId] = callback;
                }
            };

        return serviceObject;
}()));

angular.module('DndWithD3App', ['layout.service']);

function Thing1Ctrl($rootScope, $scope, $element, layoutService) {

    $scope.person = {
        name:'Fred',
        height:0
    };

    $scope.state = 'small';


    function onResize(state)
    {
        $scope.$apply(function() {
            $scope.state = state;
        });
    }

    layoutService.addSizeListener($element.context.id, onResize);
}
