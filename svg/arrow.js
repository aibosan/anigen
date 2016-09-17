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
	this.container.shepherd = this;
	
	this.container2 = document.createElementNS(svgNS, 'g');
	this.container.appendChild(this.container2);
	this.container2.shepherd = this;
	
	if(!this.size) { this.size = 20; }
	if(!this.shape) { this.shape = 'rotateTL'; }
	if(!this.colors) { this.colors = {"fill": new color("#000000"), "stroke": new color("#ffffff"), "hover": new color("#008000"), "active": new color("#00a000")}; }
	
	this.path1 = document.createElementNS(svgNS, "path");
	
	this.path1.setAttribute('anigen:lock', 'anchor');
	
	switch(this.shape) {
		case 'rotate':
			this.path1.setAttribute('d', 'm -0.277715,-0.22225424 0,0.10134575 c 0.22014392,2.76e-6 0.39859712,0.17847902 0.39857404,0.39862284 l 0.10139466,0 L -3.074397e-5,0.499999 -0.22236408,0.27771435 l 0.10139441,0 c 0,-0.086568 -0.0701773,-0.15674524 -0.15674533,-0.15674524 l 0,0.10139468 L -0.49999942,3.0193965e-5 Z');
			break;
		case 'scaleH':
			this.path1.setAttribute('d', 'M -0.1355594,-0.21704735 -0.35258461,2.1145939e-5 -0.1355594,0.21704636 l 0,-0.0992066 0.2711188,0 0,0.0992066 L 0.35258461,-2.2135154e-5 0.1355594,-0.21704735 l 0,0.09912 -0.2711188,0 z');
			break;
		case 'scaleV':
			this.path1.setAttribute('d', 'M 0.21704685,-0.1355599 -2.164094e-5,-0.35258511 -0.21704686,-0.1355599 l 0.0992066,0 0,0.2711188 -0.0992066,0 L 2.1640153e-5,0.35258411 0.21704685,0.1355589 l -0.09912,0 0,-0.2711188 z');
			break;
		case 'scaleD':
			this.path1.setAttribute('d', 'm -0.0478855,-0.30468741 0.35257247,3.516e-5 0,0.35253731 -0.0805761,-0.08057594 -0.25680127,0.25680134 0.08057596,0.0805761 -0.35257258,-3.516e-5 0,-0.35253742 0.0805056,0.08050565 L 0.03262,-0.22418166 Z');
			break;
	}
	
	switch(this.quadrant) {
		case 1:
			this.path1.setAttribute('transform', 'translate(0.5 -0.5)');
			break;
		case 2:
			this.path1.setAttribute('transform', 'translate(-0.5 -0.5) rotate(-90)');
			break;
		case 3:
			this.path1.setAttribute('transform', 'translate(-0.5 0.5) rotate(180)');
			break;
		case 4:
			this.path1.setAttribute('transform', 'translate(0.5 0.5) rotate(90)');
			break;
		case 1.5:	// "between 1 and 2"
			this.path1.setAttribute('transform', 'translate(0 -0.5)');
			break;
		case 2.5:
			this.path1.setAttribute('transform', 'translate(-0.5 0) rotate(-90)');
			break;
		case 3.5:
			this.path1.setAttribute('transform', 'translate(0 0.5) rotate(180)');
			break;
		case 4.5:
			this.path1.setAttribute('transform', 'translate(0.5 0) rotate(90)');
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
	
	this.evaluate(absolute, dAbsolute, ratio, angle);
}

arrow.prototype.evaluate = function(absolute, dAbsolute, ratio, angle) {
	if(this.actions != null && this.actions.move) {
		var bound = this.bound;
		eval(this.actions.move);
		
		svg.gotoTime();
		if(svg.ui.path) { svg.ui.path.commit(); }
	}
}



