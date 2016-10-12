/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for SVG "svg" element
 */

SVGSVGElement.prototype.consumeTransform = function() {
	for(var i = 0; i < this.children.length; i++) {
		this.children[i].consumeTransform();
	}
}

SVGSVGElement.prototype.translateBy = function() {}