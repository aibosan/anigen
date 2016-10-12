/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 */
function rectangle(input) {
    this.x = 0;
    this.y = 0;
	this.width = 0;
    this.height = 0;

    if(input == null) { return; }
    input = input.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
    input = input.split(" ");

    if(input.length >= 1 && !isNaN(input[0])) { this.x = parseFloat(input[0]); }
    if(input.length >= 2 && !isNaN(input[1])) { this.y = parseFloat(input[1]); }
	if(input.length >= 1 && !isNaN(input[2])) { this.width = parseFloat(input[2]); }
    if(input.length >= 2 && !isNaN(input[3])) { this.height = parseFloat(input[3]); }
}

rectangle.prototype.invert = function() {
	this.x *= -1;
	this.y *= -1;
}

rectangle.prototype.toString = function() {
	return String(this.x) + " " + String(this.y) + " " + String(this.width) + " " + String(this.height);
}

rectangle.prototype.clone = function() {
	return new rectangle(this.toString());
}

rectangle.prototype.inbetween = function(other, ratio) {
	if(ratio == null) { ratio = 0; }
	return new rectangle((this.x+(other.x-this.x)*ratio) + " " + (this.y+(other.y-this.y)*ratio) + " " + (this.width+(other.width-this.width)*ratio) + " " + (this.height+(other.height-this.height)*ratio));
}