/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for SVG "animateMotion" element
 */
 
SVGAnimateMotionElement.prototype.getPath = function() {
	this.path = null;
	for(var i = 0; i < this.children.length; i++) {
		if(this.children[i] instanceof SVGMPathElement) {
			this.path = document.getElementById(this.children[i].getAttribute('xlink:href').substring(1));
			if(this.path) {
				this.xlink = this.children[i];
				return this.path;
			}
		}
	}
	
	if(!this.getAttribute('path')) { return null; }
	this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
	this.path.setD(this.getAttribute('path'));
	var center = this.getCenter();
	this.path.setAttribute('transform', 'translate('+center.x+', '+center.y+')');
	return this.path;
}

SVGAnimateMotionElement.prototype.setPathData = function(data) {
	this.setAttribute('path', data);
}

SVGAnimateMotionElement.prototype.setPath = function(target, absolute) {
	if(!(target instanceof SVGPathElement)) { return; }
	
	var path = target.cloneNode(false);
		path.consumeTransform();
		path.setStartAtZero();
	if(absolute) {
		try {
			var origin = target.getPathData().baseVal.getItem(0);
		} catch(err) {
			// no path data
			return;
		}
		var center = this.getCenter();
		// doesn't take CTM of target path into account?
		path.moveAllBy(origin.x-center.x, origin.y-center.y );
	}
	this.setAttribute('path', path.getAttribute('d'));
		
	svg.select();
	svg.gotoTime();
}

SVGAnimateMotionElement.prototype.getValues = function() {
	this.values = [];
	var temp = this.getAttribute('keyPoints');
	if(!temp) { return this.values; }
	temp = temp.split(';');
	for(var i = 0; i < temp.length; i++) {
		this.values.push(parseFloat(temp[i]));
	}
	return this.values;
}



// commits values into element
SVGAnimateMotionElement.prototype.commitValues = function() {
	this.setAttribute('keyPoints', this.values.join(';'));
}

SVGAnimateMotionElement.prototype.setValue = function(index, value, makeHistory) {
	this.getValues();
	if(index < 0 || index >= this.values.length) { throw new DOMException(1); }
	if(value < 0) { value = 0; }
	if(value > 1) { value = 1; }
	
	if(makeHistory && svg && svg.history) {
		svg.history.add(new historyGeneric(this.id, 
			'target.setValue('+index+', '+this.values[index]+');',
			'target.setValue('+index+', '+value+');', true));
	}
	
	this.values[index] = value;
	this.commitValues();
}

SVGAnimateMotionElement.prototype.getRotate = function(value) {
	if(!this.rotate) {
		this.rotate = this.getAttribute('rotate');
		if(!isNaN(this.rotate)) { this.rotate = parseFloat(this.rotate); }
	}
	return this.rotate;
}

SVGAnimateMotionElement.prototype.setRotate = function(value) {
	if(isNaN(value) && (value != 'auto' || value != 'auto-reverse')) { return; }
	if(!isNaN(value)) { value = parseFloat(value); }
	this.rotate = value;
	this.setAttribute('rotate', this.rotate);
}

SVGAnimateMotionElement.prototype.generateAnchors = function() {
	this.getPath();
	var generated = this.path.generateAnchors();
	if(!this.xlink) {
		for(var i = 0; i < generated.anchors[0].length; i++) {
			generated.anchors[0][i].bound = { 'animation': this };
			generated.anchors[0][i].actions.move += 'this.bound.animation.setPathData(this.element.pathData.baseVal.toString());';
		}
		this.path.style.stroke = '#aa0000';
		this.path.style.fill = 'none';
		this.path.setAttribute('stroke-width', 1.5/svg.zoom+"px");
		this.path.adjustZoom = function() {
			this.setAttribute("stroke-width", 1.5/svg.zoom+"px");
		}
		generated.paths = [ this.path ];
	}
	return generated;
}

SVGAnimateMotionElement.prototype.createInbetween = function(one, two, ratio, makeHistory) {
	if(two < one) {
		var temp = one;
		one = two;
		two = temp;
	}
	if(ratio == null || ratio < 0 || ratio > 1) { ratio = 0.5; }
	
	this.duplicateValue(one, makeHistory);
	this.getValues();
	this.getSplines();
	
	this.times[one+1] += (this.times[two+1]-this.times[one])*ratio;
	if(this.splines) {
		this.splines[one] = this.splines[one].inbetween(this.splines[two], ratio);
	}
	
	this.values[one+1] += (this.values[two+1]-this.values[one])*ratio;
	if(makeHistory) { this.makeHistory(true, true, (this.splines ? true : false)); }
	if(this.splines) { this.commitSplines(); }
	this.commitTimes();
	this.commitValues();
}