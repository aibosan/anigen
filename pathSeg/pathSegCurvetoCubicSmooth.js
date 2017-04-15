/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Implements SVGPathSegCubicSmoothAbs
 */
function pathSegCurvetoCubicSmooth(x2, y2, x, y) {
	this.pathSegType = 16;
	this.pathSegTypeAsLetter = 'S';
	
	this.x = isNaN(x) ? 0 : x;
	this.y = isNaN(y) ? 0 : y;
	this.x2 = isNaN(x2) ? 0 : x2;
	this.y2 = isNaN(y2) ? 0 : y2;
}

pathSegCurvetoCubicSmooth.prototype = Object.create(pathSeg.prototype);
	
pathSegCurvetoCubicSmooth.prototype.toString = function() {
	return 'S ' + this.x2 + ' ' + this.y2 + ' ' + this.x + ' ' + this.y;
}
	
pathSegCurvetoCubicSmooth.prototype.moveTo = function(toX, toY, point, handle1, handle2) {
	var dX = toX - this.x;
	var dY = toY - this.y;
	if(point) {
		this.x = toX;
		this.y = toY;
	}
	if(handle2) {
		if(point) {
			this.x2 += dX;
			this.y2 += dY;
		} else {
			this.x2 = toX;
			this.y2 = toY;
		}
	}
}
	
pathSegCurvetoCubicSmooth.prototype.moveBy = function(byX, byY, point, handle1, handle2) {
	if(point) {
		this.x += byX;
		this.y += byY;
	}
	if(handle2) {
		this.x2 += byX;
		this.y2 += byY;
	}
}
	
pathSegCurvetoCubicSmooth.prototype.getAdjusted = function(matrix) {
	if(!(matrix instanceof SVGMatrix)) { return this; }
	var adjusted2 = matrix.toViewport(this.x2, this.y2);
	this.x2 = adjusted2.x;
	this.y2 = adjusted2.y;
	var adjusted = matrix.toViewport(this.x, this.y);
	this.x = adjusted.x;
	this.y = adjusted.y;
	return new pathSegCurvetoCubicSmooth(adjusted2.x, adjusted2.y, adjusted.x, adjusted.y);
}
	
pathSegCurvetoCubicSmooth.prototype.adjust = function(matrix) {
	var adjusted = this.getAdjusted(matrix);
	this.x2 = adjusted.x2;
	this.y2 = adjusted.y2;
	this.x = adjusted.x;
	this.y = adjusted.y;
	return this;
}
	
pathSegCurvetoCubicSmooth.prototype.inbetween = function(other, ratio) {
	if(!(other instanceof pathSegCurvetoCubicSmooth)) { throw new Error('Path segment type mismatch.'); }
	if(ratio == null) { ratio = 0; }
	
	var x2 = this.x2 + ratio*(other.x2 - this.x2);
	var y2 = this.y2 + ratio*(other.y2 - this.y2);
	var x = this.x + ratio*(other.x - this.x);
	var y = this.y + ratio*(other.y - this.y);
	
	return new pathSegCurvetoCubicSmooth(x2, y2, x, y);
}

pathSegCurvetoCubicSmooth.prototype.clone = function() {
	return new pathSegCurvetoCubicSmooth(this.x2, this.y2, this.x, this.y);
}

pathSegCurvetoCubicSmooth.prototype.split = function(ratio, fromPoint) {
	var val = this.getValue(ratio, fromPoint);
	
	var tX = fromPoint.x2 != null ? fromPoint.x2 : fromPoint.x1 != null ? fromPoint.x1 : fromPoint.x;
	var tY = fromPoint.y2 != null ? fromPoint.y2 : fromPoint.y1 != null ? fromPoint.y1 : fromPoint.y;
	var x1 = fromPoint.x-(tX-fromPoint.x);
	var y1 = fromPoint.y-(tY-fromPoint.y);
	
	var middle = new pathSegCurvetoCubic(
		fromPoint.x+(x1-fromPoint.x)*ratio, fromPoint.y+(y1-fromPoint.y)*ratio,
		-1*val.dX*ratio/3+val.x, -1*val.dY*ratio/3+val.y,
		val.x, val.y
		);
	
	ratio = 1-ratio;
		
	var end = new pathSegCurvetoCubic(
		val.dX*ratio/3+val.x, val.dY*ratio/3+val.y,
		this.x+(this.x2-this.x)*ratio, this.y+(this.y2-this.y)*ratio,
		this.x, this.y
		);
	
	return [ middle, end ];
}


pathSegCurvetoCubicSmooth.prototype.getValue = function(ratio, fromPoint) {
	if(!fromPoint || fromPoint.x == null || fromPoint.y == null) { return; }
	
	if(ratio < 0) { ratio = 0; }
	if(ratio > 1) { ratio = 1; }
	
	var tX = fromPoint.x2 != null ? fromPoint.x2 : fromPoint.x1 != null ? fromPoint.x1 : fromPoint.x;
	var tY = fromPoint.y2 != null ? fromPoint.y2 : fromPoint.y1 != null ? fromPoint.y1 : fromPoint.y;
	var x1 = fromPoint.x-(tX-fromPoint.x);
	var y1 = fromPoint.y-(tY-fromPoint.y);
	
	var x = Math.pow((1-ratio), 3)*fromPoint.x + 
		3*Math.pow((1-ratio), 2)*ratio*x1 + 
		3*(1-ratio)*Math.pow(ratio,2)*this.x2 + 
		Math.pow(ratio, 3)*this.x;
	
	var y = Math.pow((1-ratio), 3)*fromPoint.y + 
		3*Math.pow((1-ratio), 2)*ratio*y1 + 
		3*(1-ratio)*Math.pow(ratio,2)*this.y2 + 
		Math.pow(ratio, 3)*this.y;
	
	var dX = 3*Math.pow((1-ratio), 2)*(x1-fromPoint.x) + 
		6*(1-ratio)*ratio*(this.x2-x1) + 
		3*Math.pow(ratio, 2)*(this.x-this.x2);
		
	var dY = 3*Math.pow((1-ratio), 2)*(y1-fromPoint.y) + 
		6*(1-ratio)*ratio*(this.y2-y1) + 
		3*Math.pow(ratio, 2)*(this.y-this.y2);
	
	return {
		'x': x,
		'y': y,
		'dX': dX,
		'dY': dY
	};
}

pathSegCurvetoCubicSmooth.prototype.getRegular = function(fromPoint) {
	var tX = fromPoint.x2 != null ? fromPoint.x2 : fromPoint.x1 != null ? fromPoint.x1 : fromPoint.x;
	var tY = fromPoint.y2 != null ? fromPoint.y2 : fromPoint.y1 != null ? fromPoint.y1 : fromPoint.y;
	var x1 = fromPoint.x-(tX-fromPoint.x);
	var y1 = fromPoint.y-(tY-fromPoint.y);
	
	return new pathSegCurvetoCubic(x1, y1, this.x2, this.y2, this.x, this.y);
}

