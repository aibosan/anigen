/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Implements SVGPathSegLinetoVerticalAbs
 */
function pathSegLinetoVertical(y) {
	this.pathSegType = 14;
	this.pathSegTypeAsLetter = 'V';
	
	this.y = y;
}

pathSegLinetoVertical.prototype = Object.create(pathSeg.prototype);
	
pathSegLinetoVertical.prototype.toString = function() {
	return 'V ' + this.y;
}
	
pathSegLinetoVertical.prototype.moveTo = function(toX, toY, point) {
	var dY = toY - this.y;
	if(point) {
		this.y = toY;
	}
}
	
pathSegLinetoVertical.prototype.moveBy = function(byX, byY, point) {
	if(point) {
		this.y += byY;
	}
}
	
pathSegLinetoVertical.prototype.getAdjusted = function(matrix) {
	if(!(matrix instanceof SVGMatrix)) { return this; }
	var adjusted = matrix.toViewport(0, this.y);
	if(adjusted.x != 0) {
		return new pathSegLineto(adjusted.x, adjusted.y);
	} else {
		return new pathSegLinetoVertical(adjusted.y);
	}
}
	
pathSegLinetoVertical.prototype.adjust = function(matrix) {
	var adjusted = this.getAdjusted(matrix);
	if(adjusted.x) {
		this.x = adjusted.x;
	}
	this.y = adjusted.y;
	return this;
}
	
pathSegLinetoVertical.prototype.inbetween = function(other, ratio) {
	if(!(other instanceof pathSegLinetoVertical)) { throw new Error('Path segment type mismatch.'); }
	if(ratio < 0) { ratio = 0; }
	if(ratio > 1) { ratio = 1; }
	
	var y = this.y + ratio*(other.y - this.y);
	
	return new pathSegLinetoVertical(y);
}

pathSegLinetoVertical.prototype.clone = function() {
	return new pathSegLinetoVertical(this.y);
}