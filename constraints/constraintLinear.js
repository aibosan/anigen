/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Constraint enforcing motion between two points, or along the line defined by them
 */
function constraintLinear(pointA, pointB, hard, optional) {
    this.a = pointA;
	this.b = pointB;
	this.hard = hard;
	this.optional = optional;
	
	this.vector = { x: pointB.x - pointA.x, y: pointB.y - pointA.y };
	
	this.resolve = function(x, y, keys) {
		if(keys.altKey) {
			return { 'x': this.a.x, 'y': this.a.y }
		}
		if((this.optional && !keys.ctrlKey) || (this.vector.x == 0 && this.vector.y == 0)) {
			return { 'x': x, 'y': y }
		}
		
		var c = (y - this.a.y)*this.vector.y/(this.vector.x*this.vector.x + this.vector.y*this.vector.y) + 
				(x - this.a.x)*this.vector.x/(this.vector.x*this.vector.x + this.vector.y*this.vector.y);
		
		
		if(this.hard) {
			if(c > 1) { c = 1; }
			if(c < 0) { c = 0; }
		}
		
		return {
			'x': this.a.x + c*this.vector.x,
			'y': this.a.y + c*this.vector.y
		}
	};
}