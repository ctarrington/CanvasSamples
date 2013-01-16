
angular.module('layout.service', []).
    value('layoutService', (function() {

    var sizes = {
                small: {width: 170, height: 100},
                big: {width: 600, height: 300},
                label: {height: 20},
                spacer:{height: 10}
            };

        var idToCallbacksMap = {};

        var dropZones = d3.range(0,2).map(function(item, index) {
            return {
                x: 200,
                y: index*(sizes.big.height+sizes.spacer.height),
                width: sizes.big.width,
                height: sizes.big.height,
                currentResident: null
            };
        });

        var rawBoxes = [
            {color:'red', title: 'Thing 1'},
            {color:'blue', title: 'Thing 2'},
            {color:'green', title: 'Thing 3'}
        ];

        var boxes = rawBoxes.map(function(item, index) {
            var box = {
                color: item.color,
                title: item.title,
                id: 'boxContent'+index,
                slot: index,
                x: 0,
                y: 0,
                z: index
            };

            reslot(box);
            return box;
        });

        function reslot(box)
        {
            if (box == null) { return; }

            // move out of old home
            if (box.currentDropZone != null) {
                box.currentDropZone.currentResident = null;
                box.currentDropZone = null;
            }

            // go to old slot
            box.x = 2;
            box.y = box.slot*(sizes.small.height+sizes.label.height+sizes.spacer.height);

            // get small, real small
            box.width = sizes.small.width;
            box.height = sizes.small.height;

            // notify listener
            if (idToCallbacksMap[box.id]) {
                idToCallbacksMap[box.id].smallCallback();
            }
        }

        function occupyDropZone(dz, box)
        {
            // move out of old home
            if (box.currentDropZone != null) { box.currentDropZone.currentResident = null; }

            // kick resident out of my new home
            reslot(dz.currentResident);

            // move into new home
            dz.currentResident = box;
            box.currentDropZone = dz;

            // fill all space
            box.x = dz.x;
            box.y = dz.y;
            box.width = dz.width;
            box.height = dz.height-sizes.label.height;

            // notify listener
            if (idToCallbacksMap[box.id]) {
                idToCallbacksMap[box.id].bigCallback();
            }
        }

        var drag = d3.behavior.drag()
            .origin(Object)
            .on('drag', doDrag)
            .on('dragend', doDragEnd);

        function doDrag(box) {
            box.x = d3.event.x;
            box.y = d3.event.y;
            box.z = 1000;
            idToCallbacksMap[box.id].smallCallback();
            updateView();
        }

        function doDragEnd(box) {
            box.z = box.slot;
            var dropZone = findEnclosingDropZone(box);

            if (dropZone == null)
            {
                reslot(box);
            }
            else
            {
                occupyDropZone(dropZone, box);
            }

            updateView();
        }


        function findEnclosingDropZone(box)
        {
            var matches = dropZones.filter(function(dz) {
                var rightEdgeDz = dz.x+sizes.big.width;
                var bottomEdgeDz = dz.y+sizes.big.height;
                var rightEdgeBox = box.x + sizes.small.width;
                var bottomEdgeBox = box.y + sizes.small.height;


                var horizontalMatch = (box.x >= dz.x && rightEdgeBox <= rightEdgeDz);
                var verticalMatch = (box.y >= dz.y && bottomEdgeBox <= bottomEdgeDz);

                return horizontalMatch && verticalMatch;
            });

            if (matches.length > 0)
            {
                return matches[0];
            }
            return null;
        }

        function asPx(value)
        {
            return ''+value+'px';
        }

        function updateView() {

            var dropZoneDivs = d3.select("div#container").selectAll("div.dropZone").data(dropZones);

            // only on enter (first time through)
            dropZoneDivs.enter().append('div')
                .attr('class', 'dropZone')
                .style('top', function(d) { return asPx(d.y); })
                .style('left', function(d) { return asPx(d.x); })
                .style('width', function(d) { return asPx(sizes.big.width); })
                .style('height', function(d) { return asPx(sizes.big.height); });


            var boxDivs = d3.select("div#container").selectAll("div.box").data(boxes);

            // only on enter (first time through)
            boxDivs.enter().append('div')
                .attr('class', 'box')
                .style("background-color", function(d) { return d.color; })
                .html(function(d,ctr) {
                    var contentHtml = sprintf('<div id="boxContent%(id)d" class="boxContent" ng-controller="Thing1Ctrl"><input type="text" ng-model="person.name" placeholder="Enter the name" /> {{state}} {{person}} </div>',{id: ctr} );
                    return contentHtml;
                });

            // every time
            boxDivs
                .style('top', function(d) { var newY = d.y+20; return asPx(newY); })
                .style("left", function(d) { return asPx(d.x); })
                .style("width", function(d) { return asPx(d.width); })
                .style("height", function(d) { return asPx(d.height); })
                .style('z-index', function(d) { return d.z; });



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
                .style("width", function(d) { return asPx(d.width); })
                .style("height", function(d) { return asPx(sizes.label.height); })
                .style('z-index', function(d) { return d.z; });

        }

        updateView();

        var serviceObject = {
            addSizeListeners: function(boxId, smallCallback, bigCallback) {
                idToCallbacksMap[boxId] = {
                    smallCallback: smallCallback,
                    bigCallback: bigCallback
                };
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

    $scope.state = 'meh';


    function onSmall()
    {
        $scope.$apply(function() {
            $scope.state = 'small';
        });
    }

    function onBig()
    {
        $scope.$apply(function() {
            $scope.state = 'big';
        });
    }

    layoutService.addSizeListeners($element.context.id, onSmall, onBig);
}
