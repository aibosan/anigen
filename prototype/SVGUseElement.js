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

// this doesn't really work;
// it has to also copy all other attributes and somehow make sense of their priorities
// basically, too much work
// TODO
SVGUseElement.prototype.unlink = function(noHistory, lenient) {
	var targ = this.getAttribute('xlink:href');
	if(!targ) { return; }
	targ = targ.substring(1);
	var targ = document.getElementById(targ);
	if(targ) {
		var targ = this;
		var transformOriginal = [];
		do {
			var parT = targ.parentNode;
			var nexT = targ.nextElementSibling;
			parT.removeChild(targ);
			
			transformOriginal.push(targ.getAttribute('transform'));
			if(targ.getAttribute('x') || targ.getAttribute('y')) {
				transformOriginal.push('translate('+targ.getAttribute('x')+','+targ.getAttribute('y')+')');
			}
			
			if(nexT) {
				parT.insertBefore(targ, nexT);
			} else {
				parT.appendChild(targ);
			}
			if(targ instanceof SVGUseElement) {
				targ = targ.getAttribute('xlink:href');
				if(!targ) { break; }
				targ = targ.substring(1);
				targ = document.getElementById(targ);
				if(!targ) { break; }
			} else { break; }
		} while(true);
		
		if(!targ) { return; }		// chain is broken
		
		var parT = targ.parentNode;
		var nexT = targ.nextElementSibling;
		parT.removeChild(targ);
		var clone = targ.cloneNode(true);
		if(nexT) {
			parT.insertBefore(targ, nexT);
		} else {
			parT.appendChild(targ);
		}
		
		transformOriginal.reverse();
		transformOriginal = transformOriginal.join('');
		
		var par = this.parentNode;
		var nex = this.nextElementSibling;
		
		var transform = '';
		
		if(transformOriginal) { transform += transformOriginal; }
		if(this.getAttribute('x') || this.getAttribute('y')) {
			transform += 'translate('+(this.getAttribute('x') || 0)+','+(this.getAttribute('x') || 0)+')';
		}
		if(this.getAttribute('transform')) { transform += this.getAttribute('transform'); }
		
		if(transform.length > 0) {
			clone.setAttribute('transform', transform);
		}
		
		var skip = [ 'x', 'y', 'transform', 'width', 'height' ];
		
		for(var i = 0; i < this.attributes.length; i++) {
			if(skip.indexOf(this.attributes[i].name) != -1) { continue; }
			clone.setAttribute(this.attributes[i].name, this.attributes[i].value);
		}
		
		clone.setAttribute('id', this.getAttribute('id'));
		
		if(!noHistory && svg && svg.history) {
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
			par.insertBefore(clone, nex);
		} else {
			par.appendChild(clone);
		}
		
		window.dispatchEvent(new Event('treeSeed'));
		window.dispatchEvent(new Event('rootSelect'));
		
		return clone;
	} else if(!lenient) {
		this.parentNode.removeChild(this);
		return this;
	}
	return null;
}


