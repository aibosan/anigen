/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Implements timing splines for SVGAnimationElement
 */
function spline() {
	this.type = null;
    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 1;
    this.y2 = 1;
	
	// sets this spline to one of the given types (default values like linear, ease-in ease-out etc.)
	this.setType = function(type) {
		switch(type) {
			case 0:	this.x1 = 0; this.y1 = 0; this.x2 = 1; this.y2 = 1; this.type = 0; break;
			case 1:	this.x1 = .25; this.y1 = 0; this.x2 = .75; this.y2 = 1; this.type = 1; break;
			case 2:	this.x1 = .25; this.y1 = 0; this.x2 = .75; this.y2 = .75; this.type = 2; break;
			case 3:	this.x1 = .25; this.y1 = .25; this.x2 = .75; this.y2 = 1; this.type = 3; break;
			case 4:	this.x1 = .5; this.y1 = 0; this.x2 = .5; this.y2 = 1; this.type = 4; break;
			case 5:	this.x1 = .5; this.y1 = 0; this.x2 = .5; this.y2 = .5; this.type = 5; break;
			case 6:	this.x1 = .5; this.y1 = .5; this.x2 = .5; this.y2 = 1; this.type = 6; break;
			default: this.type = null; return false;
		}
		return true;
	};
	
	// sets type of spline if all numerical values correspond to the existing type 
	this.evaluateType = function() {
		if(this.x1 == 0 && this.y1 == 0 && this.x2 == 1 && this.y2 == 1) { this.type = 0; }
		if(this.x1 == .25 && this.y1 == 0 && this.x2 == .75 && this.y2 == 1) { this.type = 1; }
		if(this.x1 == .25 && this.y1 == 0 && this.x2 == .75 && this.y2 == .75) { this.type = 2; }
		if(this.x1 == .25 && this.y1 == .25 && this.x2 == .75 && this.y2 == 1) { this.type = 3; }
		if(this.x1 == .5 && this.y1 == 0 && this.x2 == .5 && this.y2 == 1) { this.type = 4; }
		if(this.x1 == .5 && this.y1 == 0 && this.x2 == .5 && this.y2 == .5) { this.type = 5; }
		if(this.x1 == .5 && this.y1 == .5 && this.x2 == .5 && this.y2 == 1) { this.type = 6; }
	};
	
	var input = [];
	
	if(arguments.length == 1) {
		if(!isNaN(arguments[0])) {
			this.setType(parseInt(arguments[0]));
		} else if(typeof arguments[0] === 'string') {
			input = arguments[0];
			input = input.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
			input = input.split(" ");
			if(input.length != 4) { return; }
		} else if(arguments[0] instanceof spline) {
			input = [ arguments[0].x1, arguments[0].y1, arguments[0].x2, arguments[0].y2 ];
		} 
	} else if(arguments.length == 4) {
		input = arguments;
	} else {
		return;
	}
	
	if(this.type == null) {
		if(!isNaN(input[0]) && parseFloat(input[0]) <= 1 && parseFloat(input[0]) >= 0) { this.x1 = Math.round(parseFloat(input[0]) * 100) / 100; }
		if(!isNaN(input[1]) && parseFloat(input[1]) <= 1 && parseFloat(input[1]) >= 0) { this.y1 = Math.round(parseFloat(input[1]) * 100) / 100; }
		if(!isNaN(input[2]) && parseFloat(input[2]) <= 1 && parseFloat(input[2]) >= 0) { this.x2 = Math.round(parseFloat(input[2]) * 100) / 100; }
		if(!isNaN(input[3]) && parseFloat(input[3]) <= 1 && parseFloat(input[3]) >= 0) { this.y2 = Math.round(parseFloat(input[3]) * 100) / 100; }
	}
	this.evaluateType();
}

// returns string with readable value (without leading zeros)
spline.prototype.toString = function() {
	return String(this.x1).replace("0.",".") + " " + String(this.y1).replace("0.",".") + " " + String(this.x2).replace("0.",".") + " " + String(this.y2).replace("0.",".");
}

// returns spline type name or null if the spline has no type
spline.prototype.getType = function() {
	switch(this.type) {
		case 0: return 'linear';
		case 1: return 'ease in, ease out';
		case 2: return 'ease in';
		case 3: return 'ease out';
		case 4: return 'ease in, ease out (sharp)';
		case 5: return 'ease in (sharp)';
		case 6: return 'ease out (sharp)';
	}
}

// returns list of existing types
spline.prototype.getTypes = function() {
	return [ 'linear', 'ease in, ease out', 'ease in', 'ease out', 'ease in, ease out (sharp)', 'ease in (sharp)', 'ease out (sharp)', ]
}

spline.prototype.getSelect = function() {
	var types = this.getTypes();
	var opt = [];
	for(var i = 0; i < types.length; i++) {
		opt.push({ 'text': types[i], 'value': i });
	}
	return build.select(opt);
}

// returns spline's value <0;1> for given time <0;1>
spline.prototype.getValue = function(x) {
	if(x <= 0) { return 0; }
	if(x >= 1) { return 1; }	// defaults for origin points
	
	var pX = [ 0, this.x1, this.x2, 1 ];
	var pY = [ 0, this.y1, this.y2, 1 ];
	var lX = [ x, x ];
	var lY = [ 0, 1 ];
	
	var intersection = computeIntersections(pX,pY,lX,lY);
	return intersection[intersection.length-1].y;
}

// returns clone of this element (for deep copies)
spline.prototype.clone = function() { 
	return new spline(this.x1 + " " + this.y1 + " " + this.x2 + " " + this.y2);
}
