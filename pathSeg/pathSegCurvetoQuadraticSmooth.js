/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Implements SVGPathSegCurvetoQuadraticSmoothAbs
 */
function pathSegCurvetoQuadraticSmooth(x, y) {
	this.pathSegType = 18;
	this.pathSegTypeAsLetter = 'T';
	
	this.x = isNaN(x) ? 0 : x;
	this.y = isNaN(y) ? 0 : y;
}

pathSegCurvetoQuadraticSmooth.prototype = Object.create(pathSeg.prototype);
	
pathSegCurvetoQuadraticSmooth.prototype.toString = function() {
	return 'T ' + this.x + ' ' + this.y;
}
	
pathSegCurvetoQuadraticSmooth.prototype.moveTo = function(toX, toY, point) {
	var dX = toX - this.x;
	var dY = toY - this.y;
	if(point) {
		this.x = toX;
		this.y = toY;
	}
}
	
pathSegCurvetoQuadraticSmooth.prototype.moveBy = function(byX, byY, point) {
	if(point) {
		this.x += byX;
		this.y += byY;
	}
}
	
pathSegCurvetoQuadraticSmooth.prototype.getAdjusted = function(matrix) {
	if(!(matrix instanceof SVGMatrix)) { return this; }
	var adjusted = matrix.toViewport(this.x, this.y);
	return new pathSegCurvetoQuadraticSmooth(adjusted.x, adjusted.y);
}
	
pathSegCurvetoQuadraticSmooth.prototype.adjust = function(matrix) {
	var adjusted = this.getAdjusted(matrix);
	this.x = adjusted.x;
	this.y = adjusted.y;
	return this;
}
	
pathSegCurvetoQuadraticSmooth.prototype.inbetween = function(other, ratio) {
	if(!(other instanceof pathSegCurvetoQuadraticSmooth)) { throw new Error('Path segment type mismatch.'); }
	if(ratio == null) { ratio = 0; }
	
	var x = this.x + ratio*(other.x - this.x);
	var y = this.y + ratio*(other.y - this.y);
	
	return new pathSegCurvetoQuadraticSmooth(x, y);
}

pathSegCurvetoQuadraticSmooth.prototype.clone = function() {
	return new pathSegCurvetoQuadraticSmooth(this.x, this.y);
}

pathSegCurvetoQuadraticSmooth.prototype.split = function(ratio, fromPoint) {
	var val = this.getValue(ratio, fromPoint);
	
	var tX = fromPoint.x1 != null ? fromPoint.x1 : fromPoint.x;
	var tY = fromPoint.y1 != null ? fromPoint.y1 : fromPoint.y;
	var x1 = fromPoint.x-(tX-fromPoint.x);
	var y1 = fromPoint.y-(tY-fromPoint.y);
	
	var middle = new pathSegCurvetoQuadratic(
		fromPoint.x+(x1-fromPoint.x)*ratio, fromPoint.y+(y1-fromPoint.y)*ratio,
		val.x, val.y
		);
	
	ratio = 1-ratio;
		
	var end = new pathSegCurvetoQuadratic(
		this.x+(x1-this.x)*ratio, this.y+(y1-this.y)*ratio,
		this.x, this.y
		);
	
	return [ middle, end ];
}


pathSegCurvetoQuadraticSmooth.prototype.getValue = function(ratio, fromPoint) {
	if(!fromPoint || fromPoint.x == null || fromPoint.y == null) { return; }
	
	if(ratio < 0) { ratio = 0; }
	if(ratio > 1) { ratio = 1; }
	
	var tX = fromPoint.x1 != null ? fromPoint.x1 : fromPoint.x;
	var tY = fromPoint.y1 != null ? fromPoint.y1 : fromPoint.y;
	var x1 = fromPoint.x-(tX-fromPoint.x);
	var y1 = fromPoint.y-(tY-fromPoint.y);
	
	var x = Math.pow((1-ratio), 2)*fromPoint.x + 
		2*(1-ratio)*ratio*x1 + 
		Math.pow(ratio,2)*this.x;
	
	var y = Math.pow((1-ratio), 2)*fromPoint.y + 
		2*(1-ratio)*ratio*y1 + 
		Math.pow(ratio,2)*this.y;
	
	var dX = 2*(1-ratio)*(x1-fromPoint.x) + 
		2*ratio*(this.x-x1);
		
	var dY = 2*(1-ratio)*(y1-fromPoint.y) + 
		2*ratio*(this.y-y1);
	
	return {
		'x': x,
		'y': y,
		'dX': dX,
		'dY': dY
	};
}

pathSegCurvetoQuadraticSmooth.prototype.getRegular = function(fromPoint) {
	var tX = fromPoint.x1 != null ? fromPoint.x1 : fromPoint.x;
	var tY = fromPoint.y1 != null ? fromPoint.y1 : fromPoint.y;
	var x1 = fromPoint.x-(tX-fromPoint.x);
	var y1 = fromPoint.y-(tY-fromPoint.y);
	
	return new pathSegCurvetoQuadratic(x1, y1, this.x, this.y);
}
