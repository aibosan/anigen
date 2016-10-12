/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Implements SVGPathSegArcAbs
 */
function pathSegArc(rx, ry, rotation, largeArc, sweep, x, y) {
	this.pathSegType = 10;
	this.pathSegTypeAsLetter = 'A';
	
	this.rx = rx;
	this.ry = ry;
	this.rotation = rotation;
	this.largeArc = largeArc;
	this.sweep = sweep;
	this.x = x;
	this.y = y;
}

pathSegArc.prototype = Object.create(pathSeg.prototype);
	
pathSegArc.prototype.toString = function() {
	return 'A ' + this.rx + ' ' + this.ry + ' ' + this.rotation + ' ' + this.largeArc + ' ' + this.sweep + ' ' + this.x + ' ' + this.y;
}
	
pathSegArc.prototype.moveTo = function(toX, toY, point, radiusX, radiusY) {
	var dX = toX - this.x;
	var dY = toY - this.y;
	if(point) {
		this.x = toX;
		this.y = toY;
	}
	if(radiusX) {
		if(point) {
			this.rx += dX;
		} else {
			this.rx = toX;
		}
	}
	if(radiusY) {
		if(point) {
			this.ry += dX;
		} else {
			this.ry = toX;
		}
	}
}
	
pathSegArc.prototype.moveBy = function(byX, byY, point, radiusX, radiusY) {
	if(point) {
		this.x += byX;
		this.y += byY;
	}
	if(radiusX) {
		this.rx += byX;
	}
	if(radiusY) {
		this.ry += byY;
	}
}
	
pathSegArc.prototype.getAdjusted = function(matrix) {
	if(!(matrix instanceof SVGMatrix)) { return this; }
	var adjustedR = matrix.toViewport(this.rx, this.ry);
	
	var rotX = Math.cos(Math.PI*this.rotation/180);
	var rotY = Math.sin(Math.PI*this.rotation/180);
	var adjustedRot = matrix.toViewport(rotX, rotY);
	var newRot = Math.atan2(adjustedRot.y, adjustedRot.x);
	if(newRot < 0) { newRot += 2*Math.PI; }
	
	var adjusted = matrix.toViewport(this.x, this.y);
	return new pathSegArc(adjustedR.x, adjustedR.y, newRot, this.largeArc, this.sweep, adjusted.x, adjusted.y);
}
	
pathSegArc.prototype.adjust = function(matrix) {
	var adjusted = this.getAdjusted(matrix);
	this.rx = adjusted.rx;
	this.ry = adjusted.ry;
	this.rotation = adjusted.rotation;
	this.largeArc = adjusted.largeArc;
	this.sweep = adjusted.sweep;
	this.x = adjusted.x;
	this.y = adjusted.y;
	return this;
}
	
pathSegArc.prototype.inbetween = function(other, ratio) {
	if(!(other instanceof pathSegArc)) { throw new Error('Path segment type mismatch.'); }
	if(ratio == null) { ratio = 0; }
	
	var rx = this.rx + ratio*(other.rx - this.rx);
	var ry = this.ry + ratio*(other.ry - this.ry);
	var rotation = this.rotation + ratio*(other.rotation - this.rotation);
	var largeArc = ratio >= 0.5 ? other.largeArc : this.largeArc;
	var sweep = ratio >= 0.5 ? other.sweep : this.sweep;
	var x = this.x + ratio*(other.x - this.x);
	var y = this.y + ratio*(other.y - this.y);
	
	return new pathSegArc(rx, ry, rotation, largeArc, sweep, x, y);
}

pathSegArc.prototype.clone = function() {
	return new pathSegArc(this.rx, this.ry, this.rotation, this.largeArc, this.sweep, this.x, this.y);
}

//pathSegArc.prototype.



