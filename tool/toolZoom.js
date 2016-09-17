/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Zoom tool
 */
function toolZoom() {
	tool.call(this);
}

toolZoom.prototype = Object.create(tool.prototype);
	
toolZoom.prototype.mouseClick = function(event) {
	if(!svg || !(svg instanceof root)) { return; }
	popup.hide();
	if(!event.target.isChildOf(svg.svgElement) && event.target != svg.svgElement) { return; }
	var evaluated = svg.evaluateEventPosition(event);
	svg.zoomAround(evaluated.x, evaluated.y, true);
}
	
toolZoom.prototype.mouseContextMenu = function(event) {
	if(!svg || !(svg instanceof root)) { return; }
	popup.hide();
	if(!event.target.isChildOf(svg.svgElement) && event.target != svg.svgElement) {
		event.preventDefault ? event.preventDefault() : event.returnValue = false;
		return false;
	}
	var evaluated = svg.evaluateEventPosition(event);
	svg.zoomAround(evaluated.x, evaluated.y, false);
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
}