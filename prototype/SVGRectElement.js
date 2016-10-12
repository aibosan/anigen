/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for SVG "rect" (rectangle) element
 */

SVGRectElement.prototype.consumeTransform = function(matrixIn) {
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
	
	if(matrix.isIdentity()) {
		this.removeAttribute('transform');
	} else {
		this.setAttribute(transform);
	}
}

SVGRectElement.prototype.setX = function(value) {
	this.setAttribute('x', value);
}

SVGRectElement.prototype.setY = function(value) {
	this.setAttribute('y', value);
}

SVGRectElement.prototype.setWidth = function(value) {
	this.setAttribute('width', value);
}

SVGRectElement.prototype.setHeight = function(value) {
	this.setAttribute('height', value);
}

SVGRectElement.prototype.setRX = function(value) {
	this.setAttribute('rx', value);
}

SVGRectElement.prototype.setRY = function(value) {
	this.setAttribute('ry', value);
}

SVGRectElement.prototype.translateBy = function(byX, byY, makeHistory) {
	var oldX = this.x.baseVal.value;
	var oldY = this.y.baseVal.value;
	
	var CTM = this.getCTMBase();
	var zero = CTM.toViewport(0,0);
	var adjusted = CTM.toUserspace(zero.x+byX, zero.y+byY);
	
	this.setAttribute('x', oldX+adjusted.x);
	this.setAttribute('y', oldY+adjusted.y);
	
	if(makeHistory) {
		svg.history.add(new historyAttribute(this.id, 
			{ 'x': oldX, 'y': oldY },
			{ 'x': oldX+adjusted.x, 'y': oldY+adjusted.y },
		true));
	}
}

SVGRectElement.prototype.setTopleft = function(x, y, makeHistory) {
	var dX = x - this.x.baseVal.value;
	var dY = y - this.y.baseVal.value;
	
	if(this.width.baseVal.value - dX < 0) { dX = this.width.baseVal.value; x = dX + this.x.baseVal.value; }
	if(this.height.baseVal.value - dY < 0) { dY = this.height.baseVal.value; y = dY + this.y.baseVal.value; }
	
	if(makeHistory && svg && history) {
		svg.history.add(new historyAttribute(this.id,
			{ 'x': this.x.baseVal.value, 'y': this.y.baseVal.value, 'width': this.width.baseVal.value, 'height': this.height.baseVal.value },
			{ 'x': x, 'y': y, 'width': (this.width.baseVal.value - dX), 'height': (this.height.baseVal.value - dY) },
			true
		));
	}
	
	this.setX(x);
	this.setY(y);
	
	this.setWidth(this.width.baseVal.value - dX);
	this.setHeight(this.height.baseVal.value - dY);
}
	
SVGRectElement.prototype.setBotright = function(x, y, makeHistory) {
	var width = x - this.x.baseVal.value;
	var height = y - this.y.baseVal.value;
	
	if(width < 0) { width = 0; }
	if(height < 0) { height = 0; }
	
	if(makeHistory && svg && history) {
		svg.history.add(new historyAttribute(this.id,
			{ 'width': this.width.baseVal.value, 'height': this.height.baseVal.value },
			{ 'width': width, 'height': height },
			true
		));
	}
	
	this.setWidth(width);
	this.setHeight(height);
}
	
SVGRectElement.prototype.generateAnchors = function() {
	var CTM = this.getCTMBase();
	
	var adjustedXY = CTM.toViewport(this.x.baseVal.value, this.y.baseVal.value);
	var adjustedWH = CTM.toViewport(this.x.baseVal.value+this.width.baseVal.value, this.y.baseVal.value+this.height.baseVal.value);
	
	var mouseUpAction = "svg.select();";
		
	var anchTopleft = new anchor(adjustedXY, this, 'rectangle', {
			'move': "this.element.setTopleft(relative.x, relative.y, true);",
			'mouseup': mouseUpAction
			}, new constraintLinear(adjustedXY, adjustedWH, false, true)
		);
	
	var anchBotright = new anchor(adjustedWH, this, 'rectangle', {
			'move': "this.element.setBotright(relative.x, relative.y, true);",
			'mouseup': mouseUpAction
			}, new constraintLinear(adjustedWH, adjustedXY, false, true)
		);
		
	return { 'anchors': [ [ anchTopleft, anchBotright ] ] };
}

// returns element's center as top-left (x,y attributes) plus half of height and width respectively
// if viewport is true, value given is adjusted to current viewport
SVGRectElement.prototype.getCenter = function(viewport) {
	var CTM = this.getCTMBase();
	var topLeft = CTM.toViewport(this.x.baseVal.value, this.y.baseVal.value);
	var botRight = CTM.toViewport(this.x.baseVal.value+this.width.baseVal.value, this.y.baseVal.value+this.height.baseVal.value);
	
	if(viewport) {
		var adjusted = CTM.toViewport(this.x.baseVal.value+this.width.baseVal.value/2, this.y.baseVal.value+this.height.baseVal.value/2);
		var adjustedAnim = CTM.toViewport(this.x.animVal.value+this.width.animVal.value/2, this.y.animVal.value+this.height.animVal.value/2);
		
		return { 'x': adjusted.x, 'y': adjusted.y, 'x_anim': adjustedAnim.x, 'y_anim': adjustedAnim.y,
			'left': Math.min(topLeft.x, botRight.x), 'right': Math.max(topLeft.x, botRight.x),
			'top': Math.min(topLeft.y, botRight.y), 'bottom': Math.max(topLeft.y, botRight.y)
		};
	}
	return { 'x': this.x.baseVal.value+this.width.baseVal.value/2, 'y': this.y.baseVal.value+this.height.baseVal.value/2,
			'x_anim': this.x.animVal.value+this.width.animVal.value/2, 'y_anim': this.y.animVal.value+this.height.animVal.value/2,
			'left': Math.min(topLeft.x, botRight.x), 'right': Math.max(topLeft.x, botRight.x),
			'top': Math.min(topLeft.y, botRight.y), 'bottom': Math.max(topLeft.y, botRight.y)
	};
}

SVGRectElement.prototype.toPath = function() {
	var path = document.createElementNS(svgNS, 'path');
	var pData = [];
	
	if(!this.rx.baseVal.value && !this.ry.baseVal.value) {
		pData.push('m ' +this.x.baseVal.value+ ' ' + this.y.baseVal.value);
		pData.push('l ' +this.width.baseVal.value+ ' 0');
		pData.push('l 0 ' +this.height.baseVal.value);
		pData.push('l ' +(-1*this.width.baseVal.value)+ ' 0');
		pData.push('z');
	} else {
		var rx = this.rx.baseVal.value;
		var ry = this.ry.baseVal.value;
		var x = this.x.baseVal.value;
		var y = this.y.baseVal.value;
		var width = this.width.baseVal.value;
		var height = this.height.baseVal.value;
		
		if(rx > width/2) { rx = width/2; }
		if(ry > height/2) { ry = height/2; }
		
		pData.push('m ' +(x+rx)+ ' ' +y);
		pData.push('l ' +(width-2*rx)+ ' 0');
		pData.push('a ' +rx+ ' ' +ry+ ' 0 0 1 ' + rx + ' ' + ry);
		pData.push('l 0 ' +(height-2*ry));
		pData.push('a ' +rx+ ' ' +ry+ ' 0 0 1 ' + (-1*rx) + ' ' + ry);
		pData.push('l ' +(-1*(width-2*rx))+ ' 0');
		pData.push('a ' +rx+ ' ' +ry+ ' 0 0 1 ' + (-1*rx) + ' ' + (-1*ry));
		pData.push('l 0 ' +(-1*(height-2*ry)));
		pData.push('a ' +rx+ ' ' +ry+ ' 0 0 1 ' + (rx) + ' ' + (-1*ry));
		pData.push('z');
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


