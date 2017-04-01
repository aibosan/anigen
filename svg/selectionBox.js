/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Dashed box indicating selected element(s)
 */
function selectionBox() {
	this.element = null;
	
    this.blX = 0;
    this.blY = 0;
    this.trX = 0;
    this.trY = 0;

    this.container = document.createElementNS(svgNS, "g");
	this.container.setAttribute("shape-rendering", "crispEdges");
    this.container.setAttribute("anigen:lock", "interface");
    this.container.setAttribute("id", "anigenSelectionBox");

    this.rect1 = document.createElementNS(svgNS, "polygon");
    this.rect2 = document.createElementNS(svgNS, "polygon");
    this.container.appendChild(this.rect1);
    this.container.appendChild(this.rect2);

	this.containerArrows = document.createElementNS(svgNS, 'g');
	this.container.appendChild(this.containerArrows);
	
    this.rect1.setAttribute("anigen:lock", "interface");
    this.rect2.setAttribute("anigen:lock", "interface");

    this.rect1.setAttribute("style", "stroke-linecap:butt;fill:none;stroke:#fff");
    this.rect2.setAttribute("style", "stroke-linecap:butt;fill:none;stroke:#000");

	this.arrows = [];
	this.origin = null;
	
	this.arrowsHidden = false;
	
	this.showRotation = false;
}

selectionBox.prototype.isHidden = function() {
	return this.container.style.display == "none";
}
selectionBox.prototype.hide = function() {
	this.container.style.display = "none";
}
selectionBox.prototype.show = function() {
	this.container.style.display = null;
}

selectionBox.prototype.isArrowsHidden = function() {
	return this.arrowsHidden;
}
selectionBox.prototype.hideArrows = function() {
	for(var i = 0; i < this.arrows.length; i++) {
		this.arrows[i].container.style.display = 'none';
	}
	this.arrowsHidden = true;
}
selectionBox.prototype.showArrows = function() {
	for(var i = 0; i < this.arrows.length; i++) {
		this.arrows[i].container.style.display = null;
	}
	this.arrowsHidden = false;
}

selectionBox.prototype.adjustZoom = function() {
	this.rect1.setAttribute("stroke-dasharray", (5/svg.zoom)+","+(5/svg.zoom));
	this.rect2.setAttribute("stroke-dasharray", (5/svg.zoom)+","+(5/svg.zoom));
	
	this.rect2.setAttribute("stroke-dashoffset", (-5/svg.zoom));
	
	
	this.rect1.setAttribute("stroke-width", 1/svg.zoom+"px");
	this.rect2.setAttribute("stroke-width", 1/svg.zoom+"px");
	for(var i = 0; i < this.arrows.length; i++) {
		this.arrows[i].adjustZoom();
	}
	if(this.origin) { this.origin.adjustZoom(); }
}

selectionBox.prototype.getCenter = function() {
	return { x: this.blX + (this.trX - this.blX)/2, y: this.blY + (this.trY - this.blY)/2}
}

selectionBox.prototype.setElement = function(element) {
	if(!element) {
		this.element = null;
		return;
	}
	if(this.element != element) { this.showRotation = false; }
	
	this.element = element;
	this.refresh();
	this.show();
}

selectionBox.prototype.refresh = function() {
	if(!this.element || this.element == svg.svgElement || this.element instanceof SVGDefsElement) {
		this.element = null;
		return;
	}
	
	if(anigenActual.tool != 1 || this.element.shepherd instanceof animatedViewbox) {
		this.hideArrows();
	} else {
		this.showArrows();
	}
	
	
	/*
	if(typeof this.element.getCenter === 'function' && this.element.getCenter(true)) {
		// this is too expensive
		var center = this.element.getCenter(true);
		this.blX = center.left_anim != null ? center.left_anim : center.left;
		this.trX = center.right_anim != null ? center.right_anim : center.right;
		this.blY = center.top_anim != null ? center.top_anim : center.top;
		this.trY = center.bottom_anim != null ? center.bottom_anim : center.bottom;
	} else
	*/
		if(typeof this.element.getBBox === 'function') {	// .getCenter doesn't work properly, and I'm not finding out why now
		// bbox fallback
		var CTM = this.element.getCTM();
		try {
			var area = this.element.getBBox();
		} catch(err) {	// firefox can't handle undisplayed objects :C
			return;
		}
		if(!CTM) { return; }
		
		var tl = CTM.toViewport(area.x, area.y);
		var tr = CTM.toViewport(area.x+area.width, area.y);
		var br = CTM.toViewport(area.x+area.width, area.y+area.height);
		var bl = CTM.toViewport(area.x, area.y+area.height);
		
		this.blX = Math.min(tl.x, tr.x, br.x, bl.x)/svg.zoom+svg.viewBox.x;
		this.trX = Math.max(tl.x, tr.x, br.x, bl.x)/svg.zoom+svg.viewBox.x;
		this.blY = Math.min(tl.y, tr.y, br.y, bl.y)/svg.zoom+svg.viewBox.y;
		this.trY = Math.max(tl.y, tr.y, br.y, bl.y)/svg.zoom+svg.viewBox.y;
	} else {
		// all is lost
		this.element = null;
		return;
	}
	
	this.container.removeChildren();
	this.container.appendChild(this.rect1);
	this.container.appendChild(this.rect2);
	this.containerArrows.removeChildren();
	this.container.appendChild(this.containerArrows);
	
	this.adjustZoom();

	this.rect1.setAttribute("points", this.blX + "," + this.blY + " " + this.blX + "," + this.trY + " " + this.trX + "," + this.trY + " " + this.trX + "," + this.blY);
	this.rect2.setAttribute("points", this.blX + "," + this.blY + " " + this.blX + "," + this.trY + " " + this.trX + "," + this.trY + " " + this.trX + "," + this.blY);
	
	this.arrows = [];
	
	if(this.arrowsHidden) {
		this.containerArrows.style.display = 'none';
		return;
	} else {
		this.containerArrows.style.display = null;
	}
	
	var origin = {'x': this.trX+(this.blX-this.trX)/2, 'y': this.blY+(this.trY-this.blY)/2};
	var originBase = {'x': this.trX+(this.blX-this.trX)/2, 'y': this.blY+(this.trY-this.blY)/2};	// for further use
	
	//Inkscape's pivot is absolute coordinates in relation to the center of the element.
	if(this.element.getAttribute('inkscape:transform-center-x') && !isNaN(this.element.getAttribute('inkscape:transform-center-x'))) {
		origin.x += parseFloat(this.element.getAttribute('inkscape:transform-center-x'));
	}
	if(this.element.getAttribute('inkscape:transform-center-y') && !isNaN(this.element.getAttribute('inkscape:transform-center-y'))) {
		origin.y += parseFloat(this.element.getAttribute('inkscape:transform-center-y'));
	}
	
	var mouseUpAction = 'svg.select();';
	
	
	if(!this.origin || this.origin.element != this.element) {
		this.origin = new anchor(origin, this.element, 'cross',
			/*{ 	'move': "this.element.setPivot(absolute.x-"+originBase.x+", absolute.y-"+originBase.y+", true);",*/
			{ 	'move': "this.element.setPivot(absolute.x, absolute.y, true, true);",
				'mouseup': mouseUpAction },
			new constraintPosition(originBase, true));
			this.origin.selectable = false;
	}
	
	if(this.showRotation) {
		if((window.event || event) && (window.event || event).shiftKey) {
			this.origin.hide();
		} else {
			this.origin.show();
		}
	} else {
		if((window.event || event) && (window.event || event).shiftKey) {
			this.origin.show();
		} else {
			this.origin.hide();
		}
	}
	
	var pos = {
		'topRight': {'x': this.trX, 'y': this.trY}, 'topLeft': {'x': this.blX, 'y': this.trY},
		'botRight': {'x': this.trX, 'y': this.blY}, 'botLeft': {'x': this.blX, 'y': this.blY},
		'topMid': {'x': this.trX+(this.blX-this.trX)/2, 'y': this.trY},
		'botMid': {'x': this.trX+(this.blX-this.trX)/2, 'y': this.blY},
		'midLeft': {'x': this.blX, 'y': this.trY+(this.blY-this.trY)/2 },
		'midRight': {'x': this.trX, 'y': this.trY+(this.blY-this.trY)/2 },
		'center': {'x': this.trX+(this.blX-this.trX)/2, 'y': this.trY+(this.blY-this.trY)/2 }
	};
	
	
	
	// rotation
	if(this.showRotation) {
		this.arrows.push(new arrow(pos.botRight, this.element, 'rotate', 1, origin,
			{ 'move': 'svg.rotate(this.element, {"x": absolute.x, "y": absolute.y, "dX": dAbsolute.x, "dY": dAbsolute.y}, keys.shiftKey, true);', 'mouseup': mouseUpAction }));
		
		this.arrows.push(new arrow(pos.botLeft, this.element, 'rotate', 2, origin,
			{ 'move': 'svg.rotate(this.element, {"x": absolute.x, "y": absolute.y, "dX": dAbsolute.x, "dY": dAbsolute.y}, keys.shiftKey, true);', 'mouseup': mouseUpAction }));
		
		this.arrows.push(new arrow(pos.topLeft, this.element, 'rotate', 3, origin,
			{ 'move': 'svg.rotate(this.element, {"x": absolute.x, "y": absolute.y, "dX": dAbsolute.x, "dY": dAbsolute.y}, keys.shiftKey, true);', 'mouseup': mouseUpAction }));
		
		this.arrows.push(new arrow(pos.topRight, this.element, 'rotate', 4, origin,
			{ 'move': 'svg.rotate(this.element, {"x": absolute.x, "y": absolute.y, "dX": dAbsolute.x, "dY": dAbsolute.y}, keys.shiftKey, true);', 'mouseup': mouseUpAction }));
		
		// skewing
		this.arrows.push(new arrow(pos.botMid, this.element, 'scaleH', 1.5, pos.center,
			{ 'move': 'svg.skew(this.element, true, {"origin": this.origin, "x": absolute.x, "y": absolute.y, "dX": dAbsolute.x, "dY": dAbsolute.y}, keys.shiftKey, true);', 'mouseup': mouseUpAction },
			new constraintLinear(pos.botLeft, pos.botRight)));
			
		this.arrows.push(new arrow(pos.midLeft, this.element, 'scaleV', 2.5, pos.center,
			{ 'move': 'svg.skew(this.element, false, {"origin": this.origin, "x": absolute.x, "y": absolute.y, "dX": dAbsolute.x, "dY": dAbsolute.y}, keys.shiftKey, true);', 'mouseup': mouseUpAction },
			new constraintLinear(pos.topLeft, pos.botLeft)));
			
		this.arrows.push(new arrow(pos.topMid, this.element, 'scaleH', 3.5, pos.center,
			{ 'move': 'svg.skew(this.element, true, {"origin": this.origin, "x": absolute.x, "y": absolute.y, "dX": dAbsolute.x, "dY": dAbsolute.y}, keys.shiftKey, true);', 'mouseup': mouseUpAction },
			new constraintLinear(pos.topLeft, pos.topRight)));
			
		this.arrows.push(new arrow(pos.midRight, this.element, 'scaleV', 4.5, pos.center,
			{ 'move': 'svg.skew(this.element, false, {"origin": this.origin, "x": absolute.x, "y": absolute.y, "dX": dAbsolute.x, "dY": dAbsolute.y}, keys.shiftKey, true);', 'mouseup': mouseUpAction },
			new constraintLinear(pos.topRight, pos.botRight)));
		
	} else {
		// scaling
		this.arrows.push(new arrow(pos.botRight, this.element, 'scaleD', 1, pos.topLeft,
			{ 'move': 'svg.scale(this.element, {"origin": this.origin, "x": absolute.x, "y": absolute.y, "dX": dAbsolute.x, "dY": dAbsolute.y}, !keys.shiftKey, true);', 'mouseup': mouseUpAction },
			new constraintLinear(pos.botRight, origin, { 'optional': true }) ));
			
		this.arrows.push(new arrow(pos.botLeft, this.element, 'scaleD', 2, pos.topRight,
			{ 'move': 'svg.scale(this.element, {"origin": this.origin, "x": absolute.x, "y": absolute.y, "dX": dAbsolute.x, "dY": dAbsolute.y}, !keys.shiftKey, true);', 'mouseup': mouseUpAction },
			new constraintLinear(pos.botLeft, origin, { 'optional': true }) ));
			
		this.arrows.push(new arrow(pos.topLeft, this.element, 'scaleD', 3, pos.botRight,
			{ 'move': 'svg.scale(this.element, {"origin": this.origin, "x": absolute.x, "y": absolute.y, "dX": dAbsolute.x, "dY": dAbsolute.y}, !keys.shiftKey, true);', 'mouseup': mouseUpAction },
			new constraintLinear(pos.topLeft, origin, { 'optional': true }) ));
			
		this.arrows.push(new arrow(pos.topRight, this.element, 'scaleD', 4, pos.botLeft,
			{ 'move': 'svg.scale(this.element, {"origin": this.origin, "x": absolute.x, "y": absolute.y, "dX": dAbsolute.x, "dY": dAbsolute.y}, !keys.shiftKey, true);', 'mouseup': mouseUpAction },
			new constraintLinear(pos.topRight, origin, { 'optional': true }) ));
		
		this.arrows.push(new arrow(pos.botMid, this.element, 'scaleV', 1.5, pos.topMid,
			{ 'move': 'svg.scale(this.element, {"origin": this.origin, "x": absolute.x, "y": absolute.y, "dX": 0, "dY": dAbsolute.y}, !keys.shiftKey, true);', 'mouseup': mouseUpAction }));
			
		this.arrows.push(new arrow(pos.midLeft, this.element, 'scaleH', 2.5, pos.midRight,
			{ 'move': 'svg.scale(this.element, {"origin": this.origin, "x": absolute.x, "y": absolute.y, "dX": dAbsolute.x, "dY": 0}, !keys.shiftKey, true);', 'mouseup': mouseUpAction }));
			
		this.arrows.push(new arrow(pos.topMid, this.element, 'scaleV', 3.5, pos.botMid,
			{ 'move': 'svg.scale(this.element, {"origin": this.origin, "x": absolute.x, "y": absolute.y, "dX": 0, "dY": dAbsolute.y}, !keys.shiftKey, true);', 'mouseup': mouseUpAction }));
			
		this.arrows.push(new arrow(pos.midRight, this.element, 'scaleH', 4.5, pos.midLeft,
			{ 'move': 'svg.scale(this.element, {"origin": this.origin, "x": absolute.x, "y": absolute.y, "dX": dAbsolute.x, "dY": 0}, !keys.shiftKey, true);', 'mouseup': mouseUpAction }));
	}
	
	
	for(var i = 0; i < this.arrows.length; i++) {
		this.containerArrows.appendChild(this.arrows[i].container);
	}
	if(this.origin) { this.containerArrows.appendChild(this.origin.container); }
	
}