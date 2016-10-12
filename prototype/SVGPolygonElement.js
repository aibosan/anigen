/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for SVG "polygon" (rectangle) element
 */

SVGPolygonElement.prototype.consumeTransform = SVGPolylineElement.prototype.consumeTransform;
SVGPolygonElement.prototype.getValues = SVGPolylineElement.prototype.getValues;
SVGPolygonElement.prototype.commitValues = SVGPolylineElement.prototype.commitValues;
SVGPolygonElement.prototype.setValue = SVGPolylineElement.prototype.setValue;
SVGPolygonElement.prototype.generateAnchors = SVGPolylineElement.prototype.generateAnchors;
SVGPolygonElement.prototype.getCenter = SVGPolylineElement.prototype.getCenter;

SVGPolygonElement.prototype.toPath = function() {
	var path = document.createElementNS(svgNS, 'path');
	var pData = [];
	
	var values = this.getAttribute('points').replace(/,/g, ' ').replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
		values = values.split(' ');
		
	pData.push('M');
	for(var i = 0; i < values.length; i++) {
		pData.push(values[i]);
	}
	pData.push('z');
	
	path.setAttribute('d', pData.join(' '));
	
	for(var i = 0; i < this.attributes.length; i++) {
		if(this.attributes[i].name == 'width' || this.attributes[i].name == 'height' || this.attributes[i].name == 'rx' || this.attributes[i].name == 'ry' || this.attributes[i].name == 'cx' || this.attributes[i].name == 'cy') { continue; }
		path.setAttribute(this.attributes[i].name, this.attributes[i].value);
	}
	
	this.parentNode.insertBefore(path, this);
	this.parentNode.removeChild(this);
	
	if(svg.selected == this) {
		svg.select(path);
	}
	return path;
}


