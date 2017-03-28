/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 */
function angle() {
    this.angle = null;
    this.x = null;
    this.y = null;
	
	if(typeof arguments[0] === 'string') {
		var input = arguments[0].replace(/,/g, ' ').replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
		input = input.split(" ");
	
		if(input.length >= 1 && !isNaN(input[0])) { this.angle = parseFloat(input[0]); }
		if(input.length >= 2 && !isNaN(input[1])) { this.x = parseFloat(input[1]); }
		if(input.length >= 3 && !isNaN(input[0])) { this.y = parseFloat(input[2]); }
	} else {
		if(typeof arguments[0] === 'number') { this.angle = arguments[0]; }
		if(typeof arguments[1] === 'number') { this.x = arguments[1]; }
		if(typeof arguments[2] === 'number') { this.y = arguments[2]; }
	}
	
	if((this.angle == null && this.x == null && this.y == null) ||
		isNaN(this.angle) || isNaN(this.x) || isNaN(this.y)) {
		this.invalid = true;
	}
}

angle.prototype.isInvertible = function() {
	return true;
}

angle.prototype.isScalable = function() {
	return true;
}

angle.prototype.invert = function() {
	if(this.angle != null) { this.angle *= -1; }
}

angle.prototype.scale = function(factor) {
	if(typeof factor === 'number') {
		if(this.angle != null) { this.angle *= factor; }
	} else {
		if(this.x != null) { this.x *= factor.x; }
		if(this.y != null) { this.y *= factor.y; }
		if(this.angle != null) { this.angle *= factor.angle; }
	}
}

angle.prototype.toString = function() {
	var out = "";
	if(this.angle != null) { out += String(this.angle); }
	if(this.x != null) { out += " " + String(this.x); }
	if(this.y != null) { out += " " + String(this.y); }
	return out;
}

angle.prototype.clone = function() {
	return new angle(this.angle, this.x, this.y);
}

angle.prototype.inbetween = function(other, ratio) {
	if(ratio == null) { ratio = 0; }
	if(this.x == null || this.y == null) {
		return new angle((this.angle+(other.angle-this.angle)*ratio));
	} else {
		return new angle((this.angle+(other.angle-this.angle)*ratio) + " " + (this.x+(other.x-this.x)*ratio) + " " + (this.y+(other.y-this.y)*ratio));
	}
}



