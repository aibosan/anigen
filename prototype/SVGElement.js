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
	
	var adjusted = { 'x': x-zero.x, 'y': y-zero.y };
	
	this.parentNode.translateBy(adjusted.x, adjusted.y, makeHistory);
	this.translateBy(-1*adjusted.x, -1*adjusted.y, makeHistory);
}


SVGElement.prototype.getViableParent = function() {
	if(!this.parentNode || !(this.parentNode instanceof SVGElement)) { return null; }
	if(this.parentNode.getAttribute('anigen:lock')) { return this.parentNode.getViableParent(); }
	return this.parentNode;
}

SVGElement.prototype.getViablePreviousSibling = function() {
	var candidate = this.previousElementSibling;
	while(candidate && candidate.getAttribute('anigen:lock')) { candidate = candidate.previousElementSibling; }
	return candidate;
}

SVGElement.prototype.getViableNextSibling = function() {
	var candidate = this.nextElementSibling;
	while(candidate && candidate.getAttribute('anigen:lock')) { candidate = candidate.nextElementSibling; }
	return candidate;
}

SVGElement.prototype.getViableChildren = function() {
	var arr = [];
	for(var i = 0; i < this.children.length; i++) {
		if(!this.children[i].getAttribute('anigen:lock')) {
			arr.push(this.children[i]);
		}
	}
	return arr;
}

SVGElement.prototype.getAnimations = function(onlyViable, attribute) {
	var candidates = [];
	for(var i = 0; i < this.children.length; i++) {
		if(onlyViable && this.children[i].getAttribute('anigen:lock')) { continue; }
		if(this.children[i] instanceof SVGAnimationElement) {
			if(!attribute || (attribute && this.children[i].getAttribute('attributeName') == attribute)) {
				candidates.push(this.children[i]);
			}
		} else if(this.children[i] instanceof SVGGElement && this.children[i].shepherd && this.children[i].shepherd instanceof animationGroup) {
			if(!attribute || (attribute && this.children[i].getAttribute('anigen:type') == attribute)) {
				candidates.push(this.children[i].shepherd);
			}
		}
	}
	if(candidates.length == 0) {
		return null;
	} else {
		return candidates;
	}
}

SVGElement.prototype.isInsensitive = function() {
    var target = this;
    while(target != null && target.parentNode) {
        if (target.getAttribute('anigen:lock') == 'interface') { return true; }
        target = target.parentNode;
        if(!(target instanceof SVGElement)) { return false; }
    }
    return false;
}

SVGElement.prototype.isVisualElement = function() { return false; }

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

SVGElement.prototype.translateBy = function(dX, dY, makeHistory) {
	var matrix = this.getTransformBase();
	
	var CTM = this.getCTMBase();
	var zero = CTM.toViewport(0,0);
	var adjusted = CTM.toUserspace(zero.x+dX, zero.y+dY);
	
	var matrix2 = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
	
	matrix2.e = adjusted.x;
	matrix2.f = adjusted.y;
	
	matrix = matrix.multiply(matrix2);
	
	if(makeHistory) {
		this.setAttributeHistory({'transform': matrix.toString()}, true);
	} else {
		this.setAttribute('transform', matrix.toString());
	}
	this.movePivot(-1*dX, -1*dY, makeHistory);
}

SVGElement.prototype.getCTMBase = function() {
	if(this instanceof SVGSVGElement || !this.parentNode) {
		return this.getTransformBase();
	} else {
		return this.parentNode.getCTMBase().multiply(this.getTransformBase());
	}
}

SVGElement.prototype.getCTMAnim = function() {
	if(this instanceof SVGSVGElement || !this.parentNode) {
		return this.getTransformAnim();
	} else {
		return this.parentNode.getCTMBase().multiply(this.getTransformAnim());
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


SVGElement.prototype.getFingerprint = function(previous) {
	var raw = this.nodeName;
	for(var i in this.attributes) {
		if(isNaN(i)) { continue; }
		var name = this.attributes[i].name;
		if(name == 'id' || name == 'style' || name.startsWith('inkscape:')
			|| name.startsWith('sodipodi:') || name.startsWith('anigen:')) { continue; }
		raw += name;
		raw += this.attributes[i].value;
	}
	var print = 0;
	for(var i = 0; i < raw.length; i++) {
		print += (1+i%32)*raw.charCodeAt(i);
	}
	for(var i = 0; i < this.children.length; i++) {
		if(typeof this.children[i].getFingerprint !== 'function') { continue; }
		print += parseInt(this.children[i].getFingerprint(), 16);
	}
	print &= 0xffffffff;
	return ('00000000' + print.toString(16)).slice(-8);
}


SVGElement.prototype.getLinkList = function(deep, references) {
	// references flag should be preceeded by clearing references in the SVG tree to be useful
	var candidates = [];
	
	for(var i = 0; i < this.attributes.length; i++) {
		if(this.attributes[i].name == 'style') { continue; }
		var linked;
		var name = this.attributes[i].name;
		var val = this.attributes[i].value;
		if(name == 'xlink:href') {
			val = val.substring(1);
		} else if(val.match(/^url\(/)) {
			val = val.replace(/^url\([^#]*#|[\"]?\)$/g, '');
		} else {
			continue;
		}
		linked = document.getElementById(val);
		candidates.push({ 'owner': this, 'attribute': name, 'css': false, 'type': name == 'xlink:href' ? 1 : 2, 'value': val, 'target': linked });
		
		if(linked && references) {
			var no = linked.getAttribute('anigen:references') != null && !isNaN(linked.getAttribute('anigen:references')) ? parseInt(linked.getAttribute('anigen:references')) : 0;
			no++;
			linked.setAttribute('anigen:references', no);
		}
	}
	
	for(var i = 0; i < this.style.length; i++) {
		var linked;
		var name = this.style[i];
		var val = this.style[name];
		if(name == 'xlink:href') {
			val = val.substring(1);
		} else if(val.match(/^url\(/)) {
			val = val.replace(/^url\([^#]*#|[\"]?\)$/g, '');
		} else {
			continue;
		}
		linked = document.getElementById(val);
		candidates.push({ 'owner': this, 'attribute': name, 'css': true, 'type': name == 'xlink:href' ? 1 : 2, 'value': val, 'target': linked });
		
		if(linked && references) {
			var no = linked.getAttribute('anigen:references') != null && !isNaN(linked.getAttribute('anigen:references')) ? parseInt(linked.getAttribute('anigen:references')) : 0;
			no++;
			linked.setAttribute('anigen:references', no);
		}
	}
	
	if(deep) {
		for(var i = 0; i < this.children.length; i++) {
			candidates = candidates.concat(this.children[i].getLinkList(deep, references));
		}
	}
	
	return candidates;
}



// ends all animations and restores SVG to its static state
// strip attribute removes animations from SVG as well
SVGElement.prototype.endAnimations = function() {
	if(this instanceof SVGAnimationElement) {
		var originalFill = this.getAttribute('fill');
		this.setAttribute('fill', 'remove');
		this.endElement();
		this.setAttribute('fill', originalFill);
		return;
	}
	
	for(var i = 0; i < this.children.length; i++) {
		this.children[i].endAnimations();
	}
}

// starts all animations again
SVGElement.prototype.startAnimations = function() {
	if(this instanceof SVGAnimationElement) {
		var clone = this.cloneNode(true);
		this.parentNode.insertBefore(clone, this);
		this.parentNode.removeChild(this);
		return;
	}
	
	for(var i = 0; i < this.children.length; i++) {
		this.children[i].startAnimations();
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


SVGElement.prototype.applyAnimations = function(recursive, animationGroup) {
	animationGroup = animationGroup || this.getAttribute('anigen:type') == 'animationGroup';
	
	if(this instanceof SVGAnimationElement && this.getAttribute('attributeName') == 'd') {
		if(!animationGroup && !this.getProgress(0).running) { return; }
		var val = this.getAttribute('values');
		if(!val) { return; }
		val = val.split(';')[0];
		if(!val) { return; }
		this.parentNode.setAttribute('d', val);
		return;
	}
	
	if(recursive) {
		var children = this.children;
		for(var i = 0; i < children.length; i++) {
			children[i].applyAnimations(recursive, animationGroup);
		}
	}
}

SVGElement.prototype.consumeAnimations = function(recursive, zealous) {
	var candidates = [];
	
	var isTransform = false;
	for(var i = 0; i < this.children.length; i++) {
		if(this.children[i] instanceof SVGAnimationElement) {
			candidates.push(this.children[i]);
		}
		if(!isTransform && (this.children[i] instanceof SVGAnimateTransformElement || this.children[i] instanceof SVGAnimateMotionElement)) {
			isTransform = true;
		}
	}
	
	if(isTransform) {
		var transform = this.getTransform();
		if(transform) { this.setAttribute('transform', transform); }
	}
	
	var gotD = false;
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
			
			if(attr == 'd') {
				if(gotD) { continue; }
				var pData = this.getPathData();
				this.setAttribute('d', pData.animVal);
				gotD = true;
				this.removeChild(candidates[i]);
				continue;
			}
			
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
	
	if(zealous) {
		if(this.style.display == 'none' || this.getAttribute('display') == 'none' ||
			this.style.opacity == '0' || this.getAttribute('opacity') == '0') {
			if(this instanceof SVGSVGElement) {
				this.removeChildren();
				return;
			} else {
				this.parentNode.removeChild(this);
				return;
			}
		}
	}
	
	if(recursive) {
		var children = this.children;
		for(var i = 0; i < children.length; i++) {
			if(children[i] instanceof SVGAnimationElement) { continue; }
			children[i].consumeAnimations(recursive, zealous);
		}
	}
}


SVGElement.prototype.setAttributeHistory = function(values, noCSS, recursive) {
	if(!svg || !svg.history) { return; }
	
	var oldAttributes = {};
	var newAttributes = {};
	
	for(var i in values) {
		if(this.style.hasNativeProperty(i) && !noCSS) {
			if(!oldAttributes.style) {	
				oldAttributes.style = this.getAttribute('style');
			}
			this.style[i] = values[i];
			newAttributes.style = this.getAttribute('style');
		} else {
			oldAttributes[i] = this.getAttribute(i);
			newAttributes[i] = values[i];
			this.setAttribute(i, values[i]);
		}
	}
	
	svg.history.add(new historyAttribute(this.getAttribute('id'), oldAttributes, newAttributes, true));
	
	if(recursive) {
		for(var i = 0; i < this.children.length; i++) {
			this.children[i].setAttributeHistory(values, noCSS, recursive);
		}
	}
}

/* Calculates blur - from filter's standard deviations - as inkscape's percentage;
Blur radius equal to 1/8th of the total perimeter of the element's bounding rectangle is 100%.
*/

SVGElement.prototype.getBlur = function(value) {
	if(!this.style.filter || this.style.filter.length == 0) { return 0; }
	
	var filterId = this.style.filter.replace(/^url\([^#]*#|[\"]?\)$/g, '');
	var filter = document.getElementById(filterId);
	if(!filter) { return 0; }
	
	var totalDeviationX = 0;
	var totalDeviationY = 0;
	for(var i = 0; i < filter.children.length; i++) {
		if(!(filter.children[i] instanceof SVGFEGaussianBlurElement)) { continue; }
		var std = (filter.children[i].getAttribute('stdDeviation') || "0 0").split(' ');
		if(std.length == 1) {
			totalDeviationX += parseFloat(std[0]);
			totalDeviationY += parseFloat(std[0]);
		} else {
			totalDeviationX += parseFloat(std[0]);
			totalDeviationY += parseFloat(std[1]);
		}
	}
	
	if(typeof this.getCenter !== 'function') { return 0; }
	var center = this.getCenter(false);
	if(!center) { return 0; }
	var sizeX = center.right-center.left;
	var sizeY = center.top-center.bottom;
	var hundred = (Math.abs(sizeX)+Math.abs(sizeY))/4 || 1;
	
	var ctm = this.getCTMBase();
	var zero = ctm.toViewport(0,0);
	var dev = ctm.toViewport(totalDeviationX, totalDeviationY);
	var sizedDeviation = ((dev.x-zero.x)+(dev.y-zero.y))/2;
	
	return sizedDeviation/hundred;
}

/* Calculates standard deviation required for given blur (as inkscape's percentage) and applies it as the element's filter */
SVGElement.prototype.setBlur = function(value) {
	
	if(typeof this.getCenter !== 'function') { return; }
	var center = this.getCenter(false);
	var sizeX = center.right-center.left;
	var sizeY = center.top-center.bottom;
	var hundred = (Math.abs(sizeX)+Math.abs(sizeY))/4 || 1;
	
	var ctm = this.getCTMBase();
	var zero = ctm.toViewport(0,0);
	
	var sizedDeviation = value*hundred
	var sizX = (sizedDeviation)+zero.x;
	var sizY = (sizedDeviation)+zero.y;
	var totalDeviationV = ctm.toUserspace(sizX, sizY);
	
	var totalDeviationX = 0;
	var totalDeviationY = 0;
	
	if(Math.abs(totalDeviationV.x-totalDeviationV.y) < 0.0001) {
		totalDeviationX = totalDeviationY = totalDeviationV.x;
	} else {
		totalDeviationX = totalDeviationV.x;
		totalDeviationY = totalDeviationV.y;
	}
	
	if(totalDeviationX == totalDeviationY == 0) {
		this.style.filter = null;
		return;
	}
	
	var filterHeight = Math.abs((1+value)*sizeX);
	var filterWidth = Math.abs((1+value)*sizeY);
	var filterX = -0.5*filterHeight;
	var filterY = -0.5*filterWidth;
	
	var filter;
	if(!this.style.filter || this.style.filter.length == 0 || !document.getElementById(this.style.filter.replace(/^url\([^#]*#|[\"]?\)$/g, ''))) {
		var fContainer = document.createElementNS(svgNS, 'filter');
			fContainer.generateId();
			
			this.setAttributeHistory({'filter': 'url("#'+fContainer.getAttribute('id')+'")'});
			if(!svg || !svg.defs) { return; }
			svg.defs.appendChild(fContainer);
			
		var filter = document.createElementNS(svgNS, 'feGaussianBlur');
			filter.generateId();
			fContainer.appendChild(filter);
			
			fContainer.setAttribute('x', filterX);
			fContainer.setAttribute('y', filterY);
			fContainer.setAttribute('height', filterHeight);
			fContainer.setAttribute('width', filterWidth);
			
			filter.setAttributeHistory({'stdDeviation': totalDeviationX == totalDeviationY ? totalDeviationX : totalDeviationX + ' ' + totalDeviationY});
			
		if(svg && svg.history) {
			svg.history.add(new historyCreation(fContainer.cloneNode(true), svg.defs.id, fContainer.previousElementSibling ? fContainer.previousElementSibling.id : null, false, true));
		}
			
	} else {
		var filterId = this.style.filter.replace(/^url\([^#]*#|[\"]?\)$/g, '');
		filter = document.getElementById(filterId);
		
		var sizeOld = this.getBlur();
		var filterOldHeight = Math.abs((1+sizeOld)*sizeX);
		var filterOldWidth = Math.abs((1+sizeOld)*sizeY);
		var filterOldX = -0.5*filterOldHeight;
		var filterOldY = -0.5*filterOldWidth;
		
		filter.setAttribute('x', filterOldX);
		filter.setAttribute('y', filterOldY);
		filter.setAttribute('height', filterOldHeight);
		filter.setAttribute('width', filterOldWidth);
		
		filter.setAttributeHistory({'x': filterX, 'y': filterY, 'height': filterHeight, 'width': filterWidth}, true);
		
		var count = 0;
		for(var i = 0; i < filter.children.length; i++) {
			if(!(filter.children[i] instanceof SVGFEGaussianBlurElement)) { continue; }
			if(count > 0) {
				if(svg && svg.history) {
					svg.history.add(new historyCreation(filter.children[i].cloneNode(true), filter.id, filter.children[i].previousElementSibling ? filter.children[i].previousElementSibling.id : null, true, true));
				}
				filter.removeChild(filter.children[i]);
			} else {
				var newDeviation = String(totalDeviationX == totalDeviationY ? totalDeviationX : totalDeviationX + ' ' + totalDeviationY);
				filter.children[i].setAttributeHistory({'stdDeviation': newDeviation});
			}
			count++;
		}
	}
}



SVGElement.prototype.setPivot = function(x, y, isAbsolute, makeHistory) {
	if(isAbsolute) {
		var center = this.getPivot(true);
		x -= center.x;
		y -= center.y;
	}
	
	if(makeHistory) {
		if(x == 0) { x = null; }
		if(y == 0) { y = null; }
		this.setAttributeHistory({'inkscape:transform-center-x': x, 'inkscape:transform-center-y': y});
	} else {
		if(x && !isNaN(x)) { this.setAttribute('inkscape:transform-center-x', x); } else { this.removeAttribute('inkscape:transform-center-x'); }
		if(y && !isNaN(y)) { this.setAttribute('inkscape:transform-center-y', y); } else { this.removeAttribute('inkscape:transform-center-y'); }
	}
}

SVGElement.prototype.movePivot = function(dX, dY, makeHistory) {
	var x = parseFloat(this.getAttribute('inkscape:transform-center-x') || 0);
	var y = parseFloat(this.getAttribute('inkscape:transform-center-y') || 0);
	x += dX;
	y += dY;
	
	if(makeHistory) {
		if(x == 0) { x = null; }
		if(y == 0) { y = null; }
		this.setAttributeHistory({'inkscape:transform-center-x': x, 'inkscape:transform-center-y': y});
	} else {
		if(x && !isNaN(x)) { this.setAttribute('inkscape:transform-center-x', x); } else { this.removeAttribute('inkscape:transform-center-x'); }
		if(y && !isNaN(y)) { this.setAttribute('inkscape:transform-center-y', y); } else { this.removeAttribute('inkscape:transform-center-y'); }
	}
}

SVGElement.prototype.getPivot = function(justCenter) {
	var x, y;
	if(justCenter) {
		x = 0;
		y = 0;
	} else {
		x = parseFloat(this.getAttribute('inkscape:transform-center-x') || 0);
		y = parseFloat(this.getAttribute('inkscape:transform-center-y') || 0);
	}
	
	if(svg) {
		var area = this.getBBox();
		var center = this.getCTM().toViewport(area.x+area.width/2, area.y+area.height/2);
		center.x = center.x/svg.zoom+svg.viewBox.x;
		center.y = center.y/svg.zoom+svg.viewBox.y;
		x += center.x;	
		y += center.y;
	}
	return { 'x': x, 'y': y };
}

SVGElement.prototype.getCenter = function() {
	return null;
}



