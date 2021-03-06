$(function() {
	
	
$('#clearResults').click(function() {
	$('div#results').html('');	
});

$('#theLink').click(function() {
    $('div#results').append('Hi There<br/>');
    return false;
});

$('#theOutsideLink').click(function() {
    $('div#results').append('Hi There from the outside<br/>');
    return false;
});



var currentDrag = null;
var mouseEvents = null;

function writeDebugInfo(msg)
{
	var buffer = '<p/>'+msg+' id= '+currentDrag.dragged.id+' originalOffset = ('+currentDrag.originalOffset.left+', '+currentDrag.originalOffset.top+') currentOffset = ('+currentDrag.currentOffset.left+', '+currentDrag.currentOffset.top+')';
	
	if (currentDrag.originalDropZone != null)
	{
		buffer = buffer + '<br/>currentDrag.originalDropZone = ' +currentDrag.originalDropZone.id; 
	}
	
	if (currentDrag.currentDropZone != null)
	{
		buffer = buffer + '<br/>currentDrag.currentDropZone = ' +currentDrag.currentDropZone.id;
	}
	
	$('.dropZone').each( function(index, zone) {
		var zoneLeft = $(zone).offset().left;
		var zoneTop = $(zone).offset().top;
		
		buffer = buffer + '<br/>Drop Zone '+zone.id+ ' (' +zoneLeft+ ', ' +zoneTop+ ')';
	});
		
	//$('div#results').append(buffer);
}

function findDropZone()
{
	if (currentDrag == null) { return null; }
	
	var currentLeft = currentDrag.currentOffset.left;
	var currentTop = currentDrag.currentOffset.top; 
	
	var ghostWidth = $('div.ghost').first().width();
	var ghostHeight = $('div.ghost').first().height();
	
	var currentRight = currentLeft+ghostWidth;
	var currentBottom = currentTop+ghostHeight;
	
	var match = null;
	$('.dropZone').each( function(index, zone) {		
		var zoneLeft = $(zone).offset().left;
		var zoneRight = zoneLeft + $(zone).width();
		var zoneTop = $(zone).offset().top;
		var zoneBottom = zoneTop + $(zone).height();
				
		var topLeftInZone = (currentLeft >= zoneLeft && currentLeft <= zoneRight && currentTop >= zoneTop && currentTop <= zoneBottom );
		var bottomRightInZone = (currentRight >= zoneLeft && currentRight <= zoneRight && currentBottom >= zoneTop && currentBottom <= zoneBottom ); 
		if (topLeftInZone && bottomRightInZone)
		{
			match = zone;
		}
	}); 
	
	return match;
}

function createGhost()
{
	var ghostId = currentDrag.dragged.id+'Ghost';
	$('div#container').append("<div id='"+ghostId+"' class='box ghost'> Ghost </div>");
	currentDrag.ghostId = ghostId;
	
}


function preventDefaultMouseDrag(evt)
{
	//evt.preventDefault();
	//evt.stopPropagation;
}

function mouseDown(evt)
{
	mouseEvents = {currentTarget: evt.currentTarget};
}

function mouseMove(evt)
{
	if (mouseEvents != null)
	{
		var canonicalEvent = {srcElement: evt.currentTarget, originalEvent: evt, offset: {left: evt.pageX, top: evt.pageY} }; 
		
		if (currentDrag == null)
		{
			doDragStart(canonicalEvent);
		}
		else
		{
			doDrag(canonicalEvent);
		}
	}
}

function mouseUp(evt)
{
	if (mouseEvents != null)
	{
		mouseEvents = null;
		var canonicalEvent = {srcElement: evt.currentTarget, originalEvent: evt, offset: {left: evt.pageX, top: evt.pageY} };
		doDragEnd(canonicalEvent);
	}
}

function touchDragStart(evt)
{
	if (mouseEvents != null) { return; }
	var srcElement = evt.originalEvent.srcElement;  
	
	var canonicalEvent = {srcElement: srcElement, originalEvent: evt.originalEvent, offset: {left: $(srcElement).offset().left, top: $(srcElement).offset().top}};
	doDragStart(canonicalEvent);
}
	
function doDragStart(evt)
{
	var srcElement = evt.srcElement;
	
	if ( $(srcElement).hasClass('box') && currentDrag == null )
	{
		evt.originalEvent.preventDefault();
		evt.originalEvent.stopPropagation;
		currentDrag = { dragged: srcElement, originalOffset: {left: evt.offset.left, top: evt.offset.top}, currentOffset: {left: evt.offset.left, top: evt.offset.top} };
		currentDrag.originalDropZone = findDropZone();
		currentDrag.currentDropZone = currentDrag.originalDropZone;
		createGhost();
		writeDebugInfo('start');
	}
}
	
function touchDrag(evt)
{
	if (mouseEvents != null) { return; }
	if (currentDrag == null)  { return; }
	
	
	var srcElement = evt.originalEvent.srcElement;  
	
	var canonicalEvent = {srcElement: srcElement, originalEvent: evt.originalEvent, offset: {left: currentDrag.originalOffset.left + evt.distanceX, top: currentDrag.originalOffset.top + evt.distanceY}};
	doDrag(canonicalEvent);
}
	
function doDrag(evt)
{
	evt.originalEvent.preventDefault();
	evt.originalEvent.stopPropagation;
	
	currentDrag.currentOffset.left = evt.offset.left; 
	currentDrag.currentOffset.top = evt.offset.top;
	currentDrag.currentDropZone = findDropZone();
	
	var ghost = $('div.ghost');
	ghost.offset({ top: currentDrag.currentOffset.top, left: currentDrag.currentOffset.left})
	
	if (currentDrag.currentDropZone != null && currentDrag.currentDropZone != currentDrag.originalDropZone )
	{
		if (!ghost.hasClass('droppable'))
		{
			ghost.addClass('droppable');
		}
	}
	else
	{
		ghost.removeClass('droppable');
	}
	
	writeDebugInfo('drag');
}

function touchDragEnd(evt)
{
	if (mouseEvents != null) { return; }
	if (currentDrag == null)  { return; }
	
	
	var srcElement = evt.originalEvent.srcElement;  
	
	var canonicalEvent = {srcElement: srcElement, originalEvent: evt.originalEvent, offset: {left: currentDrag.originalOffset.left + evt.distanceX, top: currentDrag.originalOffset.top + evt.distanceY}};
	doDragEnd(canonicalEvent);
}

function doDragEnd(evt)
{	
	evt.originalEvent.preventDefault();
	evt.originalEvent.stopPropagation;
	
	writeDebugInfo('end');
	if (currentDrag.currentDropZone != null && currentDrag.currentDropZone != currentDrag.originalDropZone)
	{
		$(currentDrag.dragged).detach();
		$(currentDrag.dragged).appendTo(currentDrag.currentDropZone);
	}
	
	$('div.ghost').remove();		
	currentDrag = null;
	
}
	

$('div.box').mousedown(mouseDown);
$('div.box').mousemove(mouseMove);
$('div#container').mousemove(mouseMove);
$('div#container').mouseup(mouseUp);

$('div.box').each(function(index, element) {
	element.addEventListener('dragstart', preventDefaultMouseDrag, false);
	element.addEventListener('drag', preventDefaultMouseDrag, false);
});


var container = $('div#container')[0];
var hammer = new Hammer(container,  {prevent_default: true });

hammer.ondragstart = touchDragStart;
hammer.ondrag = touchDrag;
hammer.ondragend = touchDragEnd;



});