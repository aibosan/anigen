/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for SVG "line" (rectangle) element
 */

SVGLineElement.prototype.setValue = function(index, x, y, makeHistory) {
	if(index < 0 || index >= this.values.length) { throw new DOMException(1); }
	if(isNaN(parseFloat(x)) || isNaN(parseFloat(y))) { return; }
	x = parseFloat(x);
	y = parseFloat(y);
	
	if(makeHistory && svg && svg.history) {
		if(index == 0) {
			svg.history.add(new historyAttribute(this.id, 
				{ 'x1': this.getAttribute('x1'), 'y1': this.getAttribute('y1') },
				{ 'x1': x, 'y1': y }, true));
		} else {
			svg.history.add(new historyAttribute(this.id, 
				{ 'x2': this.getAttribute('x2'), 'y1': this.getAttribute('y2') },
				{ 'x2': x, 'y2': y }, true));
		}
	}
	
	if(index == 0) {
		this.setAttribute('x1', x);
		this.setAttribute('y1', y);
	} else {
		this.setAttribute('x2', x);
		this.setAttribute('y2', y);
	}
}

SVGLineElement.prototype.generateAnchors = function() {
	var CTM = this.getCTMBase();
	
	var adjusted1 = CTM.toViewport(this.x1.baseVal.value, this.y1.baseVal.value);
	var adjusted2 = CTM.toViewport(this.x2.baseVal.value, this.y2.baseVal.value);
	
	var constraint = new constraintLinear({'x': this.x1.baseVal.value, 'y': this.y1.baseVal.value}, {'x': this.x2.baseVal.value, 'y': this.y1.baseVal.value}, false, true);
	
	var anchors = [];
	
	var anch1 = new anchor(adjusted1, this, 'rectangle', {
			'move': 'this.element.setValue(0, absolute.x, absolute.y, true);',
			'mouseup': 'svg.select();'
		}, constraint);
		anchors.push(anch1);
	var anch2 = new anchor(adjusted2, this, 'rectangle', {
			'move': 'this.element.setValue(1, absolute.x, absolute.y, true);',
			'mouseup': 'svg.select();'
		}, constraint);
		anchors.push(anch2);
	
	return { 'anchors': [ anchors ] };
}

// returns element's center as top-left (x,y attributes) plus half of height and width respectively
// if viewport is true, value given is adjusted to current viewport
SVGLineElement.prototype.getCenter = function(viewport) {
	var CTM = this.getCTMBase();
	var adjusted1 = CTM.toViewport(this.x1.baseVal.value, this.y1.baseVal.value);
	var adjusted2 = CTM.toViewport(this.x2.baseVal.value, this.y2.baseVal.value);
	
	var adjCX = adjusted1.x + (adjusted2.x-adjusted1.x)/2;
	var adjCY = adjusted1.y + (adjusted2.y-adjusted1.y)/2;
	
	var cX = this.x1.baseVal.value + (this.x2.baseVal.value-this.x1.baseVal.value)/2;
	var cY = this.y1.baseVal.value + (this.y2.baseVal.value-this.y1.baseVal.value)/2;
	
	var adjusted1Anim = CTM.toViewport(this.x1.animVal.value, this.y1.animVal.value);
	var adjusted2Anim = CTM.toViewport(this.x2.animVal.value, this.y2.animVal.value);
	
	var adjCXAnim = adjusted1Anim.x + (adjusted2Anim.x-adjusted1Anim.x)/2;
	var adjCYAnim = adjusted1Anim.y + (adjusted2Anim.y-adjusted1Anim.y)/2;
	
	var cXAnim = this.x1.animVal.value + (this.x2.animVal.value-this.x1.animVal.value)/2;
	var cYAnim = this.y1.animVal.value + (this.y2.animVal.value-this.y1.animVal.value)/2;
	
	if(viewport) {
		return { 'x': adjCX, 'y': adjCY, 'x_anim': adjCXAnim, 'y_anim': adjCYAnim,
			'left': Math.min(adjusted1.x, adjusted2.x), 'right': Math.max(adjusted1.x, adjusted2.x),
			'top': Math.min(adjusted1.y, adjusted2.y), 'bottom': Math.max(adjusted1.y, adjusted2.y)
		};
	}
	return { 'x': cX, 'y': cY, 'x_anim': cXAnim, 'y_anim': cYAnim,
			'left': Math.min(this.x1.baseVal.value, this.x2.baseVal.value), 'right': Math.max(this.x1.baseVal.value, this.x2.baseVal.value),
			'top': Math.min(this.y1.baseVal.value, this.y2.baseVal.value), 'bottom': Math.max(this.y1.baseVal.value, this.y2.baseVal.value)
	};
}

SVGLineElement.prototype.toPath = function() {
	var path = document.createElementNS(svgNS, 'path');
	var pData = [];
	
	pData.push('M ' + this.x1.baseVal.value + ' ' + this.y1.baseVal.value);
	pData.push('L ' + this.x2.baseVal.value + ' ' + this.y2.baseVal.value);
	
	path.setAttribute('d', pData.join(' '));
	
	for(var i = 0; i < this.attributes.length; i++) {
		if(this.attributes[i].name == 'x1' || this.attributes[i].name == 'x2' || this.attributes[i].name == 'y1' || this.attributes[i].name == 'y2') { continue; }
		path.setAttribute(this.attributes[i].name, this.attributes[i].value);
	}
	
	this.parentNode.insertBefore(path, this);
	this.parentNode.removeChild(this);
	
	if(svg.selected == this) {
		svg.select(path);
	}
	return path;
}


