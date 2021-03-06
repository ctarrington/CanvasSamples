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
        {title: 'Thing 1', controller: 'Thing1Ctrl', partial: 'thing1'},
        {title: 'Thing 2', controller: 'Thing1Ctrl', partial: 'thing1'},
        {title: 'Thing 3', controller: 'Thing1Ctrl', partial: 'thing1'}
    ];

    var dropZoneAssignments = [
        {boxIndex: 0, dzIndex: 2},
        {boxIndex: 1, dzIndex: 3},
        {boxIndex: 2, dzIndex: 4}
    ]


    // set up representation
    var idToCallbacksMap = {};

    var boxes = rawBoxes.map(function(item, index) {
        var box = {
            title: item.title,
            controller: item.controller,
            partial: item.partial,
            id: 'boxContent'+index,
            index: index,
            defaultZ: index,
            x: 0,
            y: 0,
            z: index
        };
        return box;
    });

    for (var ctr = 0; ctr < dropZoneAssignments.length; ctr++)
    {
        var assignment = dropZoneAssignments[ctr];
        var dz = dropZones[assignment.dzIndex];
        var box = boxes[assignment.boxIndex];
        occupyDropZone(dz, box);
    }

    function findBoxById(boxId)
    {
        var matches = boxes.filter(function(box) {
            return (box.id === boxId);
        });

        return (matches.length > 0) ? matches[0] : null;
    }

    function notifySizeChangedListeners(box)
    {
        if (box != null && idToCallbacksMap[box.id]) {
            idToCallbacksMap[box.id].sizeChangedCallback({width: box.width, height: box.height});
        }
    }

    function fitToDropZone(box)
    {
        // fill all space
        var dz = box.currentDropZone;
        box.x = dz.x;
        box.y = dz.y;
        box.width = dz.width;
        box.height = dz.height-sizes.label.height;
    }

    // move out of current drop zone and displace the currentResident
    function occupyDropZone(dz, box)
    {
        // stash the current state
        var oldDz = box.currentDropZone;
        var displacedBox = dz.currentResident;


        // what do we do with the old resident
        if (oldDz != null && displacedBox == null) // moving from somewhere to empty
        {
            oldDz.currentResident = null;
            dz.currentResident = box;
            box.currentDropZone = dz;
            fitToDropZone(box);
        }
        else if (oldDz != null && displacedBox != null) // moving to occupied, so switch
        {
            oldDz.currentResident = displacedBox;
            displacedBox.currentDropZone = oldDz;
            fitToDropZone(displacedBox);
        }

        // box moves into the the dz
        dz.currentResident = box;
        box.currentDropZone = dz;
        fitToDropZone(box);

        // notify listeners
        notifySizeChangedListeners(box);
        notifySizeChangedListeners(displacedBox);
    }

    var drag = d3.behavior.drag()
        .origin(Object)
        .on('drag', doDrag)
        .on('dragend', doDragEnd);

    function doDrag(box) {
        box.x = d3.event.x;
        box.y = d3.event.y;
        box.z = 1000;
        updateView();
    }

    function doDragEnd(box) {
        box.z = box.defaultZ;
        var dropZone = findEnclosingDropZone(box);

        if (dropZone != null)
        {
            occupyDropZone(dropZone, box);
        }
        else
        {
            occupyDropZone(box.currentDropZone, box);
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
            .html(function(box,ctr) {
                var contentHtml = sprintf('<div id="%(id)s" class="boxContent" ng-controller="%(controller)s"><div ng-include=" \'partials/%(partial)s.html\' "></div></div>', box );
                return contentHtml;
            });

        // every time
        boxDivs
            .style('top', function(d) { var newY = d.y+sizes.label.height; return asPx(newY); })
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

    // *************************************************
    // build the service object that is actually exposed
    var serviceObject = {

        addSizeListener: function(boxId, callback) {
            idToCallbacksMap[boxId] = { sizeChangedCallback: callback }
        },

        getSize: function(boxId) {
            var box = findBoxById(boxId);
            return {width: box.width, height: box.height };
        }
    };

    return serviceObject;
}()));
