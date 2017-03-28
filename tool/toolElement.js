/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Element selection tool
 */
function toolElement() {
	toolGroup.call(this);
}

toolElement.prototype = Object.create(toolGroup.prototype);

toolElement.prototype.mouseDown = function(event) {
	if(!svg || !(svg instanceof root)) { return; }
	
	this.lastEvent = event;
	
	if(event.target == svg.selected || event.target.isChildOf(svg.selected)) {
		this.target = svg.selected;
	}
	
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
}

toolElement.prototype.mouseClick = function(event) {
	if(!svg || !(svg instanceof root)) { return; }
	if(event.button != 0) { return; }
	if(svg.selected instanceof SVGAnimationElement && svg.selected.isChildOf(event.target)) { return; }
	if(typeof event.target.isInsensitive !== 'function' || event.target.isInsensitive()) { return; }
	
	svg.select(event.target);
}

toolElement.prototype.mouseMove = function(event) {
	/*
	if(event.target == svg.selected) {
		anigenManager.setCursor('url(_cursors/element_grab.png)');
	} else {
		anigenManager.setCursor('url(_cursors/element.png)');
	}
	*/
}