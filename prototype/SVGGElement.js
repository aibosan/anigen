/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for SVG "g" (group) element
 */

SVGGElement.prototype.ungroup = function(makeHistory) {
	var transform = this.getTransform();
	
	var children = this.children;
    for(var i = 0; i < children.length; i++) {
	
		var childTransform = children[i].getTransform();
		var toTransform = transform.multiply(childTransform);
		
		if(makeHistory) {
			children[i].setAttributeHistory({'transform': toTransform.toString()}, true);
			svg.history.add(new historyParentage(children[i].id,
				[ this.id, this.parentNode.id ],
				[ children[i].nextElementSibling ? children[i].nextElementSibling.id : null, this.id ],
				true));
		} else {
			children[i].setAttribute('transform', toTransform);
		}
        this.parentNode.insertBefore(children[i].cloneNode(true), this);
    }
	
	if(makeHistory && svg && svg.history) {
		svg.history.add(new historyCreation(this.cloneNode(false),
			this.parentNode.id, this.nextElementSibling ? this.nextElementSibling.id : null, true, true));
	}
	
    this.parentNode.removeChild(this);
	return children;
};

SVGGElement.prototype.setZero = function(x, y, makeHistory) {
	var CTM = this.getCTMBase();
	var zero = CTM.toViewport(0, 0);
	
	var adjusted = { 'x': x-zero.x, 'y': y-zero.y };
	
	for(var i = 0; i < this.children.length; i++) {
		this.children[i].translateBy(-1*adjusted.x, -1*adjusted.y, makeHistory);
	}
	this.translateBy(adjusted.x, adjusted.y, makeHistory);
}


// returns element's center as the middle of all of it's children centers
// if viewport is true, value given is adjusted to current viewport
SVGGElement.prototype.getCenter = function(viewport) {
	var xMax, xMin, xMax_anim, xMin_anim;
	var yMax, yMin, yMax_anim, yMin_anim;
	
	for(var i = 0; i < this.children.length; i++) {
		if(this.children[i] instanceof SVGAnimationElement || typeof this.children[i].getCenter !== 'function' ||
			this.children[i].style.display == 'none' || this.children[i].getAttribute('display') == 'none') { continue; }
	
		var coords = this.children[i].getCenter(viewport);
		if(!coords) { continue; }
		
		if(coords.right != null && (xMax == null || xMax < coords.right)) { xMax = coords.right; }
		if(coords.left != null && (xMin == null || xMin > coords.left)) { xMin = coords.left; }
		if(coords.bottom != null && (yMax == null || yMax < coords.bottom)) { yMax = coords.bottom; }
		if(coords.top != null && (yMin == null || yMin > coords.top)) { yMin = coords.top; }
		
		
	}
	
	if(xMax == null || xMin == null || yMax == null || yMin == null) { return; }
	
	var cx = xMin+(xMax-xMin)/2;
	var cy = yMin+(yMax-yMin)/2;
	
	var cx_anim = xMin_anim+(xMax_anim-xMin_anim)/2;
	var cy_anim = yMin_anim+(yMax_anim-yMin_anim)/2;
	
	return { 'x': cx, 'y': cy, 'x_anim': cx_anim, 'y_anim': cy_anim,
		'left': xMin, 'right': xMax, 'top': yMin, 'bottom': yMax };
}

SVGGElement.prototype.moveUp = function(makeHistory) {
	if(!this.parentNode) { return this; }
	if(this.getAttribute('inkscape:groupmode') == 'layer') {
		var siblings = this.parentNode.getElementsByAttribute('inkscape:groupmode', 'layer', false);
		var position = siblings.indexOf(this);
		if(position == siblings.length-1) { return this; }
		if(position != siblings.length-2) {
			if(makeHistory && svg) {
				svg.history.add(new historyParentage(this.id, [ this.parentNode.id, this.parentNode.id ],
					[ siblings[position+1].id, siblings[position+2].id ] ));
			}
			this.parentNode.insertBefore(this, siblings[position+2]);
		} else if(siblings[position+1].nextElementSibling) {
			if(makeHistory && svg) {
				svg.history.add(new historyParentage(this.id, [ this.parentNode.id, this.parentNode.id ],
					[ siblings[position+1].id, siblings[position+1].nextElementSibling.id ] ));
			}
			this.parentNode.insertBefore(this, siblings[position+1].nextElementSibling);
		} else {
			if(makeHistory && svg) {
				svg.history.add(new historyParentage(this.id, [ this.parentNode.id, this.parentNode.id ],
					[ siblings[position+1].id, null ] ));
			}
			this.parentNode.appendChild(svg.selected);
		}
	} else {
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
	}
	return this;
}

SVGGElement.prototype.moveTop = function(makeHistory) {
	if(!this.parentNode) { return this; }
	if(this.getAttribute('inkscape:groupmode') == 'layer') {
		var siblings = this.parentNode.getElementsByAttribute('inkscape:groupmode', 'layer', false);
		var position = siblings.indexOf(this);
		if(position == siblings.length-1) { return this; }
		if(siblings[siblings.length-1].nextElementSibling) {
			if(makeHistory && svg) {
				svg.history.add(new historyParentage(this.id, [ this.parentNode.id, this.parentNode.id ],
					[ siblings[position+1].id, siblings[siblings.length-1].nextElementSibling.id ] ));
			}
			this.parentNode.insertBefore(this, siblings[siblings.length-1].nextElementSibling);
		} else {
			if(makeHistory && svg) {
				svg.history.add(new historyParentage(this.id, [ this.parentNode.id, this.parentNode.id ],
					[ siblings[position+1].id, null ] ));
			}
			this.parentNode.appendChild(this);
		}
	} else {
		if(!this.nextElementSibling) { return this; }
		if(makeHistory && svg) {
			svg.history.add(new historyParentage(this.id, [ this.parentNode.id, this.parentNode.id ],
				[ this.nextElementSibling ? this.nextElementSibling.id : null, null ] ));
		}
		this.parentNode.appendChild(this);
	}
	return this;
}

SVGGElement.prototype.moveDown = function(makeHistory) {
	if(!this.parentNode) { return this; }
	if(!this.previousElementSibling) { return this; }
	
	if(this.getAttribute('inkscape:groupmode') == 'layer') {
		var siblings = this.parentNode.getElementsByAttribute('inkscape:groupmode', 'layer', false);
		var position = siblings.indexOf(this);
		if(position == 0) { return this; }
		
		if(makeHistory && svg) {
			svg.history.add(new historyParentage(this.id, [ this.parentNode.id, this.parentNode.id ],
				[ this.nextElementSibling ? this.nextElementSibling.id : null, siblings[position-1].id ] ));
		}
		this.parentNode.insertBefore(this, siblings[position-1]);
		
	} else {
		if(makeHistory && svg) {
			svg.history.add(new historyParentage(this.id, [ this.parentNode.id, this.parentNode.id ],
				[ this.nextElementSibling ? this.nextElementSibling.id : null, this.previousElementSibling.id ] ));
		}
		this.parentNode.insertBefore(this, this.previousElementSibling);
	}
	return this;
}

SVGGElement.prototype.moveBottom = function(makeHistory) {
	if(!this.parentNode) { return this; }
	if(this.parentNode.children[0] == this) { return this; }
	if(this.getAttribute('inkscape:groupmode') == 'layer') {
		var siblings = this.parentNode.getElementsByAttribute('inkscape:groupmode', 'layer', false);
		var position = siblings.indexOf(this);
		if(position == 0) { return this; }
		if(makeHistory && svg) {
			svg.history.add(new historyParentage(this.id, [ this.parentNode.id, this.parentNode.id ],
				[ this.nextElementSibling ? this.nextElementSibling.id : null, siblings[0].id ] ));
		}
		this.parentNode.insertBefore(this, siblings[0]);
	} else {
		if(makeHistory && svg) {
			svg.history.add(new historyParentage(this.id, [ this.parentNode.id, this.parentNode.id ],
				[ this.nextElementSibling ? this.nextElementSibling.id : null, this.parentNode.children[0].id ] ));
		}
		this.parentNode.insertBefore(this, this.parentNode.children[0]);
	}
	return this;
}

SVGGElement.prototype.toPath = function(recursive) {
	if(!recursive) { return this; }
	for(var i = 0; i < this.children.length; i++) {
		if(typeof this.children[i].toPath === 'function') {
			this.children[i].toPath(recursive);
		}
	}
	return this;
}

SVGGElement.prototype.isVisualElement = function() { return true; }

/*
SVGGElement.prototype.isAnimation = function() {
	if(this.getAttribute('anigen:type') == 'animationGroup' || this.getAttribute('anigen:type') == 'animatedViewbox') { return true; }
	return false;
}
*/

