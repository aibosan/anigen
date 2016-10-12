/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 */
function coordinates(input) {
    this.x = 0;
    this.y = 0;

    if(input == null) { return; }
    input = input.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
    input = input.split(" ");

    if(input.length >= 1 && !isNaN(input[0])) { this.x = parseFloat(input[0]); }
    if(input.length >= 2 && !isNaN(input[1])) { this.y = parseFloat(input[1]); }
}

coordinates.prototype.invert = function() {
	this.x *= -1;
	this.y *= -1;
}

coordinates.prototype.toString = function() {
	return String(this.x) + " " + String(this.y);
}

coordinates.prototype.clone = function() {
	return new coordinates(this.toString());
}

coordinates.prototype.inbetween = function(other, ratio) {
	if(ratio == null) { ratio = 0; }
	return new coordinates((this.x+(other.x-this.x)*ratio) + " " + (this.y+(other.y-this.y)*ratio));
}