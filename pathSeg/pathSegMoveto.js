/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Implements SVGPathSegMovetoAbs
 */
function pathSegMoveto(x, y) {
	this.pathSegType = 2;
	this.pathSegTypeAsLetter = 'M';
	
	this.x = x;
	this.y = y;
}

pathSegMoveto.prototype = Object.create(pathSeg.prototype);
	
pathSegMoveto.prototype.toString = function() {
	return 'M ' + this.x + ' ' + this.y;
}
	
pathSegMoveto.prototype.moveTo = function(toX, toY, point) {
	var dX = toX - this.x;
	var dY = toY - this.y;
	if(point) {
		this.x = toX;
		this.y = toY;
	}
}
	
pathSegMoveto.prototype.moveBy = function(byX, byY, point) {
	if(point) {
		this.x += byX;
		this.y += byY;
	}
}
	
pathSegMoveto.prototype.getAdjusted = function(matrix) {
	if(!(matrix instanceof SVGMatrix)) { return this; }
	var adjusted = matrix.toViewport(this.x, this.y);
	return new pathSegMoveto(adjusted.x, adjusted.y);
}
	
pathSegMoveto.prototype.adjust = function(matrix) {
	var adjusted = this.getAdjusted(matrix);
	this.x = adjusted.x;
	this.y = adjusted.y;
	return this;
}
	
pathSegMoveto.prototype.inbetween = function(other, ratio) {
	if(!(other instanceof pathSegMoveto)) { throw new Error('Path segment type mismatch.'); }
	if(ratio == null) { ratio = 0; }
	
	var x = this.x + ratio*(other.x - this.x);
	var y = this.y + ratio*(other.y - this.y);
	
	return new pathSegMoveto(x, y);
}

pathSegMoveto.prototype.clone = function() {
	return new pathSegMoveto(this.x, this.y);
}