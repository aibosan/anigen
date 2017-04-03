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

SVGUseElement.prototype.unlink = function(noHistory, noDispatch) {
	var chain = [ ];
	var target = this;
	var broken = false;
		
	do {
		if(!(target instanceof SVGUseElement)) { break; }
		chain.push(target);
		target = target.getAttribute('xlink:href');
		if(!target) { broken = true; break; }
		target = document.getElementById(target.substring(1));
		if(!target) { broken = true; break; }
	} while(target);
	
	if(broken) {
		var par = this.parentNode;
		var nex = this.nextElementSibling;
		par.removeChild(this);
		
		if(!noHistory && svg && svg.history) {
			svg.history.add(new historyCreation(
				this.cloneNode(true), par.getAttribute('id'),
				nex ? nex.getAttribute('id') : null, true, true
			));
		}
		if(!noDispatch) {
			window.dispatchEvent(new Event('treeSeed'));
			window.dispatchEvent(new Event('rootSelect'));
		}
		return;
	}
	
	chain.reverse();
	var clone = target.cloneNodeStatic(true);
	if(clone.style.opacity == null) { clone.style.opacity = 1; }
	var cloneTransform = clone.getAttribute('transform') || '';
	
	for(var i = 0; i < chain.length; i++) {
		var useTransform = 'translate('+(chain[i].getAttribute('x')||0)+','+(chain[i].getAttribute('y')||0)+')';
		if(useTransform != 'translate(0,0)') {
			cloneTransform = useTransform + cloneTransform;
		}
		var baseTransform = chain[i].getTransformBase();
		if(!baseTransform.isIdentity()) {
			cloneTransform = baseTransform.toString() + cloneTransform;
		}
		
		for(var j = 0; j < chain[i].style.length; j++) {
			switch(chain[i].style[j]) {
				case 'opacity':
					clone.style.opacity = parseFloat(clone.style.opacity)*parseFloat(chain[i].style.opacity);
					continue;
				case 'display':
					if(clone.style.display != 'none') {
						clone.style.display = chain[i].style.display;
					}
					continue;
				case 'visibility':
					if(clone.style.visibility != 'hidden') {
						clone.style.visibility = chain[i].style.visibility;
					}
					continue;
			}
			
			if(!clone.style[chain[i].style[j]]) {
				clone.style[chain[i].style[j]] = chain[i].style[chain[i].style[j]];
			}
		}
		
		for(var j = 0; j < chain[i].children.length; j++) {
			var childClone = chain[i].children[j].cloneNodeStatic(true);
			clone.appendChild(childClone);
			if(childClone instanceof SVGAnimateElement && childClone.getAttribute('attributeName') == 'opacity') {
				var ratio = parseFloat(clone.style.opacity)/parseFloat(chain[i].style.opacity||1);
				childClone.scaleValues(null, ratio);
				childClone.setAttribute('values', childClone.keyframes.getValues().join(';'));
				childClone.setAttribute('additive', 'sum');
			}	
		}
	}
	
	clone.setAttribute('id', this.getAttribute('id'));
	
	if(cloneTransform.length > 0) {
		clone.setAttribute('transform', cloneTransform);
	}
	
	var par = this.parentNode;
	var nex = this.nextElementSibling;
	
	par.removeChild(this);
	
	if(!noHistory && svg && svg.history) {
		svg.history.add(new historyCreation(
			this.cloneNode(true), par.getAttribute('id'),
			nex ? nex.getAttribute('id') : null, true, true
		));
		svg.history.add(new historyCreation(
			clone.cloneNode(true), par.getAttribute('id'),
			nex ? nex.getAttribute('id') : null, false, true
		));
	}
	
	if(nex) {
		par.insertBefore(clone, nex);
	} else {
		par.appendChild(clone);
	}
	
	if(!noDispatch) {
		window.dispatchEvent(new Event('treeSeed'));
		window.dispatchEvent(new Event('rootSelect'));
	}
}


		


