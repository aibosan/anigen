/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Constraint enforcing motion between two points, or along the line defined by them
 */
function constraintLinear(pointA, pointB, flags) {
    this.a = pointA;
	this.b = pointB;
	
	this.flags = flags || {};
}

constraintLinear.prototype.resolve = function(x, y, keys) {
	this.vector = { 'x': this.b.x - this.a.x, 'y': this.b.y - this.a.y };
	if(keys.altKey) {
		return { 'x': this.a.x, 'y': this.a.y }
	}
	if((this.flags.optional && !keys.ctrlKey) || (this.vector.x == 0 && this.vector.y == 0)) {
		return { 'x': x, 'y': y }
	}
	
	var c = (y - this.a.y)*this.vector.y/(this.vector.x*this.vector.x + this.vector.y*this.vector.y) + 
			(x - this.a.x)*this.vector.x/(this.vector.x*this.vector.x + this.vector.y*this.vector.y);
	
	
	if((this.flags.hardMin || this.flags.hard) && (c <= 0)) { c = 0; }
	if((this.flags.hardMax || this.flags.hard) && (c >= 1)) { c = 1; }
	
	
	return {
		'x': this.a.x + c*this.vector.x,
		'y': this.a.y + c*this.vector.y
	}
}