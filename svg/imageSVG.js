/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Self contained <img>-like SVG UI element
 */
function imageSVG(source, dimensions) {
	if(!dimensions) { dimensions = { 'width': 200, 'height': 100 }; }
	if(!dimensions.width) { dimensions.width = 200; }
	if(!dimensions.height) { dimensions.height = 100; }
	if(typeof source === 'string') { source = document.getElementById(source); }
	if(!source || !(source instanceof SVGElement)) { return null;}
	
	this.container = document.createElementNS(svgNS, 'svg');
	this.container.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	this.container.setAttribute("xmlns:sodipodi", "http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd");
	this.container.setAttribute("xmlns:inkscape", "http://www.inkscape.org/namespaces/inkscape");
	this.container.setAttribute("width", dimensions.width);
	this.container.setAttribute("height", dimensions.height);
	this.container.setAttribute("version", "1.1");
	this.container.setAttribute("preserveAspectRatio", "xMidYMid");
	
	this.copy = source.cloneNode(true);
	this.copy.stripId(true);
	this.container.appendChild(this.copy);
	
	var area = source.getBBox();
	var CTM = source.getCTM();
	
	this.userspaceToInitial = function(inX, inY, CTM) {
        var inMatrix = svg.svgElement.createSVGMatrix();
        inMatrix.a = 0; inMatrix.d = 0; inMatrix.e = inX; inMatrix.f = inY;
        var outMatrix = CTM.multiply(inMatrix);
        return { 
			x: (outMatrix.e)/svg.zoom+svg.viewBox.x,
			y: (outMatrix.f)/svg.zoom+svg.viewBox.y
		};
    };
	
	var tl = this.userspaceToInitial(area.x, area.y, CTM);
	var tr = this.userspaceToInitial(area.x+area.width, area.y, CTM);
	var br = this.userspaceToInitial(area.x+area.width, area.y+area.height, CTM);
	var bl = this.userspaceToInitial(area.x, area.y+area.height, CTM);
	
	var blX = Math.min(tl.x, tr.x, br.x, bl.x);
	var trX = Math.max(tl.x, tr.x, br.x, bl.x);
	var blY = Math.min(tl.y, tr.y, br.y, bl.y);
	var trY = Math.max(tl.y, tr.y, br.y, bl.y);
	
	this.container.setAttribute("viewBox", blX + " " + blY + " " + (trX-blX) + " " + (trY-blY));
	
	
}