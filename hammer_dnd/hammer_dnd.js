$(function() {
	
var currentDrag = null;

function writeDebugInfo(msg)
{
	var buffer = ''+msg+' id= '+currentDrag.dragged.id+' originalOffset = ('+currentDrag.originalOffset.left+', '+currentDrag.originalOffset.top+') currentOffset = ('+currentDrag.currentOffset.left+', '+currentDrag.currentOffset.top+')';
	
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
		
	$('div#results').html(buffer);
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
		var zoneWidth = $(zone).width();
		var zoneHeight = $(zone).height();
		var zoneLeft = $(zone).offset().left;
		var zoneTop = $(zone).offset().top;
				
		var topLeftInZone = (currentLeft >= zoneLeft && currentLeft <= (zoneLeft+zoneWidth) && currentTop >= zoneTop && currentTop <= (zoneTop+zoneHeight) );
		var bottomRightInZone = (currentRight >= zoneLeft && currentRight <= (zoneLeft+zoneWidth) && currentBottom >= zoneTop && currentBottom <= (zoneTop+zoneHeight) ); 
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
		currentDrag = { dragged: evt.originalEvent.srcElement, originalOffset: {left: $(srcElement).offset().left, top: $(srcElement).offset().top}, currentOffset: {left: $(srcElement).offset().left, top: $(srcElement).offset().top} };
		currentDrag.originalDropZone = findDropZone();
		currentDrag.currentDropZone = currentDrag.originalDropZone;
		createGhost();
		writeDebugInfo('start');
	}
}
	
function doDrag(evt)
{
	var srcElement = evt.originalEvent.srcElement;	
	
	
	if ($(srcElement).hasClass('box') && srcElement === currentDrag.dragged)
	{
		evt.originalEvent.preventDefault();
		currentDrag.currentOffset.left = currentDrag.originalOffset.left + evt.distanceX;
		currentDrag.currentOffset.top = currentDrag.originalOffset.top + evt.distanceY;
		currentDrag.currentDropZone = findDropZone();
		
		var ghost = $('div.ghost');
		ghost.offset({ top: currentDrag.currentOffset.top, left: currentDrag.currentOffset.left})
		writeDebugInfo('drag');
	}
}

function doDragEnd(evt)
{
	var srcElement = evt.originalEvent.srcElement;	
	
	
	if (currentDrag != null)
	{
		evt.originalEvent.preventDefault();
		writeDebugInfo('end');
		$('div.ghost').remove();		
		currentDrag = null;
	}
}
	
var container = $('div#container')[0];
var hammer = new Hammer(container);

hammer.ondragstart = doDragStart;
hammer.ondrag = doDrag;
hammer.ondragend = doDragEnd;



});