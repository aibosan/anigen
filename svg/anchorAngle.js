/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Anchor (UI node) class specialized for angle values
 *	@todo		Merge with @anchor class (it already has its own angle-calculating methods)
 */
function anchorAngle(center, referenceZero, angle, element, shape, actions) {
	this.container = null;
	
	this.offset = this.center = center;
	this.referenceZero = referenceZero;
	this.angle = angle;
	
	this.radius = Math.sqrt((this.center.x-this.referenceZero.x)*(this.center.x-this.referenceZero.x)+(this.center.y-this.referenceZero.y)*(this.center.y-this.referenceZero.y));
	var initialAngleRad = Math.atan2((this.referenceZero.y-this.center.y), (this.referenceZero.x-this.center.x));
	if(initialAngleRad < 0) { initialAngleRad += 2*Math.PI; }	// <0; 2pi)
	this.angleOffset = 180*initialAngleRad/Math.PI;
	var rad = Math.PI*(this.angle + this.angleOffset)/180;
	this.x = this.radius*Math.cos(rad);
	this.y = this.radius*Math.sin(rad);
	this.element = element;
	
	this.actions = actions || {};
	this.shape = shape || rectangle;
	this.children = [];
	this.connectors = [];
	
	this.seed();
	this.refreshPosition();
	this.adjustZoom();
}

anchorAngle.prototype.refreshPosition = function() {
	if(!this.container) { return; }
	
	var initialAngleRad = Math.atan2((this.referenceZero.y-this.center.y), (this.referenceZero.x-this.center.x));
	if(initialAngleRad < 0) { initialAngleRad += 2*Math.PI; }	// <0; 2pi)
	this.angleOffset = 180*initialAngleRad/Math.PI;
	this.radius = Math.sqrt((this.center.x-this.referenceZero.x)*(this.center.x-this.referenceZero.x)+(this.center.y-this.referenceZero.y)*(this.center.y-this.referenceZero.y));
	
	var rad = Math.PI*(this.angle + this.angleOffset)/180;
	this.x = this.radius*Math.cos(rad);
	this.y = this.radius*Math.sin(rad);
	this.container.setAttribute('transform', 'translate('+(this.x+this.center.x)+', '+(this.y+this.center.y)+')');
	
	/*
	this.container.setAttribute('transform', 'translate('+(this.x+this.center.x)+', '+(this.y+this.center.y)+')');
	*/
	for(var i = 0; i < this.connectors.length; i++) {
		this.connectors[i].refresh();
	}
}

anchorAngle.prototype.adjustZoom = anchor.prototype.adjustZoom;

anchorAngle.prototype.seed = anchor.prototype.seed;

anchorAngle.prototype.addChild = anchor.prototype.addChild;

anchorAngle.prototype.addConnector = anchor.prototype.addConnector;

anchorAngle.prototype.getAbsolute = anchor.prototype.getAbsolute;

anchorAngle.prototype.click = anchor.prototype.click;

anchorAngle.prototype.moveTo = function(inX, inY, keys) {
	var CTMcontainer = this.container.getCTMBase(); 
	var CTMelement = this.element.getCTMBase();
	var lastAbsolute = CTMcontainer.toViewport(0,0);
	var offset = { 'x': lastAbsolute.x-this.x, 'y': lastAbsolute.y-this.y };
	
	var revolutionCount = Math.floor(this.angle/360);
	
	var newAngleRad = Math.atan2((inY-offset.y), (inX-offset.x));
	var angle = 180*newAngleRad/Math.PI - this.angleOffset;		// this will be final angle value
	if(angle < 0) {
		angle = angle%360 + 360;
	}	// <0; 360)
	angle += revolutionCount*360;		// adds complete revolutions
	
	var dAngle = this.angle;
	
	this.angle = angle;
	var rad = Math.PI*(this.angle + this.angleOffset)/180;
	
	// absolute point coordinates
	var absolute = { 'x': this.radius*Math.cos(rad), 'y': this.radius*Math.sin(rad) };
	var dAbsolute = { 'x': this.x - absolute.x, 'y': this.y - absolute.y };
	this.x = absolute.x;
	this.y = absolute.y;
	
	dAngle = this.angle - dAngle;
	dAngleRad = Math.PI*dAngle/180;
	this.refreshPosition();
	
	for(var i = 0; i < this.children.length; i++) {
		if(!(this.children[i] instanceof anchorAngle) || this.children[i].center != this) {
			this.children[i].x += dAbsolute.x;
			this.children[i].y += dAbsolute.y;
		}
		this.children[i].refreshPosition();
	}
	
	if(this.actions != null && this.actions.move != null) {
		var bound = this.bound;
		if(this.actions.move) {
			eval(this.actions.move);
		}
		
		svg.gotoTime();
		
		if(svg.ui.path) { svg.ui.path.commit(); }
	}
}



