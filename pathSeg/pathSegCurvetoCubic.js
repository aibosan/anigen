/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Implements SVGPathSegCurvetoCubicAbs
 */
function pathSegCurvetoCubic(x1, y1, x2, y2, x, y) {
	this.pathSegType = 6;
	this.pathSegTypeAsLetter = 'C';
	
	this.x = isNaN(x) ? 0 : x;
	this.y = isNaN(y) ? 0 : y;
	this.x1 = isNaN(x1) ? 0 : x1;
	this.y1 = isNaN(y1) ? 0 : y1;
	this.x2 = isNaN(x2) ? 0 : x2;
	this.y2 = isNaN(y2) ? 0 : y2;
}

pathSegCurvetoCubic.prototype = Object.create(pathSeg.prototype);
	
pathSegCurvetoCubic.prototype.toString = function() {
	return 'C ' + this.x1 + ' ' + this.y1 + ' ' + this.x2 + ' ' + this.y2 + ' ' + this.x + ' ' + this.y;
}
	
pathSegCurvetoCubic.prototype.moveTo = function(toX, toY, point, handle1, handle2) {
	var dX = toX - this.x;
	var dY = toY - this.y;

	if(point) {
		this.x = toX;
		this.y = toY;
	}
	if(handle1) {
		if(point) {
			this.x1 += dX;
			this.y1 += dY;
		} else {
			this.x1 = toX;
			this.y1 = toX;
		}
	}
	if(handle2) {
		if(point) {
			this.x2 += dX;
			this.y2 += dY;
		} else {
			this.x2 = toX;
			this.y2 = toX;
		}
	}
}
	
pathSegCurvetoCubic.prototype.moveBy = function(byX, byY, point, handle1, handle2) {
	if(point) {
		this.x += byX;
		this.y += byY;
	}
	if(handle1) {
		this.x1 += byX;
		this.y1 += byY;
	}
	if(handle2) {
		this.x2 += byX;
		this.y2 += byY;
	}
}
	
pathSegCurvetoCubic.prototype.getAdjusted = function(matrix) {
	if(!(matrix instanceof SVGMatrix)) { return this; }
	var adjusted1 = matrix.toViewport(this.x1, this.y1);
	var adjusted2 = matrix.toViewport(this.x2, this.y2);
	var adjusted = matrix.toViewport(this.x, this.y);
	return new pathSegCurvetoCubic(adjusted1.x, adjusted1.y, adjusted2.x, adjusted2.y, adjusted.x, adjusted.y);
}
	
pathSegCurvetoCubic.prototype.adjust = function(matrix) {
	var adjusted = this.getAdjusted(matrix);
	this.x1 = adjusted.x1;
	this.y1 = adjusted.y1;
	this.x2 = adjusted.x2;
	this.y2 = adjusted.y2;
	this.x = adjusted.x;
	this.y = adjusted.y;
	return this;
}
	
pathSegCurvetoCubic.prototype.inbetween = function(other, ratio) {
	if(!(other instanceof pathSegCurvetoCubic)) { throw new Error('Path segment type mismatch.'); }
	if(ratio == null) { ratio = 0; }
	
	var x1 = this.x1 + ratio*(other.x1 - this.x1);
	var y1 = this.y1 + ratio*(other.y1 - this.y1);
	var x2 = this.x2 + ratio*(other.x2 - this.x2);
	var y2 = this.y2 + ratio*(other.y2 - this.y2);
	var x = this.x + ratio*(other.x - this.x);
	var y = this.y + ratio*(other.y - this.y);
	
	return new pathSegCurvetoCubic(x1, y1, x2, y2, x, y);
}

pathSegCurvetoCubic.prototype.clone = function() {
	return new pathSegCurvetoCubic(this.x1, this.y1, this.x2, this.y2, this.x, this.y);
}

pathSegCurvetoCubic.prototype.split = function(ratio, fromPoint) {
	var val = this.getValue(ratio, fromPoint);
	
	var middle = new pathSegCurvetoCubic(
		fromPoint.x+(this.x1-fromPoint.x)*ratio, fromPoint.y+(this.y1-fromPoint.y)*ratio,
		-1*val.dX*ratio/3+val.x, -1*val.dY*ratio/3+val.y,
		val.x, val.y
		);
	
	ratio = 1-ratio;
		
	var end = new pathSegCurvetoCubic(
		val.dX*ratio/3+val.x, val.dY*ratio/3+val.y,
		this.x+(this.x2-this.x)*ratio, this.y+(this.y2-this.y)*ratio,
		this.x, this.y
		);
		
	return [ middle, end ];
}

pathSegCurvetoCubic.prototype.getValue = function(ratio, fromPoint) {
	if(!fromPoint || fromPoint.x == null || fromPoint.y == null) { return; }
	
	if(ratio < 0) { ratio = 0; }
	if(ratio > 1) { ratio = 1; }
	
	var x = Math.pow((1-ratio), 3)*fromPoint.x + 
		3*Math.pow((1-ratio), 2)*ratio*this.x1 + 
		3*(1-ratio)*Math.pow(ratio,2)*this.x2 + 
		Math.pow(ratio, 3)*this.x;
	
	var y = Math.pow((1-ratio), 3)*fromPoint.y + 
		3*Math.pow((1-ratio), 2)*ratio*this.y1 + 
		3*(1-ratio)*Math.pow(ratio,2)*this.y2 + 
		Math.pow(ratio, 3)*this.y;
	
	
	var dX = 3*Math.pow((1-ratio), 2)*(this.x1-fromPoint.x) + 
		6*(1-ratio)*ratio*(this.x2-this.x1) + 
		3*Math.pow(ratio, 2)*(this.x-this.x2);
		
	var dY = 3*Math.pow((1-ratio), 2)*(this.y1-fromPoint.y) + 
		6*(1-ratio)*ratio*(this.y2-this.y1) + 
		3*Math.pow(ratio, 2)*(this.y-this.y2);
	
	return {
		'x': x,
		'y': y,
		'dX': dX,
		'dY': dY
	};
}
