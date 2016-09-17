/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Fallback "tool" for handling anchors (UI nodes)
 */
function toolAnchor() {
	tool.call(this);
}

toolAnchor.prototype = Object.create(tool.prototype);

toolAnchor.prototype.mouseClick = function(event) {
	var keys = { 'ctrlKey': event.ctrlKey == true, 'altKey': event.altKey == true, 'shiftKey': event.shiftKey == true };
	if(this.target) {
		this.target.click(keys);
	}
}

toolAnchor.prototype.mouseMove = function(event) {
	if(!svg || !(svg instanceof root)) { return; }
	
	var threshold = 3;
	if(!this.downEvent || (Math.abs(this.downEvent.clientX-event.clientX)<threshold && Math.abs(this.downEvent.clientY-event.clientY)<threshold)) {
		return;
	}
	
	var evaluated = svg.evaluateEventPosition(event);
	var keys = { 'ctrlKey': event.ctrlKey == true, 'altKey': event.altKey == true, 'shiftKey': event.shiftKey == true };
	this.target.moveTo(evaluated.x, evaluated.y, keys);
	
	svg.ui.highlight.refresh();
	svg.ui.selectionBox.refresh();
	
	windowAnimation.refreshKeyframes();
	
	this.lastEvent = event;
}

toolAnchor.prototype.mouseUp = function(event) {
	var threshold = 1;
	var thresholdTime = 200;
		
	if(this.downEvent && this.downEvent.target == event.target && Math.abs(this.downEvent.timeStamp-event.timeStamp) < thresholdTime &&
		Math.abs(this.downEvent.clientX-event.clientX) < threshold && Math.abs(this.downEvent.clientY-event.clientY) < threshold) {
		this.mouseClick(event);
	}
	
	if(this.target.actions && this.target.actions.mouseup) {
		eval(this.target.actions.mouseup);
	}
	
	this.target = null;
	this.lastEvent = null;
	this.downEvent = null;
}