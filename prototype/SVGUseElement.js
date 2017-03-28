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
	
	var CTM = this.getCTMBase();
	var CTMAnim = viewport ? this.getCTMAnim() : CTM;
	
	var linkedCenter = linked.getCenter(viewport);
	//return linkedCenter;
	
	var newLeft, newRight, newTop, newBottom;
	var newLeftAnim, newRightAnim, newTopAnim, newBottomAnim;
	
	var topLeft = CTM.toUserspace(linkedCenter.left, linkedCenter.top);
	var topRight = CTM.toUserspace(linkedCenter.right, linkedCenter.top);
	var botLeft = CTM.toUserspace(linkedCenter.left, linkedCenter.bottom);
	var botRight = CTM.toUserspace(linkedCenter.right, linkedCenter.bottom);
	
	var topLeftAnim = CTMAnim.toUserspace(linkedCenter.left_anim, linkedCenter.top_anim);
	var topRightAnim = CTMAnim.toUserspace(linkedCenter.right_anim, linkedCenter.top_anim);
	var botLeftAnim = CTMAnim.toUserspace(linkedCenter.left_anim, linkedCenter.bottom_anim);
	var botRightAnim = CTMAnim.toUserspace(linkedCenter.right_anim, linkedCenter.bottom_anim);
	
	newLeft = Math.min(topLeft.x, topRight.x, botLeft.x, botRight.x);
	newRight = Math.max(topLeft.x, topRight.x, botLeft.x, botRight.x);
	newTop = Math.min(topLeft.y, topRight.y, botLeft.y, botRight.y);
	newBottom = Math.max(topLeft.y, topRight.y, botLeft.y, botRight.y);
	
	newLeftAnim = Math.min(topLeftAnim.x, topRightAnim.x, botLeftAnim.x, botRightAnim.x);
	newRightAnim = Math.max(topLeftAnim.x, topRightAnim.x, botLeftAnim.x, botRightAnim.x);
	newTopAnim = Math.min(topLeftAnim.y, topRightAnim.y, botLeftAnim.y, botRightAnim.y);
	newBottomAnim = Math.max(topLeftAnim.y, topRightAnim.y, botLeftAnim.y, botRightAnim.y);
	
	
	return {
		'x': newLeft+(newRight-newLeft)/2, 'y': newTop+(newBottom-newTop)/2,
		'x_anim': newLeftAnim+(newRightAnim-newLeftAnim)/2, 'y_anim': newTopAnim+(newBottomAnim-newTopAnim)/2,
		'left': newLeft, 'right': newRight, 'top': newTop, 'bottom': newBottom,
		'left_anim': newLeftAnim, 'right_anim': newRightAnim, 'top_anim': newTopAnim, 'bottom_anim': newBottomAnim
	}
}

SVGUseElement.prototype.isVisualElement = function() { return true; }


