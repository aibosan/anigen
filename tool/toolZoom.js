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
	if(event.shiftKey || event.button == 2) {
		svg.zoomAround(evaluated.x, evaluated.y, false);
	} else {
		svg.zoomAround(evaluated.x, evaluated.y, true);
	}
}

toolZoom.prototype.mouseContextMenu = function(event) {
	var evaluated = svg.evaluateEventPosition(event);
	svg.zoomAround(evaluated.x, evaluated.y, false);
}

toolZoom.prototype.keyDown = function(event) {
	if(anigenManager.named['svg'] && event.shiftKey) {
		anigenManager.setCursor('url(_cursors/zoom_out.png) 7 7');
	}
	return true;
}

toolZoom.prototype.keyUp = function(event) {
	if(anigenManager.named['svg']) {
		anigenManager.setCursor('url(_cursors/zoom_in.png) 7 7');
	}
	return true;
}