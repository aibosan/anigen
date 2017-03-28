/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for HTML "input" element
 */
 
HTMLInputElement.prototype.getSeconds = function() {
	if(!this.getAttribute('type') == 'time') { return null; }
	
	var h, m, s, ms;
	var val = this.value.split('.');
		ms = val.length == 2 ? parseInt(val[1]) : 0;
		val = val[0].split(':');
		
	if(val.length == 3) {
		h = parseInt(val[0]);
		m = parseInt(val[1]);
		s = parseInt(val[2]);
	} else {
		h = parseInt(val[0]);
		m = parseInt(val[1]);
		s = 0;
	}
	
	return h*3600 + m*60 + s + 0.001*ms;
}

