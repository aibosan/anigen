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
    this.container.setAttribute("anigen:lock", "interface");
    this.container.setAttribute("id", "anigenSelectionBox");

    this.rect1 = document.createElementNS(svgNS, "polygon");
    this.rect2 = document.createElementNS(svgNS, "polygon");
    this.container.appendChild(this.rect1);
    this.container.appendChild(this.rect2);

    this.rect1.setAttribute("anigen:lock", "interface");
    this.rect2.setAttribute("anigen:lock", "interface");

    this.rect1.setAttribute("style", "stroke-linecap:round;fill:none;stroke-opacity:0.5;stroke:#ffffff");
    this.rect2.setAttribute("style", "stroke-linecap:round;fill:none;stroke:#000000");

	this.arrows = [];
	
	this.showRotation = false;
}

selectionBox.prototype.isHidden = function() {
	return this.container.getAttribute("display") == "none";
}
selectionBox.prototype.hide = function() {
	this.container.setAttribute("display", "none");
}
selectionBox.prototype.show = function() {
	this.container.removeAttribute("display");
}

selectionBox.prototype.userspaceToInitial = function(inX, inY, CTM) {
	var inMatrix = svg.svgElement.createSVGMatrix();
	inMatrix.a = 0; inMatrix.d = 0; inMatrix.e = inX; inMatrix.f = inY;
	var outMatrix = CTM.multiply(inMatrix);
	return { 
		x: (outMatrix.e)/svg.zoom+svg.viewBox.x,
		y: (outMatrix.f)/svg.zoom+svg.viewBox.y
	};
}

selectionBox.prototype.adjustZoom = function() {
	this.rect1.setAttribute("stroke-dasharray", (6/svg.zoom)+","+(4/svg.zoom));
	this.rect2.setAttribute("stroke-dasharray", (6/svg.zoom)+","+(4/svg.zoom));
	this.rect1.setAttribute("stroke-width", 3/svg.zoom+"px");
	this.rect2.setAttribute("stroke-width", 1/svg.zoom+"px");
	for(var i = 0; i < this.arrows.length; i++) {
		this.arrows[i].adjustZoom();
	}
}

selectionBox.prototype.getCenter = function() {
	return { x: this.blX + (this.trX - this.blX)/2, y: this.blY + (this.trY - this.blY)/2}
}

selectionBox.prototype.setElement = function(element) {
	if(!element || !(typeof element.getBBox === 'function')) {
		this.element = null;
		return;
	}
	if(this.element != element) { this.showRotation = false; }
	
	this.element = element;
	this.refresh();
	this.show();
}

selectionBox.prototype.refresh = function() {
	if(!this.element || !(typeof this.element.getBBox === 'function')) { return; }
	var CTM = this.element.getCTM();
	var bbox = this.element.getBBox();
	this.setArea(bbox, CTM);
}


selectionBox.prototype.setArea = function(area, CTM) {
	if(CTM == null) { CTM = svg.svgElement.createSVGMatrix(); }

	var tl = this.userspaceToInitial(area.x, area.y, CTM);
	var tr = this.userspaceToInitial(area.x+area.width, area.y, CTM);
	var br = this.userspaceToInitial(area.x+area.width, area.y+area.height, CTM);
	var bl = this.userspaceToInitial(area.x, area.y+area.height, CTM);

	this.blX = Math.min(tl.x, tr.x, br.x, bl.x);
	this.trX = Math.max(tl.x, tr.x, br.x, bl.x);
	this.blY = Math.min(tl.y, tr.y, br.y, bl.y);
	this.trY = Math.max(tl.y, tr.y, br.y, bl.y);

	this.container.removeChildren();
	this.container.appendChild(this.rect1);
	this.container.appendChild(this.rect2);
	
	this.adjustZoom();

	this.rect1.setAttribute("points", this.blX + "," + this.blY + " " + this.blX + "," + this.trY + " " + this.trX + "," + this.trY + " " + this.trX + "," + this.blY);
	this.rect2.setAttribute("points", this.blX + "," + this.blY + " " + this.blX + "," + this.trY + " " + this.trX + "," + this.trY + " " + this.trX + "," + this.blY);
	
	this.arrows = [];
	
	// rotation
	if(this.showRotation) {
		this.arrows.push(new arrow({'x': this.trX, 'y': this.blY}, this.element, 'rotate', 1, {'x': this.trX+(this.blX-this.trX)/2, 'y': this.blY+(this.trY-this.blY)/2}, { 'move': 'svg.ui.selectionBox.hide();svg.rotate(this.element, angle, this.origin, true);'}, new constraintDistance({'x': this.trX+(this.blX-this.trX)/2, 'y': this.blY+(this.trY-this.blY)/2}, Math.sqrt((this.blX-this.trX)*(this.blX-this.trX)/4+(this.trY-this.blY)*(this.trY-this.blY)/4))));
		this.arrows.push(new arrow({'x': this.blX, 'y': this.blY}, this.element, 'rotate', 2, {'x': this.trX+(this.blX-this.trX)/2, 'y': this.blY+(this.trY-this.blY)/2}, { 'move': 'svg.ui.selectionBox.hide();svg.rotate(this.element, angle, this.origin, true);'}, new constraintDistance({'x': this.trX+(this.blX-this.trX)/2, 'y': this.blY+(this.trY-this.blY)/2}, Math.sqrt((this.blX-this.trX)*(this.blX-this.trX)/4+(this.trY-this.blY)*(this.trY-this.blY)/4))));
		this.arrows.push(new arrow({'x': this.blX, 'y': this.trY}, this.element, 'rotate', 3, {'x': this.trX+(this.blX-this.trX)/2, 'y': this.blY+(this.trY-this.blY)/2}, { 'move': 'svg.ui.selectionBox.hide();svg.rotate(this.element, angle, this.origin, true);'}, new constraintDistance({'x': this.trX+(this.blX-this.trX)/2, 'y': this.blY+(this.trY-this.blY)/2}, Math.sqrt((this.blX-this.trX)*(this.blX-this.trX)/4+(this.trY-this.blY)*(this.trY-this.blY)/4))));
		this.arrows.push(new arrow({'x': this.trX, 'y': this.trY}, this.element, 'rotate', 4, {'x': this.trX+(this.blX-this.trX)/2, 'y': this.blY+(this.trY-this.blY)/2}, { 'move': 'svg.ui.selectionBox.hide();svg.rotate(this.element, angle, this.origin, true);'}, new constraintDistance({'x': this.trX+(this.blX-this.trX)/2, 'y': this.blY+(this.trY-this.blY)/2}, Math.sqrt((this.blX-this.trX)*(this.blX-this.trX)/4+(this.trY-this.blY)*(this.trY-this.blY)/4))));
		
		/*
		// skewing
		this.arrows.push(new arrow({'x': this.trX+(this.blX-this.trX)/2, 'y': this.blY}, this.element, 'scaleH', 1.5));
		this.arrows.push(new arrow({'x': this.blX, 'y': this.blY+(this.trY-this.blY)/2}, this.element, 'scaleH', 2.5));
		this.arrows.push(new arrow({'x': this.trX+(this.blX-this.trX)/2, 'y': this.trY}, this.element, 'scaleH', 3.5));
		this.arrows.push(new arrow({'x': this.trX, 'y': this.blY+(this.trY-this.blY)/2}, this.element, 'scaleH', 4.5));
		*/
	} else {
		// scaling
		this.arrows.push(new arrow({'x': this.trX, 'y': this.blY}, this.element, 'scaleD', 1, {'x': this.blX, 'y': this.trY}, { 'move': 'svg.ui.selectionBox.hide();svg.scale(this.element, ratio, this.origin, true);'}));
		this.arrows.push(new arrow({'x': this.blX, 'y': this.blY}, this.element, 'scaleD', 2, {'x': this.trX, 'y': this.trY}, { 'move': 'svg.ui.selectionBox.hide();svg.scale(this.element, ratio, this.origin, true);'}));
		this.arrows.push(new arrow({'x': this.blX, 'y': this.trY}, this.element, 'scaleD', 3, {'x': this.trX, 'y': this.blY}, { 'move': 'svg.ui.selectionBox.hide();svg.scale(this.element, ratio, this.origin, true);'}));
		this.arrows.push(new arrow({'x': this.trX, 'y': this.trY}, this.element, 'scaleD', 4, {'x': this.blX, 'y': this.blY}, { 'move': 'svg.ui.selectionBox.hide();svg.scale(this.element, ratio, this.origin, true);'}));
		
		this.arrows.push(new arrow({'x': this.trX+(this.blX-this.trX)/2, 'y': this.blY}, this.element, 'scaleV', 1.5, {'x': this.trX+(this.blX-this.trX)/2, 'y': this.trY}, { 'move': 'svg.ui.selectionBox.hide();svg.scale(this.element, {"x": 1, "y": ratio.y }, this.origin, true);'}));
		this.arrows.push(new arrow({'x': this.blX, 'y': this.blY+(this.trY-this.blY)/2}, this.element, 'scaleV', 2.5, {'x': this.trX, 'y': this.blY+(this.trY-this.blY)/2}, { 'move': 'svg.ui.selectionBox.hide();svg.scale(this.element, {"x": ratio.x, "y": 1 }, this.origin, true);'}));
		this.arrows.push(new arrow({'x': this.trX+(this.blX-this.trX)/2, 'y': this.trY}, this.element, 'scaleV', 3.5, {'x': this.trX+(this.blX-this.trX)/2, 'y': this.blY}, { 'move': 'svg.ui.selectionBox.hide();svg.scale(this.element, {"x": 1, "y": ratio.y }, this.origin, true);'}));
		this.arrows.push(new arrow({'x': this.trX, 'y': this.blY+(this.trY-this.blY)/2}, this.element, 'scaleV', 4.5, {'x': this.blX, 'y': this.blY+(this.trY-this.blY)/2}, { 'move': 'svg.ui.selectionBox.hide();svg.scale(this.element, {"x": ratio.x, "y": 1 }, this.origin, true);'}));
	}
	
	for(var i = 0; i < this.arrows.length; i++) {
		this.container.appendChild(this.arrows[i].container);
	}
	
}