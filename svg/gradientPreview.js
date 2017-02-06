/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Self contained <img>-like SVG UI element
 */
function gradientPreview(source, dimensions) {
	if(typeof source === 'string') { source = document.getElementById(source); }
	if(!source || !(source instanceof SVGElement)) { return null;}
	
	if(!dimensions) { dimensions = {}; }
	
	this.container = document.createElementNS(svgNS, 'svg');
	this.container.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	this.container.setAttribute("xmlns:sodipodi", "http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd");
	this.container.setAttribute("xmlns:inkscape", "http://www.inkscape.org/namespaces/inkscape");
	this.container.setAttribute("width", dimensions.width || "200px");
	this.container.setAttribute("height", dimensions.height || "100px");
	this.container.setAttribute("viewBox", "0 0 100 100");
	this.container.setAttribute("version", "1.1");
	this.container.setAttribute("preserveAspectRatio", "none");
	
	this.defs = document.createElementNS(svgNS, 'defs');
	this.container.appendChild(this.defs);
	
	var transfered = this.transferGradient(source);
	
	var rect = document.createElementNS(svgNS, 'rect');
		rect.setAttribute('x', '0');
		rect.setAttribute('y', '0');
		rect.setAttribute('width', '100');
		rect.setAttribute('height', '100');
	if(transfered) {
		transfered.setAttribute('x1', 0);
		transfered.setAttribute('y1', 0.5);
		transfered.setAttribute('x2', 1);
		transfered.setAttribute('y2', 0.5);
		rect.setAttribute('fill', 'url("#'+transfered.id+'")');
	}
	
	this.container.appendChild(rect);
}

gradientPreview.prototype.transferGradient = function(element) {
	if(!element) { return; }
	
	var clone = element.cloneNode(true);
		clone.removeAttribute('id');
		clone.generateId();
	
		clone.setAttribute('gradientUnits', 'objectBoundingBox');
		clone.removeAttribute('gradientTransform');
		clone.setAttribute('x1', 0);
		clone.setAttribute('y1', 0);
		clone.setAttribute('x2', 1);
		clone.setAttribute('y2', 1);
		
	this.defs.appendChild(clone);
	
	if(clone.getAttribute('xlink:href')) {
		var linked = this.transferGradient(document.getElementById(clone.getAttribute('xlink:href').substring(1)));
		if(linked) {
			clone.setAttribute('xlink:href', '#'+linked.getAttribute('id'));
		}
	}
	
	return clone;
	
}


/*
gradientPreview.prototype.userspaceToInitial = function(inX, inY, CTM) {
	var inMatrix = svg.svgElement.createSVGMatrix();
	inMatrix.a = 0; inMatrix.d = 0; inMatrix.e = inX; inMatrix.f = inY;
	var outMatrix = CTM.multiply(inMatrix);
	return { 
		x: (outMatrix.e)/svg.zoom+svg.viewBox.x,
		y: (outMatrix.f)/svg.zoom+svg.viewBox.y
	};
}
*/
	
	