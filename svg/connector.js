/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Linear connector (white with black outline) between two elements with .x and .y properties
 */
function connector(pointA, pointB, color) {
	if(pointA == null || pointB == null) { return; }
	
	this.adjustZoom = function() {
        this.path.setAttribute("stroke-width", 1.5/svg.zoom+"px");
    };
	
	this.pointA = pointA;
	this.pointB = pointB;
	
	if(this.pointA instanceof anchor || this.pointA instanceof anchorAngle) {
		this.pointA.addConnector(this);
	}
	if(this.pointB instanceof anchor || this.pointB instanceof anchorAngle) {
		this.pointB.addConnector(this);
	}
	
	this.container = document.createElementNS(svgNS, 'g');
	this.path = document.createElementNS(svgNS, 'line');
	this.container.appendChild(this.path);
	
	if(!color) { color = '#0000aa'; }
	
    this.path.setAttribute("style", "stroke-linecap:round;fill:none;stroke:"+color);
	
	this.refresh = function() {
		var CTM = this.path.getCTMBase();
		
		var absA = this.pointA.getAbsolute();
		var absB = this.pointB.getAbsolute();
		
		var adjA = CTM.toUserspace(absA.x, absA.y);
		var adjB = CTM.toUserspace(absB.x, absB.y);
		
		this.path.setAttribute('x1', adjA.x);
		this.path.setAttribute('y1', adjA.y);
		this.path.setAttribute('x2', adjB.x);
		this.path.setAttribute('y2', adjB.y);
	};
	
	this.adjustZoom();
	this.refresh();
	
	this.container.shepherd = this;
	
	this.hide = function() {
		this.container.setAttribute('display', 'none');
	}
}