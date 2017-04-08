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

SVGSVGElement.prototype.isVisualElement = function() { return true; }

SVGSVGElement.prototype.regenerateId = function(inDocument) {
	var links = this.getLinkList(true, false, inDocument);
	this.stripId(true);
	this.generateId(true);
	
	for(var i = 0; i < links.length; i++) {
		if(!links[i].owner || !links[i].target || !links[i].owner.isChildOf(this.parentNode) || !links[i].target.isChildOf(this.parentNode)) { continue; }
		if(links[i].css) {
			links[i].owner.style[links[i].attribute] = links[i].type == 1 ? '#'+links[i].target.getAttribute('id') : 'url("#'+links[i].target.getAttribute('id')+'")';
		} else {
			links[i].owner.setAttribute(links[i].attribute, links[i].type == 1 ? '#'+links[i].target.getAttribute('id') : 'url("#'+links[i].target.getAttribute('id')+'")');
		}
	}
}
