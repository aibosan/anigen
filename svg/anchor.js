/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Anchor (UI node) class
 */
function anchor(posAbsolute, element, shape, actions, constraint) {
	this.container = null;
	this.x = posAbsolute.x;
	this.y = posAbsolute.y;
	this.element = element;
	this.selected = false;
	this.selectable = true;
	
	this.actions = actions || {};
	this.shape = shape || 'rectangle';
	this.children = [];
	this.connectors = [];
	
	this.constraint = constraint;
	
	this.offset = { 'x': 0, 'y': 0 };
	
	this.seed();
	this.refreshPosition();
	this.adjustZoom();
}

anchor.prototype.setAngle = function(angle) {
	if(!this.center) { return; }
	
	var CTMelement = this.element.getCTMBase();
	
	var centerAbsolute = this.center.getAbsolute();
	var radius = Math.sqrt((this.x-centerAbsolute.x)*(this.x-centerAbsolute.x)+(this.y-centerAbsolute.y)*(this.y-centerAbsolute.y));
	
	var rad = Math.PI*(angle)/180;
	var absolute = { 'x': radius*Math.cos(rad) + centerAbsolute.x, 'y': radius*Math.sin(rad) + centerAbsolute.y };
	var lastRelative = CTMelement.toUserspace(this.x, this.y);
	var relative = CTMelement.toUserspace(absolute.x, absolute.y);
	
	var dAbsolute = { 'x': absolute.x-this.x, 'y': absolute.y-this.y };
	var dRelative = { 'x': relative.x-lastRelative.x, 'y': relative.y-lastRelative.y };
	
	this.x = absolute.x;
	this.y = absolute.y;
	this.refreshPosition();
	return { 'absolute': absolute, 'dAbsolute': dAbsolute, 'relative': relative, 'dRelative': dRelative };
}

anchor.prototype.setPosition = function(x, y) {
	var CTMelement = this.element.getCTMBase();
	
	var absolute = { 'x': x, 'y': y };
	var lastRelative = CTMelement.toUserspace(this.x, this.y);
	var relative = CTMelement.toUserspace(absolute.x, absolute.y);
	
	var dAbsolute = { 'x': absolute.x-this.x, 'y': absolute.y-this.y };
	var dRelative = { 'x': relative.x-lastRelative.x, 'y': relative.y-lastRelative.y };
	
	this.x = absolute.x;
	this.y = absolute.y;
	this.refreshPosition();
	return { 'absolute': absolute, 'dAbsolute': dAbsolute, 'relative': relative, 'dRelative': dRelative };
}

anchor.prototype.getAngle = function() {
	if(!this.center) { return; }
	
	var centerAbsolute = this.center.getAbsolute();
	var thisAbsolute = this.getAbsolute();
	var initialAngleRad = Math.atan2((thisAbsolute.y-centerAbsolute.y), (thisAbsolute.x-centerAbsolute.x));
	var initialAngle = 180*initialAngleRad/Math.PI;
	return initialAngle;
}

anchor.prototype.setOffset = function(x, y) {
	if(x == null) { x = 0; }
	if(y == null) { y = 0; }
	this.offset.x = x;
	this.offset.y = y;
	this.container.setAttribute('transform', 'translate('+x+' '+y+')');
}

anchor.prototype.select = function(value) {
	if(value != null) {
		if(value == true) {
			this.selected = true;
		} else {
			this.selected = false;
		}
	}
	if(this.selected) {
		this.rectangle2.style.fill = this.colors["active"].getHex() || "#00ff00";
	} else {
		this.rectangle2.style.fill = this.colors["fill"].getHex() || "#ffffff";
	}
}

anchor.prototype.refreshPosition = function() {
	if(!this.containerInner || this.x == null || this.y == null) { return; }
	this.containerInner.setAttribute('transform', 'translate('+this.x+', '+this.y+')');
	for(var i = 0; i < this.connectors.length; i++) {
		this.connectors[i].refresh();
	}
}

anchor.prototype.adjustZoom = function() {
	if(!this.rectangle1 || !this.rectangle2) { return; }
	this.rectangle1.setAttribute("transform", "scale("+(1/svg.zoom)+")");
	this.rectangle2.setAttribute("transform", "scale("+(1/svg.zoom)+")");
	
	if(this.shape == 'diamond') {
		this.rectangle1.setAttribute("transform", "scale("+(0.9/svg.zoom)+") rotate(45)");
		this.rectangle2.setAttribute("transform", "scale("+(0.9/svg.zoom)+") rotate(45)");
	}
}

anchor.prototype.seed = function() {
	this.container = document.createElementNS(svgNS, "g");
	this.container.setAttribute("anigen:lock", "anchor");
	this.container.shepherd = this;
	this.container.setAttribute('transform', 'translate('+this.offset.x+' '+this.offset.y+')');
	
	this.containerInner = document.createElementNS(svgNS, "g");
	this.containerInner.setAttribute("anigen:lock", "anchor");
	this.containerInner.shepherd = this;
	
	if(!this.size) { this.size = 8; }
	if(!this.shape) { this.shape = 'rectangle'; }
	if(!this.colors) { this.colors = {"fill": new color("#ffffff"), "stroke": new color("#000000"), "hover": new color("#ffd700"), "active": new color("#00ff00")}; }
	
	this.rectangle1 = document.createElementNS(svgNS, "rect");
	this.rectangle2 = document.createElementNS(svgNS, "rect");
	
	this.rectangle1.setAttribute('anigen:lock', 'anchor');
	this.rectangle1.setAttribute("width", this.size);
    this.rectangle1.setAttribute("height", this.size);
    this.rectangle1.setAttribute("x", -1*this.size/2);
    this.rectangle1.setAttribute("y", -1*this.size/2);
	this.rectangle1.setAttribute("stroke-width", "2px");
	this.rectangle1.style.stroke = this.colors["stroke"].getHex();
	
	this.rectangle2.setAttribute('anigen:lock', 'anchor');
	this.rectangle2.setAttribute("width", this.size);
    this.rectangle2.setAttribute("height", this.size);
    this.rectangle2.setAttribute("x", -1*this.size/2);
    this.rectangle2.setAttribute("y", -1*this.size/2);
	this.rectangle2.setAttribute("stroke-width", "1.5px");
	this.rectangle2.style.fill = this.colors["fill"].getHex();
	this.rectangle2.setAttribute("onmouseover", "this.style.fill = '"+this.colors["hover"].getHex()+"';");
    this.rectangle2.setAttribute("onmouseout", "this.style.fill = this.parentNode.shepherd.selected ? '"+this.colors["active"].getHex()+"' : '"+this.colors["fill"].getHex()+"';");
	
	if(this.shape == 'circle') {
		this.rectangle1.setAttribute("rx", "50%");
		this.rectangle1.setAttribute("ry", "50%");
		this.rectangle2.setAttribute("rx", "50%");
		this.rectangle2.setAttribute("ry", "50%");
	}
	
	this.containerInner.appendChild(this.rectangle1);
	this.containerInner.appendChild(this.rectangle2);
	
	this.container.appendChild(this.containerInner);
	return this.container;
}

anchor.prototype.addChild = function(other) {
	if(!(other instanceof anchor) && !(other instanceof anchorAngle)) { return; }
	if(this.children.indexOf(other) != -1) { return; }
	this.children.push(other);
}

anchor.prototype.addConnector = function(other) {
	if(!(other instanceof connector) && !(other instanceof circleDouble)) { return; }
	if(this.connectors.indexOf(other) != -1) { return; }
	this.connectors.push(other);
}

anchor.prototype.moveTo = function(inX, inY, keys) {
	var CTMelement = this.element.getCTMBase();
	
	if(this.element instanceof SVGAnimateTransformElement && this.element.getAttribute('type') == 'translate') {
		CTMelement.e = 0;
		CTMelement.f = 0;
	}
	
	if(this.constraint) {
		var tmp = this.constraint.resolve(inX, inY, keys);
		inX = tmp.x;
		inY = tmp.y;
	}
	
	var absolute = { 'x': inX-this.offset.x, 'y': inY-this.offset.y };
	var lastRelative = CTMelement.toUserspace(this.x, this.y);
	var relative = CTMelement.toUserspace(absolute.x, absolute.y);
	
	var dAbsolute = { 'x': absolute.x-this.x, 'y': absolute.y-this.y };
	var dRelative = { 'x': relative.x-lastRelative.x, 'y': relative.y-lastRelative.y };
	
	this.x = absolute.x;
	this.y = absolute.y;
	
	this.refreshPosition();
	
	for(var i = 0; i < this.children.length; i++) {
		if(!(this.children[i] instanceof anchorAngle) || this.children[i].center != this) {
			this.children[i].x += dAbsolute.x;
			this.children[i].y += dAbsolute.y;
		}
		this.children[i].refreshPosition();
	}
	
	this.evaluate(absolute, dAbsolute, relative, dRelative);
	this.evaluateLocal(absolute, dAbsolute, relative, dRelative);
}

anchor.prototype.moveBy = function(dAX, dAY, keys) {
	var abs = this.getAbsolute();
	
	this.moveTo(abs.x+dAX, abs.y+dAY, keys);
}

anchor.prototype.evaluate = function(absolute, dAbsolute, relative, dRelative) {
	if(this.actions != null && this.actions.move) {
		var bound = this.bound;
		eval(this.actions.move);
		svg.gotoTime();
		if(svg.ui.path) { svg.ui.path.commit(); }
	}
}

anchor.prototype.evaluateLocal = function(absolute, dAbsolute, relative, dRelative) {
	if(this.actions != null && this.actions.moveLocal) {
		var bound = this.bound;
		eval(this.actions.moveLocal);
		svg.gotoTime();
		if(svg.ui.path) { svg.ui.path.commit(); }
	}
}

anchor.prototype.click = function(keys) {
	if(this.actions && this.actions.click) {
		eval(this.actions.click);
	}
}

anchor.prototype.mouseUp = function(keys) {
	var CTMelement = this.element.getCTMBase();
	
	if(this.element instanceof SVGAnimateTransformElement && this.element.getAttribute('type') == 'translate') {
		CTMelement.e = 0;
		CTMelement.f = 0;
	}
	
	var absolute = { 'x': this.x-this.offset.x, 'y': this.y-this.offset.y };
	var relative = CTMelement.toUserspace(this.x, this.y);
	
	if(this.actions != null && this.actions.mouseup) {
		var bound = this.bound;
		eval(this.actions.mouseup);
		/*
		svg.gotoTime();
		if(svg.ui.path) { svg.ui.path.commit(); }
		*/
	}
}


anchor.prototype.getAbsolute = function() {
	return { 'x': this.x+this.offset.x, 'y': this.y+this.offset.y };
}

anchor.prototype.getRelative = function() {
	var CTMelement = this.element.getCTMBase();
	
	var lastRelative = CTMelement.toUserspace(this.x, this.y);
	return lastRelative;
}



