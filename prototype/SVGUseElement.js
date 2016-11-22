/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for SVG <use> element
 */

SVGUseElement.prototype.getCenter = function(viewport) {
	if(!this.getAttribute('xlink:href')) { return null; }
	
	var linked = document.getElementById(this.getAttribute('xlink:href').substring(1));
	
	if(!linked) { return null; }
	
	var transform = this.getCTMBase();
	
	var linkedCenter = linked.getCenter(viewport);
	//return linkedCenter;
	
	var newLeft, newRight, newTop, newBottom;
	
	var topLeft = transform.toUserspace(linkedCenter.left, linkedCenter.top);
	var topRight = transform.toUserspace(linkedCenter.right, linkedCenter.top);
	var botLeft = transform.toUserspace(linkedCenter.left, linkedCenter.bottom);
	var botRight = transform.toUserspace(linkedCenter.right, linkedCenter.bottom);
	
	newLeft = Math.min(topLeft.x, topRight.x, botLeft.x, botRight.x);
	newRight = Math.max(topLeft.x, topRight.x, botLeft.x, botRight.x);
	newTop = Math.min(topLeft.y, topRight.y, botLeft.y, botRight.y);
	newBottom = Math.max(topLeft.y, topRight.y, botLeft.y, botRight.y);
	
	newCenter = { 'x': newLeft+(newRight-newLeft)/2,
					'y': newTop+(newBottom-newTop)/2
				}
	
	return {
		'x': newCenter.x, 'y': newCenter.y,
		'x_anim': newCenter.x, 'y_anim': newCenter.y,
		'left': newLeft, 'right': newRight, 'top': newTop, 'bottom': newBottom
	}
}


