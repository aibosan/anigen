/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		"Abstract" class inherited by other pathSeg classes; implementation of SVGPathSeg
 */
function pathSeg() { }

pathSeg.prototype.negate = function() {
	if(this.x != null) { this.x = -1*this.x; }
	if(this.y != null) { this.y = -1*this.y; }
	if(this.x1 != null) { this.x1 = -1*this.x1; }
	if(this.y1 != null) { this.y1 = -1*this.y1; }
	if(this.x2 != null) { this.x2 = -1*this.x2; }
	if(this.y2 != null) { this.y2 = -1*this.y2; }
}

pathSeg.prototype.sum = function(other) {
	if(!(other instanceof pathSeg)) { return; }
	if(this.x != null && other.x != null) { this.x += other.x; }
	if(this.y != null && other.y != null) { this.y += other.y; }
	if(this.x1 != null && other.x1 != null) { this.x1 += other.x1; }
	if(this.y1 != null && other.y1 != null) { this.y1 += other.y1; }
	if(this.x2 != null && other.x2 != null) { this.x2 += other.x2; }
	if(this.y2 != null && other.y2 != null) { this.y2 += other.y2; }
}

pathSeg.prototype.transform = function(matrix) {
	if(!matrix || !(matrix instanceof SVGMatrix)) { return; }
	
	// this is for horizontal and vertical lineto; it should actually convert them to regular (x,y) lineto if necessary (pass that on?)
	if(this instanceof pathSegLinetoVertical) {
		var mul = matrix.multiply(0, this.y);
		if(mul.x != 0) {
			return new pathSegLineto(mul.x, mul.y);
		}
		this.y = mul.y;
		return this;
	}
	if(this instanceof pathSegLinetoHorizontal) {
		var mul = matrix.multiply(this.x, 0);
		if(mul.y != 0) {
			return new pathSegLineto(mul.x, mul.y);
		}
		this.x = mul.x;
		return this;
	}
	
	if(this.x != null && this.y != null) {
		var mul = matrix.multiply(this.x, this.y);
		this.x = mul.x;
		this.y = mul.y;
	}
	
	if(this.x1 != null && this.y1 != null) {
		var mul = matrix.multiply(this.x1, this.y1);
		this.x1 = mul.x;
		this.y1 = mul.y;
	}
	
	if(this.x2 != null && this.y2 != null) {
		var mul = matrix.multiply(this.x2, this.y2);
		this.x2 = mul.x;
		this.y2 = mul.y;
	}
	
	return this;
}

pathSeg.prototype.getMin = function(begin) {
	if(!begin || begin.x == null || begin.y == null) { return; }
	
	return {
		'x': Math.min(begin.x, this.x, this.x1, this.x2),
		'y': Math.min(begin.y, this.y, this.y1, this.y2)
	}
}

pathSeg.prototype.getMax = function(begin) {
	if(!begin || begin.x == null || begin.y == null) { return; }
	
	return {
		'x': Math.max(begin.x, this.x, this.x1, this.x2),
		'y': Math.max(begin.y, this.y, this.y1, this.y2)
	}
}

pathSeg.prototype.split = function(ratio, fromPoint) {
	return;
}

pathSeg.prototype.getValue = function(ratio, fromPoint) {
	return;
}

pathSeg.prototype.getLength = function(fromPoint, segments) {
	if(!fromPoint || fromPoint.x == null || fromPoint.y == null) { return 0; }
	
	segments = segments || 32;
	
	var step = 1/segments;
	var previous = { 'x': fromPoint.x, 'y': fromPoint.y };
	var sum = 0;
	
	for(var i = 0; i < segments; i++) {
		var current = this.getValue(step*i, fromPoint)
		sum += distance(previous, current);
		previous = current;
	}
	
	return sum;
}


