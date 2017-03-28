/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Governs time value similar to https://www.w3.org/TR/SVG/animate.html#BeginValueSyntax for begin and dur values of SVGAnimationElement
 */
function time(input) {
    this.value = 0;
	this.unit = 's';
	this.seconds = 0;
	
	// governs non-time values such as "indefinite", "never" etc.
    this.special = false;
	
	if(typeof input === 'string') {
		input = input.replace(/\s+/g, '');
	} else {
		input = String(input);
	}

    if(isNaN(parseFloat(input))) {
        this.special = true;
        this.value = input;
    } else {
        this.value = parseFloat(input);

        switch(input.replace(/^[+-]{0,1}[0-9]+/, '')) {
            case "h":
				this.seconds = this.value*3600;
				this.unit = 'h';
				break;
            case "min": 
				this.seconds = this.value*60;
				this.unit = 'min';
				break;
            case "ms":
				this.seconds = this.value*0.001;
				this.unit = 'ms';
				break;
			default:
				this.seconds = this.value;
				this.unit = 's';
				break;
        }
    }
}

time.prototype.clone = function() {
	return new time(this.seconds+'s');
}

time.prototype.toString = function() {
	if(this.special) { return this.value; }
	return this.value + this.unit;
}