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
	this.container.appendChild(this.copy);
	this.copy.setAttribute('transform', source.getCTM());
	this.copy.stripId(true);
	this.copy.consumeTransform();
	
	document.body.appendChild(this.container);
	var area = this.copy.getBBox();
	document.body.removeChild(this.container);
	
	this.container.setAttribute("viewBox", area.x + " " + area.y + " " + area.width + " " + area.height);	
}
imageSVG.prototype.userspaceToInitial = function(inX, inY, CTM) {
	var inMatrix = svg.svgElement.createSVGMatrix();
	inMatrix.a = 0; inMatrix.d = 0; inMatrix.e = inX; inMatrix.f = inY;
	var outMatrix = CTM.multiply(inMatrix);
	return { 
		x: (outMatrix.e)/svg.zoom+svg.viewBox.x,
		y: (outMatrix.f)/svg.zoom+svg.viewBox.y
	};
}
	
	