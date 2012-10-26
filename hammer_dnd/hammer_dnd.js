$(function() {
	
function doDragStart(evt)
{
	var dragged = evt.originalEvent.srcElement;
	
	if ($(dragged).hasClass('box'))
	{
		$('div#results').html('start '+evt.originalEvent.srcElement.id);
	}
}
	
function doDrag(evt)
{
	var dragged = evt.originalEvent.srcElement;
	
	if ($(dragged).hasClass('box'))
	{
		$('div#results').html('drag '+dragged.id+ ' x= '+evt.position.x+' y= '+evt.position.y+ ' distanceX= '+evt.distanceX+' distanceY '+evt.distanceY);
	}
}

function doDragEnd(evt)
{
	$('div#results').html('ended');
	
	var dragged = evt.originalEvent.srcElement;
	
	if ($(dragged).hasClass('box'))
	{
	}
}
	
var container = $('div#container')[0];
var hammer = new Hammer(container);

hammer.ondragstart = doDragStart;
hammer.ondrag = doDrag;
hammer.ondragend = doDragEnd;



});