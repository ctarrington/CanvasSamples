$(function() {
	
var currentDrag = null;

function writeDebugInfo(event)
{
	var buffer = event+' id= '+currentDrag.dragged.id+' originalPosition = ('+currentDrag.originalPosition.x+', '+currentDrag.originalPosition.y+') currentPosition = ('+currentDrag.currentPosition.x+', '+currentDrag.currentPosition.y+')';
	$('div#results').html(buffer);
}

function createGhost()
{
	
}
	
function doDragStart(evt)
{
	var srcElement = evt.originalEvent.srcElement;
	
	if ( $(srcElement).hasClass('box') && currentDrag == null )
	{
		currentDrag = { dragged: evt.originalEvent.srcElement, originalPosition: {x: srcElement.offsetLeft, y: srcElement.offsetTop}, currentPosition: {x: srcElement.offsetLeft, y: srcElement.offsetTop} };
		createGhost();
		writeDebugInfo('start');
	}
}
	
function doDrag(evt)
{
	var srcElement = evt.originalEvent.srcElement;	
	
	
	if ($(srcElement).hasClass('box') && srcElement === currentDrag.dragged)
	{
		currentDrag.currentPosition.x = currentDrag.originalPosition.x + evt.distanceX;
		currentDrag.currentPosition.y = currentDrag.originalPosition.y + evt.distanceY;
		writeDebugInfo('drag');
	}
}

function doDragEnd(evt)
{
	writeDebugInfo('end');
	currentDrag = null;
}
	
var container = $('div#container')[0];
var hammer = new Hammer(container);

hammer.ondragstart = doDragStart;
hammer.ondrag = doDrag;
hammer.ondragend = doDragEnd;



});