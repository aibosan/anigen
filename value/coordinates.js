/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 */
function coordinates() {
    this.x = 0;
    this.y = 0;
	
	if(typeof arguments[0] === 'string') {
		var input = arguments[0].replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
		input = input.split(" ");
		
		if(input.length >= 1 && !isNaN(input[0])) { this.x = parseFloat(input[0]); }
		if(input.length >= 2 && !isNaN(input[1])) { this.y = parseFloat(input[1]); }
	} else {
		if(typeof arguments[0] === 'number') { this.x = arguments[0]; }
		if(typeof arguments[1] === 'number') { this.y = arguments[1]; }
	}
	if((this.x == null && this.y == null) ||
		isNaN(this.x) || isNaN(this.y)) {
		this.invalid = true;
	}
}

coordinates.prototype.isInvertible = function() {
	return true;
}

coordinates.prototype.isScalable = function() {
	return true;
}

coordinates.prototype.invert = function() {
	this.x *= -1;
	this.y *= -1;
}

coordinates.prototype.scale = function(factor) {
	if(typeof factor === 'number') {
		this.x *= factor;
		this.y *= factor;
	} else {
		if(this.x != null) { this.x *= factor.x; }
		if(this.y != null) { this.y *= factor.y; }
	}
}

coordinates.prototype.toString = function() {
	return String(this.x) + " " + String(this.y);
}

coordinates.prototype.clone = function() {
	return new coordinates(this.x, this.y);
}

coordinates.prototype.inbetween = function(other, ratio) {
	if(ratio == null) { ratio = 0; }
	return new coordinates((this.x+(other.x-this.x)*ratio) + " " + (this.y+(other.y-this.y)*ratio));
}