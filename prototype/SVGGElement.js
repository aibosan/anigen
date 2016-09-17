/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for SVG "g" (group) element
 */

SVGGElement.prototype.ungroup = function(makeHistory) {
	var transform = this.getAttribute("transform");
	var children = this.children;
    for(var i = 0; i < children.length; i++) {
        var childTransform = children[i].getAttribute('transform');
		var toTransform;
        if(childTransform != null) {
			toTransform = children[i].getAttribute('transform') + " " + transform;
        } else if(transform != null) {
			toTransform = transform;
        }
		if(toTransform) { children[i].setAttribute('transform', toTransform); }
		if(makeHistory && svg && svg.history) {
			svg.history.add(new historyAttribute(children[i].id,
				{ 'transform': childTransform },
				{ 'transform': toTransform }, true));
			svg.history.add(new historyParentage(children[i].id,
				[ this.id, this.parentNode.id ],
				[ children[i].nextElementSibling ? children[i].nextElementSibling.id : null, this.id ],
				true));
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

SVGElement.prototype.setZero = function(x, y, makeHistory) {
	var CTM = this.getCTMBase();
	var zero = CTM.toViewport(0, 0);
	
	var adjusted = { 'x': x-zero.x, 'y': y-zero.y };
	
	this.translateBy(adjusted.x, adjusted.y, makeHistory);
	for(var i = 0; i < this.children.length; i++) {
		this.children[i].translateBy(-1*adjusted.x, -1*adjusted.y, makeHistory);
	}
}

// returns element's center as the middle of all of it's children centers
// if viewport is true, value given is adjusted to current viewport
SVGGElement.prototype.getCenter = function(viewport) {
	var xMax, xMin, xMax_anim, xMin_anim;
	var yMax, yMin, yMax_anim, yMin_anim;
	
	for(var i = 0; i < this.children.length; i++) {
		if(!(this.children[i] instanceof SVGAnimationElement) && typeof this.children[i].getCenter === 'function') {
			var coords = this.children[i].getCenter(viewport);
			if(!coords) { continue; }
			if(coords.x != null && (xMax == null || xMax < coords.x)) { xMax = coords.x; }
			if(coords.x != null && (xMin == null || xMin > coords.x)) { xMin = coords.x; }
			if(coords.y != null && (yMax == null || yMax < coords.y)) { yMax = coords.y; }
			if(coords.y != null && (yMin == null || yMin > coords.y)) { yMin = coords.y; }
			
			if(coords.x_anim != null && (xMax_anim == null || xMax_anim < coords.x_anim)) { xMax_anim = coords.x_anim; }
			if(coords.x_anim != null && (xMin_anim == null || xMin_anim > coords.x_anim)) { xMin_anim = coords.x_anim; }
			if(coords.y_anim != null && (yMax_anim == null || yMax_anim < coords.y_anim)) { yMax_anim = coords.y_anim; }
			if(coords.y_anim != null && (yMin_anim == null || yMin_anim > coords.y_anim)) { yMin_anim = coords.y_anim; }
		}
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

SVGGElement.prototype.toPath = function() {
	for(var i = 0; i < this.children.length; i++) {
		if(typeof this.children[i].toPath === 'function') {
			this.children[i].toPath();
		}
	}
}

