/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Implements SVGPathSegCurvetoQuadraticSmoothAbs
 */
function pathSegCurvetoQuadraticSmooth(x, y) {
	this.pathSegType = 18;
	this.pathSegTypeAsLetter = 'T';
	
	this.x = x;
	this.y = y;
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