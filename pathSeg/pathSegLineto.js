/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Implements SVGPathSegLinetoAbs
 */
function pathSegLineto(x, y) {
	this.pathSegType = 4;
	this.pathSegTypeAsLetter = 'L';
	
	this.x = isNaN(x) ? 0 : x;
	this.y = isNaN(y) ? 0 : y;
}

pathSegLineto.prototype = Object.create(pathSeg.prototype);
	
pathSegLineto.prototype.toString = function() {
	return 'L ' + this.x + ' ' + this.y;
}
	
pathSegLineto.prototype.moveTo = function(toX, toY, point) {
	var dX = toX - this.x;
	var dY = toY - this.y;
	if(point) {
		this.x = toX;
		this.y = toY;
	}
}
	
pathSegLineto.prototype.moveBy = function(byX, byY, point) {
	if(point) {
		this.x += byX;
		this.y += byY;
	}
}
	
pathSegLineto.prototype.getAdjusted = function(matrix) {
	if(!(matrix instanceof SVGMatrix)) { return this; }
	var adjusted = matrix.toViewport(this.x, this.y);
	return new pathSegLineto(adjusted.x, adjusted.y);
}
	
pathSegLineto.prototype.adjust = function(matrix) {
	var adjusted = this.getAdjusted(matrix);
	this.x = adjusted.x;
	this.y = adjusted.y;
	return this;
}
	
pathSegLineto.prototype.inbetween = function(other, ratio) {
	if(!(other instanceof pathSegLineto)) { throw new Error('Path segment type mismatch.'); }
	if(ratio == null) { ratio = 0; }
	
	var x = this.x + ratio*(other.x - this.x);
	var y = this.y + ratio*(other.y - this.y);
	
	return new pathSegLineto(x, y);
}

pathSegLineto.prototype.clone = function() {
	return new pathSegLineto(this.x, this.y);
}

pathSegLineto.prototype.split = function(ratio, fromPoint) {
	return [ new pathSegLineto(fromPoint.x+ratio*(this.x-fromPoint.x), fromPoint.y+ratio*(this.y-fromPoint.y)), this ];
}

pathSegLineto.prototype.getValue = function(ratio, fromPoint) {
	if(!fromPoint || fromPoint.x == null || fromPoint.y == null) { return; }
	if(ratio < 0) { ratio = 0; }
	if(ratio > 1) { ratio = 1; }
	
	return { 'x': fromPoint.x+ratio*(this.x-fromPoint.x), 'y': fromPoint.y+ratio*(this.y-fromPoint.y)
		
	};
}

pathSegLineto.prototype.getLength = function(fromPoint) {
	if(!fromPoint || fromPoint.x == null || fromPoint.y == null) { return 0; }
	return distance(this, fromPoint);
}
