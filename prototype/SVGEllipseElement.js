/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for SVG "ellipse" element
 */

SVGEllipseElement.prototype.consumeTransform = function(matrixIn) {
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
	
	if(matrix.isIdentity()) {
		this.removeAttribute('transform');
	} else {
		this.setAttribute(transform);
	}
}

SVGEllipseElement.prototype.setCX = function(value) {
	this.setAttribute('cx', value);
}

SVGEllipseElement.prototype.setCY = function(value) {
	this.setAttribute('cy', value);
}
	
SVGEllipseElement.prototype.setRX = function(value) {
	this.setAttribute('rx', value);
}

SVGEllipseElement.prototype.setRY = function(value) {
	this.setAttribute('ry', value);
}

SVGEllipseElement.prototype.translateBy = SVGCircleElement.prototype.translateBy;

SVGEllipseElement.prototype.setRadius = function(x, y, makeHistory) {
	var newRX = Math.abs(x-this.cx.baseVal.value);
	var newRY = Math.abs(y-this.cy.baseVal.value);
	
	if(x == null) { newRX = this.rx.baseVal.value; }
	if(y == null) { newRY = this.ry.baseVal.value; }
	
	if(makeHistory && svg && history) {
		svg.history.add(new historyAttribute(this.id,
			{ 'rx': this.rx.baseVal.value, 'ry': this.ry.baseVal.value },
			{ 'rx': newRX, 'ry': newRY },
			true
		));
	}
	
	this.setRX(newRX);
	this.setRY(newRY);
}
	
SVGEllipseElement.prototype.generateAnchors = function() {
	var CTM = this.getCTMBase();
	
	var adjustedOrigin = CTM.toViewport(0, 0);
	var adjustedMid = CTM.toViewport(this.cx.baseVal.value, this.cy.baseVal.value);
	var adjustedTop = CTM.toViewport(this.cx.baseVal.value, this.cy.baseVal.value+this.ry.baseVal.value);
	var adjustedRight = CTM.toViewport(this.cx.baseVal.value+this.rx.baseVal.value, this.cy.baseVal.value);
	
	var mouseUpAction = "svg.select();";
	
	adjustedTop.x -= adjustedOrigin.x;
	adjustedTop.y -= adjustedOrigin.y;
	
	adjustedRight.x -= adjustedOrigin.x;
	adjustedRight.y -= adjustedOrigin.y;
	
	var anchTop = new anchor(adjustedTop, this, 'rectangle', {
			'move': "this.element.setRadius(null, absolute.y, true);",
			'mouseup': mouseUpAction
			}, new constraintLinear(adjustedTop, adjustedMid, false, false)
		);
	
	var anchLeft = new anchor(adjustedRight, this, 'rectangle', {
			'move': "this.element.setRadius(absolute.x, null, true);",
			'mouseup': mouseUpAction
			}, new constraintLinear(adjustedRight, adjustedMid, false, false)
		);
		
	return { 'anchors': [ [ anchTop, anchLeft ] ] };
}

// returns element's center as its "cx" and "cy" attributes
// if viewport is true, value given is adjusted to current viewport
SVGEllipseElement.prototype.getCenter = function(viewport) {
	var CTM = this.getCTMBase();
	var topLeft = CTM.toViewport(this.cx.baseVal.value-this.rx.baseVal.value, this.cy.baseVal.value-this.ry.baseVal.value);
	var botRight = CTM.toViewport(this.cx.baseVal.value+this.rx.baseVal.value, this.cy.baseVal.value+this.ry.baseVal.value);
		
	if(viewport) {
		var adjusted = CTM.toViewport(this.cx.baseVal.value, this.cy.baseVal.value);
		var adjustedAnim = CTM.toViewport(this.cx.animVal.value, this.cy.animVal.value);
		
		return { 'x': adjusted.x, 'y': adjusted.y, 'x_anim': adjustedAnim.x, 'y_anim': adjustedAnim.y,
			'left': Math.min(topLeft.x, botRight.x), 'right': Math.max(topLeft.x, botRight.x),
			'top': Math.min(topLeft.y, botRight.y), 'bottom': Math.max(topLeft.y, botRight.y) };
	}
	return { 'x': this.cx.baseVal.value, 'y': this.cy.baseVal.value,
			'x_anim': this.cx.animVal.value, 'y_anim': this.cy.animVal.value,
			'left': Math.min(topLeft.x, botRight.x), 'right': Math.max(topLeft.x, botRight.x),
			'top': Math.min(topLeft.y, botRight.y), 'bottom': Math.max(topLeft.y, botRight.y) 
	};
}

SVGEllipseElement.prototype.toPath = function() {
	var path = document.createElementNS(svgNS, 'path');
	var pData = [];
		pData.push('m ' +(this.cx.baseVal.value+this.rx.baseVal.value)+ ' ' + this.cy.baseVal.value);
		pData.push('a ' +this.rx.baseVal.value+ ' ' +this.ry.baseVal.value+ ' 0 0 1 ' + (-1*this.rx.baseVal.value)+ ' ' +this.ry.baseVal.value);
		pData.push('' +this.rx.baseVal.value+ ' ' +this.ry.baseVal.value+ ' 0 0 1 ' +(-1*this.rx.baseVal.value)+ ' ' +(-1*this.ry.baseVal.value));
		pData.push('' +this.rx.baseVal.value+ ' ' +this.ry.baseVal.value+ ' 0 0 1 ' +this.rx.baseVal.value+ ' ' +(-1*this.ry.baseVal.value));
		pData.push('' +this.rx.baseVal.value+ ' ' +this.ry.baseVal.value+ ' 0 0 1 ' +this.rx.baseVal.value+ ' ' +this.ry.baseVal.value);
		pData.push('z');
	
	path.setAttribute('d', pData.join(' '));
	
	for(var i = 0; i < this.attributes.length; i++) {
		if(this.attributes[i].name == 'rx' || this.attributes[i].name == 'ry' || this.attributes[i].name == 'cx' || this.attributes[i].name == 'cy') { continue; }
		path.setAttribute(this.attributes[i].name, this.attributes[i].value);
	}
	
	this.parentNode.insertBefore(path, this);
	this.parentNode.removeChild(this);
	
	if(svg.selected == this) {
		svg.select(path);
	}
	return path;
}

