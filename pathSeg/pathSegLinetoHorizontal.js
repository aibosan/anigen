/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Implements SVGPathSegLinetoHorizontalAbs
 */
function pathSegLinetoHorizontal(x) {
	this.pathSegType = 12;
	this.pathSegTypeAsLetter = 'H';
	
	this.x = x;
}

pathSegLinetoHorizontal.prototype = Object.create(pathSeg.prototype);
	
pathSegLinetoHorizontal.prototype.toString = function() {
	return 'H ' + this.x;
}
	
pathSegLinetoHorizontal.prototype.moveTo = function(toX, toY, point) {
	var dX = toX - this.x;
	if(point) {
		this.x = toX;
	}
}
	
pathSegLinetoHorizontal.prototype.moveBy = function(byX, byY, point) {
	if(point) {
		this.x += byX;
	}
}
	
pathSegLinetoHorizontal.prototype.getAdjusted = function(matrix) {
	if(!(matrix instanceof SVGMatrix)) { return this; }
	var adjusted = matrix.toViewport(this.x, 0);
	if(adjusted.y != 0) {
		return new pathSegLineto(adjusted.x, adjusted.y);
	} else {
		return new pathSegLinetoHorizontal(adjusted.x);
	}
}
	
pathSegLinetoHorizontal.prototype.adjust = function(matrix) {
	var adjusted = this.getAdjusted(matrix);
	this.x = adjusted.x;
	if(adjusted.y) {
		this.y = adjusted.y;
	}
	return this;
}
	
pathSegLinetoHorizontal.prototype.inbetween = function(other, ratio) {
	if(!(other instanceof pathSegLinetoHorizontal)) { throw new Error('Path segment type mismatch.'); }
	if(ratio < 0) { ratio = 0; }
	if(ratio > 1) { ratio = 1; }
	
	var x = this.x + ratio*(other.x - this.x);
	
	return new pathSegLinetoHorizontal(x);
}

pathSegLinetoHorizontal.prototype.clone = function() {
	return new pathSegLinetoHorizontal(this.x);
}