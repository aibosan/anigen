/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for SVG "polyline" (rectangle) element
 */

SVGPolylineElement.prototype.consumeTransform = function(matrixIn) {
	var matrix = this.getTransformBase();
	if(matrixIn) {
		matrix = matrixIn.multiply(matrix);
	}
	
	if(this.style.strokeWidth) {
		var oldStroke = parseFloat(this.style.strokeWidth);
		var zero = matrix.toViewport(0,0);
		var one = matrix.toViewport(1,1);
		var ratio = Math.sqrt((one.x-zero.x)*(one.x-zero.x)+(one.y-zero.y)*(one.y-zero.y))/Math.sqrt(2);
		this.style.strokeWidth = ratio*oldStroke;
	}
	
	this.getValues();
	
	for(var i = 0; i < this.values.length; i++) {
		var adjusted = matrix.toViewport(this.values[i].x, this.values[i].y);
		this.values[i].x = adjusted.x;
		this.values[i].y = adjusted.y;
	}
	
	this.commitValues();
	this.removeAttribute('transform');
}

SVGPolylineElement.prototype.getValues = function() {
	this.values = [];
	var temp = this.getAttribute('points').replace(/,/g, ' ').replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
		temp = temp.split(' ');

	for(var i = 0; i < temp.length; i+=2) {
		this.values.push(new coordinates(temp[i] + ' ' + temp[i+1]));
	}
	return this.values;
}

SVGPolylineElement.prototype.commitValues = function() {
	this.setAttribute('points', this.values.join(' '));
}

SVGPolylineElement.prototype.setValue = function(index, x, y, makeHistory) {
	this.getValues();
	if(index < 0 || index >= this.values.length) { throw new DOMException(1); }
	if(isNaN(parseFloat(x)) || isNaN(parseFloat(y))) { return; }
	x = parseFloat(x);
	y = parseFloat(y);	
	
	this.values[index].x = x;
	this.values[index].y = y;
	
	if(makeHistory && svg && svg.history) {
		svg.history.add(new historyAttribute(this.id, 
			{ 'points': this.getAttribute('points') },
			{ 'points': this.values.join(' ') }, true));
	}
	
	this.commitValues();
}

SVGPolylineElement.prototype.generateAnchors = function() {
	var CTM = this.getCTMBase();
	this.getValues();
	
	var anchors = [];
	
	for(var i = 0; i < this.values.length; i++) {
		var adjusted = CTM.toViewport(this.values[i].x, this.values[i].y);
		var constraint = null;
		if(i > 0) {
			constraint = new constraintLinear({'x': this.values[i-1].x, 'y': this.values[i-1].y}, {'x': this.values[i].x, 'y': this.values[i].y}, { 'optional': true });
		}
		var anch = new anchor(adjusted, this, 'rectangle', {
			'move': 'this.element.setValue('+i+', absolute.x, absolute.y, true);',
			'mouseup': 'svg.select();'
		}, constraint);
		anchors.push(anch);
	}
	return { 'anchors': [ anchors ] };
}
 
// returns element's center as top-left (x,y attributes) plus half of height and width respectively
// if viewport is true, value given is adjusted to current viewport
SVGPolylineElement.prototype.getCenter = function(viewport) {
	var xMax, yMax, xMin, yMin;
	var xMaxAnim, yMaxAnim, xMinAnim, yMinAnim;
	
	if(this.points.length == 0) {
		return null;
	}
	
	var CTM = this.getCTMBase();
	var CTMAnim = this.getCTMAnim();
	
	for(var i = 0; i < this.points.length; i++) {
		var adjusted;
		var adjustedAnim;
		
		if(viewport) {
			adjusted = CTM.toViewport(this.points[i].x, this.points[i].y);
			adjustedAnim = CTMAnim.toViewport(this.animatedPoints[i].x, this.animatedPoints[i].y);
		} else {
			adjusted = this.points[i];
			adjustedAnim = this.animatedPoints[i];
		}
		if(xMin == null || adjusted.x < xMin) { xMin = adjusted.x; }
		if(xMax == null || adjusted.x > xMax) { xMax = adjusted.x; }
		if(yMin == null || adjusted.y < yMin) { yMin = adjusted.y; }
		if(yMax == null || adjusted.y > yMax) { yMax = adjusted.y; }
		
		if(xMinAnim == null || adjustedAnim.x < xMinAnim) { xMinAnim = adjustedAnim.x; }
		if(xMaxAnim == null || adjustedAnim.x > xMaxAnim) { xMaxAnim = adjustedAnim.x; }
		if(yMinAnim == null || adjustedAnim.y < yMinAnim) { yMinAnim = adjustedAnim.y; }
		if(yMaxAnim == null || adjustedAnim.y > yMaxAnim) { yMaxAnim = adjustedAnim.y; }
	}
	
	return {
		'x': xMin + (xMax-xMin)/2,
		'y': yMin + (yMax-yMin)/2,
		'x_anim': xMinAnim + (xMaxAnim-xMinAnim)/2,
		'y_anim': yMinAnim + (yMaxAnim-yMinAnim)/2,
		'left': xMin, 'right': xMax,
		'top': yMin, 'bottom': yMax,
		'left_anim': xMinAnim, 'right_anim': xMaxAnim,
		'top_anim': yMinAnim, 'bottom_anim': yMaxAnim
	}
}

SVGPolylineElement.prototype.toPath = function() {
	var path = document.createElementNS(svgNS, 'path');
	var pData = [];
	
	var values = this.getAttribute('points').replace(/,/g, ' ').replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
		values = values.split(' ');
		
	pData.push('M');
	for(var i = 0; i < values.length; i++) {
		pData.push(values[i]);
	}
	
	path.setAttribute('d', pData.join(' '));
	
	for(var i = 0; i < this.attributes.length; i++) {
		if(this.attributes[i].name == 'width' || this.attributes[i].name == 'height' || this.attributes[i].name == 'rx' || this.attributes[i].name == 'ry' || this.attributes[i].name == 'cx' || this.attributes[i].name == 'cy') { continue; }
		path.setAttribute(this.attributes[i].name, this.attributes[i].value);
	}
	
	this.parentNode.insertBefore(path, this);
	this.parentNode.removeChild(this);
	
	if(svg.selected == this) {
		svg.select(path);
	}
	return path;
}

SVGPolylineElement.prototype.isVisualElement = function() { return true; }
