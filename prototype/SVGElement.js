/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for all SVG elements
 */

SVGElement.prototype.consumeTransform = function(matrixIn) {
	var matrix = this.getTransformBase();
	if(matrixIn) {
		matrix = matrixIn.multiply(matrix);
	}
	this.removeAttribute('transform');
	for(var i = 0; i < this.children.length; i++) {
		this.children[i].consumeTransform(matrix);
	}
}


SVGElement.prototype.setZero = function(x, y, makeHistory) {
	if(this.parentNode.getAttribute('anigen:type') != 'shell') {
		var shell = document.createElementNS(svgNS, 'g');
			shell.setAttribute('anigen:lock', 'skip');
			shell.setAttribute('anigen:type', 'shell');
			shell.generateId();
		this.parentNode.insertBefore(shell, this);
		shell.appendChild(this);
	}
	
	var CTM = this.getCTMBase();
	var zero = CTM.toViewport(0, 0);
	
//	var adjusted = CTM.toUserspace(x, y);
	var adjusted = { 'x': x-zero.x, 'y': y-zero.y };
	
	this.parentNode.translateBy(adjusted.x, adjusted.y, makeHistory);
	this.translateBy(-1*adjusted.x, -1*adjusted.y, makeHistory);
}


SVGElement.prototype.getViableParent = function() {
	if(!this.parentNode || !(this.parentNode instanceof SVGElement)) { return null; }
	if(this.parentNode.getAttribute('anigen:lock') == 'skip') { return this.parentNode.getViableParent(); }
	return this.parentNode;
}

SVGElement.prototype.getAnimations = function() {
	var candidates = [];
	for(var i = 0; i < this.children.length; i++) {
		if(this.children[i] instanceof SVGAnimationElement) {
			candidates.push(this.children[i]);
		} else if(this.children[i] instanceof SVGGElement && this.children[i].shepherd && this.children[i].shepherd instanceof animationGroup) {
			candidates.push(this.children[i].shepherd);
		}
	}
	if(candidates.length == 0) {
		return null;
	} else {
		return candidates;
	}
}

SVGElement.prototype.isInsensitive = function() {
    var node = this;
    while(node != null) {
        if (node.getAttribute('anigen:lock') == 'interface') { return true; }
        node = node.parentNode;
        if(!(node instanceof SVGElement)) { return false; }
    }
    return false;
}

SVGElement.prototype.getTransformBase = function() {
	var matrix = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
	if(!this.transform) { return matrix; }
	for(var i = 0; i < this.transform.baseVal.length; i++) {
		matrix = matrix.multiply(this.transform.baseVal[i].matrix);
	}
	return matrix;
}

SVGElement.prototype.getTransformAnim = function() {
	var matrix = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
	if(!this.transform || this.transform.animVal) { return matrix; }
	for(var i = 0; i < this.transform.animVal.length; i++) {
		matrix = matrix.multiply(this.transform.animVal[i].matrix);
	}
	return matrix;
}

SVGElement.prototype.getTransform = function() {
	if(!(typeof this.getCTM === 'function')) {
		return null;
	}
	if(!this.parentNode || !(typeof this.parentNode.getCTM === 'function')) {
		return this.getCTM();
	}
	
	try {
		return this.parentNode.getCTM().inverse().multiply(this.getCTM());
	} catch (e) {
		// non-inversible matrices
		return document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
	}
}

SVGElement.prototype.translateBy = function(byX, byY, makeHistory) {
	var matrix = this.getTransformBase();
	
	matrix.e += byX;
	matrix.f += byY;
	
	if(makeHistory) {
		var oldTransform = this.getTransformBase();
		svg.history.add(new historyAttribute(this.id, 
			{ 'transform': oldTransform.toString() },
			{ 'transform': matrix.toString() },
		true));
	}
	
	this.setAttribute('transform', matrix.toString());
}

SVGElement.prototype.getCTMBase = function() {
	if(this instanceof SVGSVGElement || !this.parentNode) {
		return this.getTransformBase();
	} else {
		return this.parentNode.getCTMBase().multiply(this.getTransformBase());
	}
}


// returns object with 'numbers' and 'elements'
// 		- elements represent the chain of elements from parent svg to this element
// 		- numbers represent their respective index as children
// used to determine which elements gets rendered on top of which other element
SVGElement.prototype.getChain = function() {
	var numbers = [];
	var elements = [];
	var candidate = this;
	while(candidate && candidate.parentNode && candidate.parentNode instanceof SVGElement && !(candidate instanceof SVGSVGElement)) {
		var index;
		for(index = 0; index < candidate.parentNode.children.length; index++) {
			if(candidate.parentNode.children[index] == candidate) { break;}
		}
		numbers.push(index);
		elements.push(candidate.parentNode);
		candidate = candidate.parentNode;
	}
	return { 'numbers': numbers.reverse(), 'elements': elements.reverse(), 'owner': this }
}


// compares rendering order (position in SVG tree) with another element
// returns object with 'element' and 'ancestor'
//		- element is the element which gets rendered last
//		- ancestor is the highest element in this element's chain (see .getChain) which determines this
SVGElement.prototype.isOver = function(other) {
	if(!other || !(other instanceof SVGElement)) { return null; }
	if(other == this) { false; }
	
	var chainA = this.getChain();
	var chainB = other.getChain();
	
	var index;
	for(index = 0; index < chainA.numbers.length && index < chainB.numbers.length; index++) {
		if(chainA.numbers[index] > chainB.numbers[index]) {
			return true;
		}
		if(chainA.numbers[index] < chainB.numbers[index]) {
			return false;
		}
	}
	
	if(chainA.numbers.length < chainB.numbers.length) {
		return true;
	} else {
		return false;
	}
}

SVGElement.prototype.getFarCorner = function() {
	var bbox = this.getCenter();
	
	var CTM = this.getCTMBase();
	
	var zero = CTM.toViewport(0, 0);
	
	var outX, outY;
	
	if(Math.abs(bbox.left - zero.x) > Math.abs(bbox.right - zero.x)) {
		outX = bbox.left;
	} else {
		outX = bbox.right;
	}
	if(Math.abs(bbox.top - zero.y) > Math.abs(bbox.bottom - zero.y)) {
		outY = bbox.top;
	} else {
		outY = bbox.bottom;
	}
	
	return { 'x': outX, 'y': outY };
}

SVGElement.prototype.endAnimations = function(reset) {
	if(this instanceof SVGAnimationElement) {
		this.endElement();
	}
	if(this instanceof SVGAnimateTransformElement && reset) {
		// counteracts time zero transformations
		var adjustment = this.getCurrentValueReadable(0, true) || '';
		var transform = this.parentNode.getAttribute('transform') || '';
		transform += adjustment;
		this.parentNode.setAttribute('transform', transform);
		this.parentNode.transform.baseVal.consolidate();
		var matrix = this.parentNode.transform.baseVal[0].matrix;
		matrix.round();
		this.parentNode.setAttribute('transform', matrix.toString());
	}
	for(var i = 0; i < this.children.length; i++) {
		this.children[i].endAnimations(reset);
	}
}

SVGElement.prototype.moveUp = function(makeHistory) {
	if(!this.parentNode) { return this; }
	if(!this.nextElementSibling) { return this; }
	
	if(this.nextElementSibling.nextElementSibling) {
		if(makeHistory && svg) {
			svg.history.add(new historyParentage(this.id, [ this.parentNode.id, this.parentNode.id ],
				[ this.nextElementSibling.id, this.nextElementSibling.nextElementSibling.id ] ));
		}
		this.parentNode.insertBefore(this, this.nextElementSibling.nextElementSibling);
	} else {
		if(makeHistory && svg) {
			svg.history.add(new historyParentage(this.id, [ this.parentNode.id, this.parentNode.id ],
				[ this.nextElementSibling.id, null ] ));
		}
		this.parentNode.appendChild(this);
	}
	
	return this;
}

SVGElement.prototype.moveTop = function(makeHistory) {
	if(!this.parentNode) { return this; }
	if(!this.nextElementSibling) { return this; }
	
	if(makeHistory && svg) {
		svg.history.add(new historyParentage(this.id, [ this.parentNode.id, this.parentNode.id ],
			[ this.nextElementSibling ? this.nextElementSibling.id : null, null ] ));
	}
	this.parentNode.appendChild(this);
	
	return this;
}

SVGElement.prototype.moveDown = function(makeHistory) {
	if(!this.parentNode) { return this; }
	if(!this.previousElementSibling) { return this; }
	
	if(makeHistory && svg) {
		svg.history.add(new historyParentage(this.id, [ this.parentNode.id, this.parentNode.id ],
			[ this.nextElementSibling ? this.nextElementSibling.id : null, this.previousElementSibling.id ] ));
	}
	this.parentNode.insertBefore(this, this.previousElementSibling);
	
	return this;
}

SVGElement.prototype.moveBottom = function(makeHistory) {
	if(!this.parentNode) { return this; }
	if(this.parentNode.children[0] == this) { return this; }
	
	if(makeHistory && svg) {
		svg.history.add(new historyParentage(this.id, [ this.parentNode.id, this.parentNode.id ],
			[ this.nextElementSibling ? this.nextElementSibling.id : null, this.parentNode.children[0].id ] ));
	}
	this.parentNode.insertBefore(this, this.parentNode.children[0]);
	
	return this;
}


SVGElement.prototype.consumeAnimations = function(recursive) {
	var candidates = [];
	for(var i = 0; i < this.children.length; i++) {
		if(this.children[i] instanceof SVGAnimationElement) {
			candidates.push(this.children[i]);
		}
	}
	
	var transform = this.getTransform();
	
	for(var i = 0; i < candidates.length; i++) {
		if(candidates[i] instanceof SVGAnimateTransformElement) {
			this.removeChild(candidates[i]);
			continue;
		}
		if(candidates[i] instanceof SVGAnimateMotionElement) {
			this.removeChild(candidates[i]);
			continue;
		}
		if(candidates[i] instanceof SVGAnimateElement) {
			var attr = candidates[i].getAttribute('attributeName');
			
			var val = candidates[i].getCurrentValue();
			if(val) {
				// indicates XML animation
				this.setAttribute(attr, val);
			} else {
				// CSS style
				var styles = window.getComputedStyle(this);
				if(styles[attr] != null) {
					// exists in styles
					this.style[attr] = styles[attr];
				}
			}
			this.removeChild(candidates[i]);
			continue;
		}
	}
	
	if(transform) {
		this.setAttribute('transform', transform);
	}
	
	if(recursive) {
		for(var i = 0; i < this.children.length; i++) {
			if(!(this.children[i] instanceof SVGAnimationElement)) {
				this.children[i].consumeAnimations(recursive);
			}
		}
	}
}


