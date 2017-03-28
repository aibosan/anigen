/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 */
function color(input) {
	this.r = 0;
	this.g = 0;
	this.b = 0;
	this.a = 255;
	
	if(typeof input == 'string') {
		if(input.startsWith('#')) {		// assume hex value
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(input);
			if(!result) { return; }
			this.r = parseInt(result[1], 16);
			this.g = parseInt(result[2], 16);
			this.b = parseInt(result[3], 16);
			this.a = result[4] ? parseInt(result[4], 16) : 255;
		} else if(input.startsWith('rgb')) {
			var result = input.replace(/^rgb\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
			if(result.length != 3) { return; }
			this.r = parseInt(result[0]);
			this.g = parseInt(result[1]);
			this.b = parseInt(result[2]);
			this.a = result[3] ? parseInt(result[3]) : 255;
		} else {		// name values not supported right now
			this.invalid = true;
			return;
		}
	} else if(input instanceof color) {
		this.r = input.r;
		this.g = input.g;
		this.b = input.b;
		this.a = input.a;
	} else {
		this.invalid = true;
		return;
	}
}

color.prototype.getColor = function() {
	return { 'red': this.r, 'green': this.g, 'blue': this.b, 'alpha': this.a };
}

color.prototype.getHex = color.prototype.toString = function(alpha) {
	var out = "#"+ ('0'+this.r.toString(16)).slice(-2) + '' + ('0'+this.g.toString(16)).slice(-2) + '' + ('0'+this.b.toString(16)).slice(-2);
	if(alpha) { out += ('0'+this.a.toString(16)).slice(-2); }
	return out;
}

color.prototype.getInverted = function(alpha) {
	return { 'red': (255-this.r), 'green': (255-this.g), 'blue': (255-this.b), 'alpha': alpha ? (255-this.a) : this.a };
}

color.prototype.getHexInverted = function(alpha) {
	var out = "#"+('0'+(255-this.r).toString(16)).slice(-2) + '' +  ('0'+(255-this.g).toString(16)).slice(-2) + '' + ('0'+(255-this.b).toString(16)).slice(-2);
	if(alpha) { out += ('0'+(255-this.a).toString(16)).slice(-2); }
	return out;
}

color.prototype.invert = function(alpha) {
	this.r = 255-this.r;
	this.g = 255-this.g;
	this.b = 255-this.b;
	if(alpha) { this.a = 255-this.a; }
}

color.prototype.toString = color.prototype.getHex;
