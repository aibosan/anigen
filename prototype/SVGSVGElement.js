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

SVGSVGElement.prototype.consumeAnimations = function(recursive) {
	if(recursive) {
		for(var i = 0; i < this.children.length; i++) {
			if(!(this.children[i] instanceof SVGAnimationElement)) {
				this.children[i].consumeAnimations(recursive);
			}
		}
	}
}

SVGSVGElement.prototype.translateBy = function() {}