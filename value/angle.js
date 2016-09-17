/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 */
function angle(input) {
    this.angle = null;
    this.x = null;
    this.y = null;

    if(input == null) { return; }
    input = input.replace(/,/g, ' ').replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
    input = input.split(" ");
	
    if(input.length >= 1 && !isNaN(input[0])) { this.angle = parseFloat(input[0]); }
    if(input.length >= 2 && !isNaN(input[1])) { this.x = parseFloat(input[1]); }
    if(input.length >= 3 && !isNaN(input[0])) { this.y = parseFloat(input[2]); }
}

angle.prototype.invert = function() {
	if(this.angle != null) { this.angle *= -1; }
}

angle.prototype.toString = function() {
	var out = "";
	if(this.angle != null) { out += String(this.angle); }
	if(this.x != null) { out += " " + String(this.x); }
	if(this.y != null) { out += " " + String(this.y); }
	return out;
}

angle.prototype.clone = function() {
	return new angle(this.angle + " " + this.x + " " + this.y);
}

angle.prototype.inbetween = function(other, ratio) {
	if(this.x == null || this.y == null) {
		return new angle((this.angle+(other.angle-this.angle)*ratio));
	} else {
		return new angle((this.angle+(other.angle-this.angle)*ratio) + " " + (this.x+(other.x-this.x)*ratio) + " " + (this.y+(other.y-this.y)*ratio));
	}
}

