/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		"Abstract" class for editor tools - handles mouse events
 */
function tool() {
	this.target = null;
	this.lastEvent = null;
	this.downEvent = null;
}

tool.prototype.mouseDown = function(event) {
	this.lastEvent = event;
	this.downEvent = event;
}

tool.prototype.mouseUp = function(event) {
	this.target = null;
	this.lastEvent = null;
	this.downEvent = null;
}

tool.prototype.mouseClick = function(event) {}
	
tool.prototype.mouseDblClick = function(event) {}

tool.prototype.mouseMove = function(event) {
	if((event.button == 1 || event.buttons == 4) && this.lastEvent) {
		var dX = Math.round((this.lastEvent.clientX - event.clientX)/svg.zoom);
		var dY = Math.round((this.lastEvent.clientY - event.clientY)/svg.zoom);
		this.lastEvent = event;
		svg.moveView(dX, dY);
		return;
	}
}

tool.prototype.mouseContextMenu = function(event) {
	if(!svg || !(svg instanceof root)) { return; }
	
	if(!event.target.isChildOf(windowAnimation.container)) {
		popup.macroContextMenu({ 'target': event.target, 'x': event.clientX, 'y': event.clientY });
	}
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
	return false;
}