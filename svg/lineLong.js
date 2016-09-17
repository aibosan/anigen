/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		"Infinite" line UI element
 */
function lineLong(pointA, pointB, color) {
	if(pointA == null || pointB == null) { return; }
	
	this.pointA = pointA;
	this.pointB = pointB;
	this.vector = { 'x': pointB.x-pointA.x, 'y': pointB.y-pointA.y };
	
	this.container = document.createElementNS(svgNS, 'g');
	this.path = document.createElementNS(svgNS, 'line');
	this.container.appendChild(this.path);
	
	this.adjustZoom = function() {
        if(this.vector.x == 0 && this.vector.y == 0) { return; }
		if(!svg || !svg.viewBox) { return; }
		
		this.path.setAttribute("stroke-width", 1.5/svg.zoom+"px");
		
		var x1, y1, x2, y2;
		
		if(this.vector.y == 0) {
			x1 = svg.viewBox.x;
			x2 = svg.viewBox.x+svg.viewBox.width;
			var t1 = (x1 - this.pointA.x)/this.vector.x;
			var t2 = (x2 - this.pointA.x)/this.vector.x;
			y1 = t1*this.vector.y+this.pointA.y;
			y2 = t2*this.vector.y+this.pointA.y;
		} else {
			y1 = svg.viewBox.y;
			y2 = svg.viewBox.y+svg.viewBox.height;
			var t1 = (y1 - this.pointA.y)/this.vector.y;
			var t2 = (y2 - this.pointA.y)/this.vector.y;
			x1 = t1*this.vector.x+this.pointA.x;
			x2 = t2*this.vector.x+this.pointA.x;
		}
		
		this.path.setAttribute('x1', x1);
		this.path.setAttribute('y1', y1);
		this.path.setAttribute('x2', x2);
		this.path.setAttribute('y2', y2);
    };
	
	if(!color) { color = '#0000aa'; }
    this.path.setAttribute("style", "stroke-linecap:round;fill:none;stroke:"+color);
	
	this.adjustZoom();
	this.container.shepherd = this;
	
	this.hide = function() {
		this.container.setAttribute('display', 'none');
	}
}