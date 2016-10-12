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
		var ratio = Math.sqrt((one.x-zero.x)*(one.x-zero.x)+(one.y-zero.y)*(one.y-zero.y));
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
			constraint = new constraintLinear({'x': this.values[i-1].x, 'y': this.values[i-1].y}, {'x': this.values[i].x, 'y': this.values[i].y}, false, true);
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
	var CTM = this.getCTMBase();
	
	this.getValues();
	
	var xMax, yMax, xMin, yMin;
	
	for(var i = 0; i < this.values.length; i++) {
		if(viewport) {
			var adjusted = CTM.toViewport(this.values[i].x, this.values[i].y);
			if(xMin == null || adjusted.x < xMin) { xMin = adjusted.x; }
			if(xMax == null || adjusted.x > xMax) { xMax = adjusted.x; }
			if(yMin == null || adjusted.y < yMin) { yMin = adjusted.y; }
			if(yMax == null || adjusted.y > yMax) { yMax = adjusted.y; }
		} else {
			if(xMin == null || this.values[i].x < xMin) { xMin = this.values[i].x; }
			if(xMax == null || this.values[i].x > xMax) { xMax = this.values[i].x; }
			if(yMin == null || this.values[i].y < yMin) { yMin = this.values[i].y; }
			if(yMax == null || this.values[i].y > yMax) { yMax = this.values[i].y; }
		}
	}
	
	var center = {
		'x': xMin + (xMax-xMin)/2,
		'y': yMin + (yMax-yMin)/2,
	}
	
	return { 'x': center.x, 'y': center.y,
		'left': xMin, 'right': xMax,
		'top': yMin, 'bottom': yMax
	};
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


