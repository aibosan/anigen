/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Implements SVGPathSegCubicSmoothAbs
 */
function pathSegCurvetoCubicSmooth(x2, y2, x, y) {
	this.pathSegType = 16;
	this.pathSegTypeAsLetter = 'S';
	
	this.x2 = x2;
	this.y2 = y2;
	this.x = x;
	this.y = y;
}

pathSegCurvetoCubicSmooth.prototype = Object.create(pathSeg.prototype);
	
pathSegCurvetoCubicSmooth.prototype.toString = function() {
	return 'S ' + this.x2 + ' ' + this.y2 + ' ' + this.x + ' ' + this.y;
}
	
pathSegCurvetoCubicSmooth.prototype.moveTo = function(toX, toY, point, handle) {
	var dX = toX - this.x;
	var dY = toY - this.y;
	if(point) {
		this.x = toX;
		this.y = toY;
	}
	if(handle) {
		if(point) {
			this.x2 += dX;
			this.y2 += dY;
		} else {
			this.x2 = toX;
			this.y2 = toY;
		}
	}
}
	
pathSegCurvetoCubicSmooth.prototype.moveBy = function(byX, byY, point, handle) {
	if(point) {
		this.x += byX;
		this.y += byY;
	}
	if(handle) {
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

