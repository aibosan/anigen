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

SVGUseElement.prototype.unlink = function(lenient) {
	var href = this.getAttribute('xlink:href');
	if(!href) { return; }
	href = href.substring(1);
	var targ = document.getElementById(href);
	if(targ) {
		var nex = targ.nextElementSibling;
		var par = targ.parentNode;
		par.removeChild(targ);
		
		var clone = targ.cloneNode(true);
			clone.stripId(true);
			clone.generateId(true);
		
		if(nex) {
			par.insertBefore(targ, nex);
		} else {
			par.appendChild(targ);
		}
		
		par = this.parentNode;
		nex = this.nextElementSibling;
		
		par.removeChild(this);
		
		var transform = clone.getAttribute('transform') || '';
		
		clone.setAttribute('transform',
				(clone.getAttribute('transform') || '') +
				'translate('+(this.getAttribute('x') || 0)+','+(this.getAttribute('x') || 0)+')' +
				(this.getAttribute('transform') || '')
			);
				
		
		clone.setAttribute('id', this.getAttribute('id'));
		
		if(svg && svg.history) {
			svg.history.add(new historyCreation(
				clone.cloneNode(true), par.getAttribute('id'),
				nex ? nex.getAttribute('id') : null, false, true
			));
			svg.history.add(new historyCreation(
				this.cloneNode(true), par.getAttribute('id'),
				nex ? nex.getAttribute('id') : null, true, true
			));
		}
		
		if(nex) {
			par.insetBefore(clone, nex);
		} else {
			par.appendChild(clone);
		}
		
		window.dispatchEvent(new Event('treeSeed'));
		window.dispatchEvent(new Event('select'));
		
		return clone;
	} else if(!lenient) {
		this.parentNode.removeChild(this);
		return this;
	}
	return null;
}


