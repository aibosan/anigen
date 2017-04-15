/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Implements SVGPathSegArcAbs
 */
function pathSegArc(rx, ry, rotation, largeArc, sweep, x, y) {
	this.pathSegType = 10;
	this.pathSegTypeAsLetter = 'A';
	
	this.rx = isNaN(rx) ? 0 : Math.abs(rx);
	this.ry = isNaN(ry) ? 0 : Math.abs(ry);
	this.rotation = isNaN(rotation) ? 0 : rotation%360;
	this.largeArc = isNaN(largeArc) ? 0 : largeArc;
	this.sweep = isNaN(sweep) ? 0 : sweep;
	this.x = isNaN(x) ? 0 : x;
	this.y = isNaN(y) ? 0 : y;
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

pathSegArc.prototype.split = function(ratio, fromPoint) {
	if(!fromPoint || fromPoint.x == null || fromPoint.y == null) { return [this]; }
	var val = this.getValue(ratio, fromPoint);
	
	var arc1 = this.largeArc;
	var arc2 = this.largeArc;
	
	var absD = Math.abs(val.dAngle);
	
	if((absD >= Math.PI && absD*ratio < Math.PI) || (absD < Math.PI && absD*ratio > Math.PI)) {
		arc1 = this.largeArc == 1 ? 0 : 1;
	}
	
	if((absD >= Math.PI && absD*(1-ratio) < Math.PI) || (absD < Math.PI && absD*(1-ratio) > Math.PI)) {
		arc2 = this.largeArc == 1 ? 0 : 1;
	}
	
	
	var middle = new pathSegArc(this.rx, this.ry, this.rotation, arc1, this.sweep, val.x, val.y);
	var end = new pathSegArc(this.rx, this.ry, this.rotation, arc2, this.sweep, this.x, this.y);
	
	return [ middle, end ];
}

pathSegArc.prototype.getValue = function(ratio, fromPoint) {
	if(!fromPoint || fromPoint.x == null || fromPoint.y == null) { return 0; }
	
	var angle = Math.PI*this.rotation/180;
	
	var x1S = Math.cos(angle)*(fromPoint.x-this.x)/2+Math.sin(angle)*(fromPoint.y-this.y)/2;
	var y1S = -1*Math.sin(angle)*(fromPoint.x-this.x)/2+Math.cos(angle)*(fromPoint.y-this.y)/2;
	
	var k = this.largeArc == this.sweep ? -1 : +1;
	
	var cS = k*Math.sqrt(
		(this.rx*this.rx*this.ry*this.ry - this.rx*this.rx*y1S*y1S - this.ry*this.ry*x1S*x1S)/
		(this.rx*this.rx*y1S*y1S + this.ry*this.ry*x1S*x1S)
	);
	var cxS = cS*(this.rx*y1S/this.ry);
	var cyS = -1*cS*(this.ry*x1S/this.rx);
	
	var cx = Math.cos(angle)*cxS-Math.sin(angle)*cyS + (fromPoint.x+this.x)/2;
	var cy = Math.sin(angle)*cxS+Math.cos(angle)*cyS + (fromPoint.y+this.y)/2;
	
	var vectorLength = function(u) {
		return Math.sqrt(Math.pow(u[0],2)+Math.pow(u[1],2));
	}
	
	var vectorAngle = function(u,v) {
		return ((u[0]*v[1]-u[1]*v[0])<0?-1:1)*Math.acos((u[0]*v[0]+u[1]*v[1])/vectorLength(u)*vectorLength(v));
	}
	
	var the1 = vectorAngle([1,0],[(x1S-cxS)/this.rx,(y1S-cyS)/this.ry]);
	var dthe1 = vectorAngle([(x1S-cxS)/this.rx,(y1S-cyS)/this.ry],[(-1*x1S-cxS)/this.rx,(-1*y1S-cyS)/this.ry])%(2*Math.PI);
	
	if(this.sweep == 0 && dthe1 > 0) { dthe1 -= 2*Math.PI; }
	if(this.sweep == 1 && dthe1 < 0) { dthe1 += 2*Math.PI; }
	
	var x = Math.cos(angle)*this.rx*Math.cos(the1+ratio*dthe1) - Math.sin(angle)*this.ry*Math.sin(the1+ratio*dthe1) + cx;
	var y = Math.sin(angle)*this.rx*Math.cos(the1+ratio*dthe1) + Math.cos(angle)*this.ry*Math.sin(the1+ratio*dthe1) + cy;
	
	return { 
		'x': x,
		'y': y,
		'angle': the1,
		'dAngle': dthe1
	};
}



