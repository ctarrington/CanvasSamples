$(function() {
	
	
$('#clearResults').click(function() {
	$('div#results').html('');	
});


var currentDrag = null;

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
		
	$('div#results').append(buffer);
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
	
function doDragStart(evt)
{
	var srcElement = evt.originalEvent.srcElement;
	
	if ( $(srcElement).hasClass('box') && currentDrag == null )
	{
		evt.originalEvent.preventDefault();
		currentDrag = { dragged: srcElement, originalOffset: {left: $(srcElement).offset().left, top: $(srcElement).offset().top}, currentOffset: {left: $(srcElement).offset().left, top: $(srcElement).offset().top} };
		currentDrag.originalDropZone = findDropZone();
		currentDrag.currentDropZone = currentDrag.originalDropZone;
		createGhost();
		writeDebugInfo('start');
	}
}
	
function doDrag(evt)
{
	if (currentDrag == null)  { return; }
	evt.originalEvent.preventDefault();
	
	currentDrag.currentOffset.left = currentDrag.originalOffset.left + evt.distanceX;
	currentDrag.currentOffset.top = currentDrag.originalOffset.top + evt.distanceY;
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

function doDragEnd(evt)
{	
	if (currentDrag == null)  { return; }
	evt.originalEvent.preventDefault();
	
	writeDebugInfo('end');
	if (currentDrag.currentDropZone != null && currentDrag.currentDropZone != currentDrag.originalDropZone)
	{
		$(currentDrag.dragged).detach();
		$(currentDrag.dragged).appendTo(currentDrag.currentDropZone);
	}
	
	$('div.ghost').remove();		
	currentDrag = null;
	
}
	
var container = $('div#container')[0];
var hammer = new Hammer(container);

hammer.ondragstart = doDragStart;
hammer.ondrag = doDrag;
hammer.ondragend = doDragEnd;



});