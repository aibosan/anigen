/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 */
function color(input) {
	this.r = 0;
	this.g = 0;
	this.b = 0;
	
	if(typeof input == 'string') {
		if(input.startsWith('#')) {		// assume hex value
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(input);
			this.r = parseInt(result[1], 16);
			this.g = parseInt(result[2], 16);
			this.b = parseInt(result[3], 16);
		} else if(input.startsWith('rgb')) {
			var result = input.replace(/^rgb\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
			if(result.length != 3) { return; }
			this.r = parseInt(result[0]);
			this.g = parseInt(result[1]);
			this.b = parseInt(result[2]);
		} else {		// name values not supported right now
			return;
		}
	} else if(input instanceof color) {
		this.r = input.r;
		this.g = input.g;
		this.b = input.b;
	} else {
		return;
	}
}

color.prototype.getColor = function() {
	return { 'red': this.r, 'green': this.g, 'blue': this.b };
}

color.prototype.getHex = color.prototype.toString = function() {
	return "#"+ ('0'+this.r.toString(16)).slice(-2) + '' + ('0'+this.g.toString(16)).slice(-2) + '' + ('0'+this.b.toString(16)).slice(-2);
}

color.prototype.getInverted = function() {
	return { 'red': (255-this.r), 'green': (255-this.g), 'blue': (255-this.b) };
}

color.prototype.getHexInverted = function() {
	return "#"+('0'+(255-this.r).toString(16)).slice(-2) + '' +  ('0'+(255-this.g).toString(16)).slice(-2) + '' + ('0'+(255-this.b).toString(16)).slice(-2);
}

color.prototype.invert = function() {
	this.r = 255-this.r;
	this.g = 255-this.g;
	this.b = 255-this.b;
}