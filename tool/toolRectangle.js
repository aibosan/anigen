/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		"Abstract" class for editor tools - handles mouse events
 */
function toolRectangle() {
	this.target = null;
	this.downEvent = null;
}

toolRectangle.prototype.mouseDown = function(event) {
	if(!svg || !svg.svgElement) { return; }
	if(!event.target.isChildOf(svg.svgElement) && event.target != svg.svgElement) { return; }
	
	var targ = svg.selected;
	while(targ && !(targ instanceof SVGGElement || targ instanceof SVGSVGElement)) {
		targ = targ.parentNode;
		if(!(targ instanceof SVGElement)) { return; }
	}
	
	var CTM = targ.getCTMBase();
	
	var coords = svg.evaluateEventPosition(event);
	coords = CTM.toUserspace(coords.x, coords.y);
	
	this.target = document.createElementNS(svgNS, 'rect');
	this.downEvent = coords;
	
	targ.appendChild(this.target);
}

toolRectangle.prototype.mouseUp = function(event) {
	if(!this.target) { return; }
	if(this.target.getAttribute('x') == null ||  this.target.getAttribute('y') == null ||
		this.target.getAttribute('width') == '0' || this.target.getAttribute('height') == '0') {
			
		this.target.parentNode.removeChild(this.target);
		return;
	}
	window.dispatchEvent(new Event('treeSeed'));
	svg.select(this.target);
	this.target = null;
	this.downEvent = null;
}

toolRectangle.prototype.mouseClick = function(event) {
	
}
	
toolRectangle.prototype.mouseDblClick = function(event) {}

toolRectangle.prototype.mouseMove = function(event) {
	if(!this.target) { return; }
	
	var coords = svg.evaluateEventPosition(event);
	
	var CTM = this.target.getCTMBase();
	coords = CTM.toUserspace(coords.x, coords.y);
	
	var oX = (coords.x < this.downEvent.x) ? coords.x : this.downEvent.x;
	var oFX = (coords.x < this.downEvent.x) ? this.downEvent.x : coords.x;
	var oY = (coords.y < this.downEvent.y) ? coords.y : this.downEvent.y;
	var oFY = (coords.y < this.downEvent.y) ? this.downEvent.y : coords.y;
	
	this.target.setAttribute('x', oX);
	this.target.setAttribute('y', oY);
	this.target.setAttribute('width', oFX-oX);
	this.target.setAttribute('height', oFY-oY);
}

toolRectangle.prototype.mouseContextMenu = function(event) {
	if(!svg || !(svg instanceof root)) { return; }
	
	if(!event.target.isChildOf(anigenManager.named.left.container) && 
		!event.target.isChildOf(anigenManager.named.right.container)) {
		popup.macroContextMenu({ 'target': event.target, 'x': event.clientX, 'y': event.clientY });
	}
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
	return false;
}

toolRectangle.prototype.keyDown = function(event) {
	return true;
}

toolRectangle.prototype.keyUp = function(event) {
	return true;
}