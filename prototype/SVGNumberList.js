/**
 *  @author		Ondrej Benda
 *  @date		2017
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for SVGNumberList
 */

SVGNumberList.prototype.toString = function() {
	var arr = [];
	for(var i = 0; i < this.length; i++) {
		arr.push(this.getItem(i));
	}
	return arr.length > 0 ? arr.join(' ') : null;
}



