/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		SVG arrow
 */
function arrow(posAbsolute, element, shape, quadrant, origin, actions, constraint) {
	
	this.container = null;
	this.x = posAbsolute.x;
	this.y = posAbsolute.y;
	this.element = element;
	
	this.actions = actions || {};
	this.shape = shape || 'rotate';
	this.quadrant = quadrant || 1;
	// 1 - TR, 2 - TL, 3 - BL, 4 - BR
	
	this.origin = origin;
	
	this.constraint = constraint;
	
	this.seed();
	this.refreshPosition();
	this.adjustZoom();
}

arrow.prototype.seed = function() {
	this.container = document.createElementNS(svgNS, "g");
	this.container.setAttribute("anigen:lock", "anchor");
	this.container.setAttribute('shape-rendering', 'geometricPrecision');
	this.container.shepherd = this;
	
	this.container2 = document.createElementNS(svgNS, 'g');
	this.container.appendChild(this.container2);
	this.container2.shepherd = this;
	
	if(!this.size) {
		this.size = 14;
	}
	this.size /= 32;	 // base size of SVG is 32x32 px
	
	if(!this.shape) { this.shape = 'rotateTL'; }
	if(!this.colors) { this.colors = {"fill": new color("#000000"), "stroke": new color("#ffffff"), "hover": new color("#008000"), "active": new color("#00a000")}; }
	
	this.path1 = document.createElementNS(svgNS, "path");
	
	this.path1.setAttribute('anigen:lock', 'anchor');
	
	switch(this.shape) {
		case 'rotate':	// arched, turning arrow
			this.path1.setAttribute('d', "m -12,-10 -10,10 10,10 0,-6 c 4.418278,0 8,3.581722 8,8 L -10,12 0,22 10,12 4,12 C 4,3.163444 -3.163444,-4 -12,-4 Z");
			break;
		case 'scaleH':	// left-to-right arrow
			this.path1.setAttribute('d', "M 15,0 4,11 4,5 l -8,0 0,6 -11,-11 11,-11 0,6 8,0 0,-6 z");
			break;
		case 'scaleV':	// up-to-down arrow
			this.path1.setAttribute('d', "M 0,-15 11,-4 5,-4 5,4 11,4 0,15 -11,4 l 6,0 0,-8 -6,0 z");
			break;
		case 'scaleD':	// corner-to-corner arrow
			this.path1.setAttribute('d', "M 8,-8 8,8 4,4 l -8,8 4,4 -16,0 0,-16 4,4 8,-8 -4,-4 z");
			break;
	}
	
	switch(this.quadrant) {
		case 1:
			this.path1.setAttribute('transform', 'translate(16 -16)');
			break;
		case 2:
			this.path1.setAttribute('transform', 'translate(-16 -16) scale(-1,1)');
			break;
		case 3:
			this.path1.setAttribute('transform', 'translate(-16 16) scale(-1,-1)');
			break;
		case 4:
			this.path1.setAttribute('transform', 'translate(16 16) scale(1,-1)');
			break;
		case 1.5:	// "between 1 and 2"
			this.path1.setAttribute('transform', 'translate(0 -16)');
			break;
		case 2.5:
			this.path1.setAttribute('transform', 'translate(-16 0) scale(-1, 1)');
			break;
		case 3.5:
			this.path1.setAttribute('transform', 'translate(0 16) scale(-1,-1)');
			break;
		case 4.5:
			this.path1.setAttribute('transform', 'translate(16 0) scale(1,-1)');
			break;
	}
	
	this.path2 = this.path1.cloneNode(true);
	
	this.path1.style.stroke = this.colors["stroke"].getHex();
	this.path1.style.strokeWidth = 2/this.size+"px";
	
	this.path2.style.fill = this.colors["fill"].getHex();
	this.path2.setAttribute("onmouseover", "this.style.fill = '"+this.colors["hover"].getHex()+"';");
    this.path2.setAttribute("onmouseout", "this.style.fill = '"+this.colors["fill"].getHex()+"';");
	
	this.container2.appendChild(this.path1);
	this.container2.appendChild(this.path2);
}

arrow.prototype.refreshPosition = function() {
	if(!this.container || this.x == null || this.y == null) { return; }
	this.container.setAttribute('transform', 'translate('+this.x+', '+this.y+')');
}

arrow.prototype.adjustZoom = function() {
	if(!this.container2) { return; }
	this.container2.setAttribute("transform", "scale("+(this.size/svg.zoom)+")");
}

arrow.prototype.moveTo = function(inX, inY, keys) {
	
	if(this.constraint) {
		var tmp = this.constraint.resolve(inX, inY, keys);
		inX = tmp.x;
		inY = tmp.y;
	}
	
	var CTMcontainer = this.container.getCTMBase();
	var lastAbsolute = CTMcontainer.toViewport(0,0);
	var offset = { 'x': lastAbsolute.x-this.x, 'y': lastAbsolute.y-this.y };
	
	var absolute = { 'x': inX, 'y': inY };
	var dAbsolute = { 'x': absolute.x-lastAbsolute.x, 'y': absolute.y-lastAbsolute.y };
	
	var ratio = { 'x': 1, 'y': 1 };
	var angle = 0;
	
	if(this.origin) {
		ratio.x = (absolute.x - this.origin.x)/(lastAbsolute.x - this.origin.x) || 1;
		ratio.y = (absolute.y - this.origin.y)/(lastAbsolute.y - this.origin.y) || 1;
		
		var fromAngle = 180*Math.atan2((lastAbsolute.y - this.origin.y), (lastAbsolute.x - this.origin.x))/Math.PI;
		var toAngle = 180*Math.atan2((absolute.y - this.origin.y), (absolute.x - this.origin.x))/Math.PI;
		var angle = toAngle - fromAngle;
	}
	
	this.x = absolute.x - offset.x;
	this.y = absolute.y - offset.y;
	
	this.refreshPosition();
	
	this.evaluate(absolute, dAbsolute, ratio, angle, keys);
}

arrow.prototype.moveBy = function(dX, dY, keys) {
	this.moveTo(this.x+dX, this.y+dY, keys);
}

arrow.prototype.evaluate = function(absolute, dAbsolute, ratio, angle, keys) {
	if(this.actions != null && this.actions.move) {
		var bound = this.bound;
		eval(this.actions.move);
		
		svg.gotoTime();
		if(svg.ui.path) { svg.ui.path.commit(); }
	}
}

arrow.prototype.mouseUp = function() {
	if(this.actions != null && this.actions.mouseup) {
		var bound = this.bound;
		eval(this.actions.mouseup);
		
		svg.gotoTime();
		if(svg.ui.path) { svg.ui.path.commit(); }
	}
}

arrow.prototype.getAbsolute = function() {
	return { 'x': this.x, 'y': this.y };
}

