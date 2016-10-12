/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Implements SVGPathSegCurvetoQuadraticAbs
 */
function pathSegCurvetoQuadratic(x1, y1, x, y) {
	this.pathSegType = 8;
	this.pathSegTypeAsLetter = 'Q';
	
	this.x1 = x1;
	this.y1 = y1;
	this.x = x;
	this.y = y;
}

pathSegCurvetoQuadratic.prototype = Object.create(pathSeg.prototype);
	
pathSegCurvetoQuadratic.prototype.toString = function() {
	return 'Q ' + this.x1 + ' ' + this.y1 + ' ' + this.x + ' ' + this.y;
}
	
pathSegCurvetoQuadratic.prototype.moveTo = function(toX, toY, point, handle) {
	var dX = toX - this.x;
	var dY = toY - this.y;
	if(point) {
		this.x = toX;
		this.y = toY;
	}
	if(handle) {
		if(point) {
			this.x1 += dX;
			this.y1 += dY;
		} else {
			this.x1 = toX;
			this.y1 = toY;
		}
	}
}
	
pathSegCurvetoQuadratic.prototype.moveBy = function(byX, byY, point, handle) {
	if(point) {
		this.x += byX;
		this.y += byY;
	}
	if(handle) {
		this.x1 += byX;
		this.y1 += byY;
	}
}
	
pathSegCurvetoQuadratic.prototype.getAdjusted = function(matrix) {
	if(!(matrix instanceof SVGMatrix)) { return this; }
	var adjusted1 = matrix.toViewport(this.x1, this.y1);
	var adjusted = matrix.toViewport(this.x, this.y);
	return new pathSegCurvetoQuadratic(adjusted1.x, adjusted1.y, adjusted.x, adjusted.y);
}
	
pathSegCurvetoQuadratic.prototype.adjust = function(matrix) {
	var adjusted = this.getAdjusted(matrix);
	this.x1 = adjusted.x1;
	this.y1 = adjusted.y1;
	this.x = adjusted.x;
	this.y = adjusted.y;
	return this;
}
	
pathSegCurvetoQuadratic.prototype.inbetween = function(other, ratio) {
	if(!(other instanceof pathSegCurvetoQuadratic)) { throw new Error('Path segment type mismatch.'); }
	if(ratio == null) { ratio = 0; }
	
	var x1 = this.x1 + ratio*(other.x1 - this.x1);
	var y1 = this.y1 + ratio*(other.y1 - this.y1);
	var x = this.x + ratio*(other.x - this.x);
	var y = this.y + ratio*(other.y - this.y);
	
	return new pathSegCurvetoQuadratic(x1, y1, x, y);
}

pathSegCurvetoQuadratic.prototype.clone = function() {
	return new pathSegCurvetoQuadratic(this.x1, this.y1, this.x, this.y);
}