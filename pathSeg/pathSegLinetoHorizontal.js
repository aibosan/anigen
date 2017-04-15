/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Implements SVGPathSegLinetoHorizontalAbs
 */
function pathSegLinetoHorizontal(x) {
	this.pathSegType = 12;
	this.pathSegTypeAsLetter = 'H';
	
	this.x = isNaN(x) ? 0 : x;
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
	if(ratio == null) { ratio = 0; }
	
	var x = this.x + ratio*(other.x - this.x);
	
	return new pathSegLinetoHorizontal(x);
}

pathSegLinetoHorizontal.prototype.clone = function() {
	return new pathSegLinetoHorizontal(this.x);
}

pathSegLinetoHorizontal.prototype.getMin = function(begin) {
	if(!begin || begin.x == null || begin.y == null) { return; }
	
	return { 'x': Math.min(begin.x, this.x), 'y': begin.y };
}

pathSegLinetoHorizontal.prototype.getMax = function(begin) {
	if(!begin || begin.x == null || begin.y == null) { return; }
	
	return { 'x': Math.max(begin.x, this.x), 'y': begin.y };
}

pathSegLinetoHorizontal.prototype.split = function(ratio, fromPoint) {
	return [ new pathSegLinetoHorizontal(fromPoint.x+ratio*(this.x-fromPoint.x)), this ];
}

pathSegLinetoHorizontal.prototype.getValue = function(ratio, fromPoint) {
	if(!fromPoint || fromPoint.x == null || fromPoint.y == null) { return; }
	if(ratio < 0) { ratio = 0; }
	if(ratio > 1) { ratio = 1; }
	
	return { 'x': fromPoint.x+ratio*(this.x-fromPoint.x), 'y': fromPoint.y,
		'dX': ratio, 'dY': 0
	};
}

pathSegLinetoHorizontal.prototype.getLength = function(fromPoint) {
	if(!fromPoint || fromPoint.x == null) { return 0; }
	return Math.abs(this.x-fromPoint.x);
}



