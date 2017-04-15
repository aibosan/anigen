/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Implements SVGPathSegLinetoVerticalAbs
 */
function pathSegLinetoVertical(y) {
	this.pathSegType = 14;
	this.pathSegTypeAsLetter = 'V';
	
	this.y = isNaN(y) ? 0 : y;
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
	if(ratio == null) { ratio = 0; }
	
	var y = this.y + ratio*(other.y - this.y);
	
	return new pathSegLinetoVertical(y);
}

pathSegLinetoVertical.prototype.clone = function() {
	return new pathSegLinetoVertical(this.y);
}

pathSegLinetoVertical.prototype.getMin = function(begin) {
	if(!begin || begin.x == null || begin.y == null) { return; }
	
	return { 'x': begin.x, 'y': Math.min(begin.y, this.y) };
}

pathSegLinetoVertical.prototype.getMax = function(begin) {
	if(!begin || begin.x == null || begin.y == null) { return; }
	
	return { 'x': begin.x, 'y': Math.max(begin.y, this.y) };
}

pathSegLinetoVertical.prototype.split = function(ratio, fromPoint) {
	return [ new pathSegLinetoVertical(fromPoint.y+ratio*(this.y-fromPoint.y)), this ];
}

pathSegLinetoVertical.prototype.getValue = function(ratio, fromPoint) {
	if(!fromPoint || fromPoint.x == null || fromPoint.y == null) { return; }
	if(ratio < 0) { ratio = 0; }
	if(ratio > 1) { ratio = 1; }
	
	return { 'x': fromPoint.x, 'y': fromPoint.y+ratio*(this.y-fromPoint.y),
		'dX': 0, 'dY': ratio
	};
}

pathSegLinetoVertical.prototype.getLength = function(fromPoint) {
	if(!fromPoint || fromPoint.y == null) { return 0; }
	return Math.abs(this.y-fromPoint.y);
}

