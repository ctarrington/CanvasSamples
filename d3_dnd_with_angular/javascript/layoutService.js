angular.module('layout.service', []).
    value('layoutService', (function() {


    // establish data
    var sizes = {
        small: {width: 170, height: 100},
        big: {width: 600, height: 300},
        label: {height: 25},
        spacer:{height: 10}
    };

    var largeDropZones = d3.range(0,2).map(function(item, index) {
        return {
            x: 200,
            y: index*(sizes.big.height+sizes.spacer.height),
            width: sizes.big.width,
            height: sizes.big.height,
            currentResident: null
        };
    });

    var smallDropZones = d3.range(0, 3).map(function(item, index) {
        return {
            x: 850,
            y: index*(sizes.small.height+sizes.label.height+sizes.spacer.height),
            width: sizes.small.width,
            height: sizes.small.height+sizes.label.height,
            currentResident: null
        }
    });

    var dropZones = largeDropZones.concat(smallDropZones);

    var rawBoxes = [
        {title: 'Thing 1'},
        {title: 'Thing 2'},
        {title: 'Thing 3'}
    ];


    // set up representation
    var idToCallbacksMap = {};

    var boxes = rawBoxes.map(function(item, index) {
        var box = {
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
            var rightEdgeDz = dz.x+dz.width;
            var bottomEdgeDz = dz.y+dz.height;
            var rightEdgeBox = box.x + 0.9*sizes.small.width;
            var bottomEdgeBox = box.y + 0.9*sizes.small.height;


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
            .style('width', function(d) { return asPx(d.width); })
            .style('height', function(d) { return asPx(d.height); });


        var boxDivs = d3.select("div#container").selectAll("div.box").data(boxes);

        // only on enter (first time through)
        boxDivs.enter().append('div')
            .attr('class', 'box')
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
            .html(function(d) {
                var labelHtml = d.title;
                return '<span>'+labelHtml+'</span>';
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
