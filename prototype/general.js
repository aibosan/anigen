/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Various prototypes for SVG elements
 */
 
SVGClipPathElement.prototype.validate = function() {
    var groups = this.getElementsByTagName('g', true);
    for(var i = 0; i < groups.length; i++) {
        groups[i].ungroup();
    }
};

SVGDefsElement.prototype.validate = function() {
    var clippaths = this.getElementsByTagName('clippath', true);
    for(var i = 0; i < clippaths.length; i++) {
        clippaths[i].validate();
    }
    // there is a problem with inkscape:path-effect elements eating other defs during transit, for some reason - they should be popped
};

// descriptive elements can have anything as a child
SVGDescElement.prototype.allowsChild = SVGMetadataElement.prototype.allowsChild = 
SVGTitleElement.prototype.allowsChild = function(candidate) { 
	if(!candidate || !candidate.nodeName) { return false; }
	return true;
};

// structrual elements
SVGSVGElement.prototype.allowsChild = SVGAElement.prototype.allowsChild = 
SVGDefsElement.prototype.allowsChild = SVGGElement.prototype.allowsChild = 
SVGMarkerElement.prototype.allowsChild = SVGMaskElement.prototype.allowsChild = 
SVGPatternElement.prototype.allowsChild = SVGSwitchElement.prototype.allowsChild = 
SVGSymbolElement.prototype.allowsChild = function(candidate) {
	if(!candidate || !candidate.nodeName) { return false; }
	if([ 'animatecolor', 'animatemotion', 'animatetransform', 'animate', 'set',
		'desc', 'metadata', 'title',
		'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
		'defs', 'g', 'svg', 'symbol', 'use',
		'lineargradient', 'radialgradient',
		'a', 'altglyphdef', 'clippath', 'color-profile', 'cursor', 'filter',
		'font', 'font-face', 'foreignobject', 'image', 'marker', 'mask',
		'pattern', 'script', 'style', 'switch', 'text', 'view'
	].indexOf(candidate.nodeName.toLowerCase()) != -1) { return true; }
	return false;
};

// shape elements allow animation and descriptive elements only
SVGPathElement.prototype.allowsChild = SVGRectElement.prototype.allowsChild = 
SVGCircleElement.prototype.allowsChild = SVGEllipseElement.prototype.allowsChild = 
SVGLineElement.prototype.allowsChild = SVGPolylineElement.prototype.allowsChild = 
SVGPolygonElement.prototype.allowsChild = function(candidate) {
	if(!candidate || !candidate.nodeName) { return false; }
	if([ 'animatecolor', 'animatemotion', 'animatetransform', 'animate', 'set',
		'desc', 'metadata', 'title'
	].indexOf(candidate.nodeName.toLowerCase()) != -1) { return true; }
	return false;
};

// text
SVGTextElement.prototype.allowsChild = function(candidate) {
	if(!candidate || !candidate.nodeName) { return false; }
	if([ 'animatecolor', 'animatemotion', 'animatetransform', 'animate', 'set',
		'a', 'altglyph', 'textpath', 'tref', 'tspan',
		'desc', 'metadata', 'title'
	].indexOf(candidate.nodeName.toLowerCase()) != -1) { return true; }
	return false;
};

SVGTSpanElement.prototype.allowsChild = SVGTextPathElement.prototype.allowsChild = function(candidate) {
	if(!candidate || !candidate.nodeName) { return false; }
	if([ 'animatecolor', 'animate', 'set',
		'altglyph', 'a', 'tref', 'tspan',
		'desc', 'metadata', 'title'
	].indexOf(candidate.nodeName.toLowerCase()) != -1) { return true; }
	return false;
};

// gradients
SVGLinearGradientElement.prototype.allowsChild = 
SVGRadialGradientElement.prototype.allowsChild = function(candidate) {
	if(!candidate || !candidate.nodeName) { return false; }
	if([ 'animatetransform', 'animate', 'set', 'stop',
		'desc', 'metadata', 'title'
	].indexOf(candidate.nodeName.toLowerCase()) != -1) { return true; }
	return false;
};

// gradient stop
SVGStopElement.prototype.allowsChild = function(candidate) {
	if(!candidate || !candidate.nodeName) { return false; }
	if([ 'animatecolor', 'animate', 'set'
	].indexOf(candidate.nodeName.toLowerCase()) != -1) { return true; }
	return false;
};

// graphics reference elements
SVGUseElement.prototype.allowsChild = 
SVGImageElement.prototype.allowsChild = function(candidate) {
	if(!candidate || !candidate.nodeName) { return false; }
	if([ 'animatecolor', 'animate', 'animatetransform', 'animatemotion', 'set',
		'desc', 'metadata', 'title'
	].indexOf(candidate.nodeName.toLowerCase()) != -1) { return true; }
	return false;
};

// clip path
SVGClipPathElement.prototype.allowsChild = function(candidate) {
	if(!candidate || !candidate.nodeName) { return false; }
	if([ 'animatecolor', 'animate', 'animatetransform', 'animatemotion', 'set',
		'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
		'text', 'use',
		'desc', 'metadata', 'title'
	].indexOf(candidate.nodeName.toLowerCase()) != -1) { return true; }
	return false;
};

// animation elements
SVGAnimateTransformElement.prototype.allowsChild = SVGAnimateElement.prototype.allowsChild = 
SVGSetElement.prototype.allowsChild = SVGViewElement.prototype.allowsChild =
function(candidate) {
	if(!candidate || !candidate.nodeName) { return false; }
	if([ 'desc', 'metadata', 'title'
	].indexOf(candidate.nodeName.toLowerCase()) != -1) { return true; }
	return false;
};

// animate motion allows mpath as well
SVGAnimateMotionElement.prototype.allowsChild = function(candidate) {
	if(!candidate || !candidate.nodeName) { return false; }
	if([ 'desc', 'metadata', 'title', 'mpath'
	].indexOf(candidate.nodeName.toLowerCase()) != -1) { return true; }
	return false;
};

// filter element
SVGFilterElement.prototype.allowsChild = function(candidate) {
	if(!candidate || !candidate.nodeName) { return false; }
	if([ 'desc', 'metadata', 'title',
		'feblend', 'fecolormatrix', 'fecomponenttransfer', 'fecomposite',
		'feconvolvematrix', 'fediffuselighting', 'fedisplacementmap', 'feflood',
		'fegaussianblur', 'feimage', 'femerge', 'femorphology', 'feoffset',
		'fespecularlighting', 'fetile', 'feturbulence',
		'animate', 'set'
	].indexOf(candidate.nodeName.toLowerCase()) != -1) { return true; }
	return false;
};

// filter primitives
SVGFEBlendElement.prototype.allowsChild = SVGFEColorMatrixElement.prototype.allowsChild = 
SVGFECompositeElement.prototype.allowsChild = SVGFEConvolveMatrixElement.prototype.allowsChild = 
SVGFEDisplacementMapElement.prototype.allowsChild = SVGFEGaussianBlurElement.prototype.allowsChild = 
SVGFEDistantLightElement.prototype.allowsChild = SVGFEPointLightElement.prototype.allowsChild = 
SVGFESpotLightElement.prototype.allowsChild = SVGFEMergeNodeElement.prototype.allowsChild = 
SVGFEMorphologyElement.prototype.allowsChild = SVGFEOffsetElement.prototype.allowsChild = 
SVGFETileElement.prototype.allowsChild = SVGFETurbulenceElement.prototype.allowsChild = 

function(candidate) {
	if(!candidate || !candidate.nodeName) { return false; }
	if([ 'animate', 'set'
	].indexOf(candidate.nodeName.toLowerCase()) != -1) { return true; }
	return false;
};

SVGFEMergeElement.prototype.allowsChild =
function(candidate) {
	if(!candidate || !candidate.nodeName) { return false; }
	if([ 'femergenode'
	].indexOf(candidate.nodeName.toLowerCase()) != -1) { return true; }
	return false;
};

SVGFEComponentTransferElement.prototype.allowsChild = 
function(candidate) {
	if(!candidate || !candidate.nodeName) { return false; }
	if([ 'fefunca', 'fefuncb', 'fefuncg', 'fefuncr'
	].indexOf(candidate.nodeName.toLowerCase()) != -1) { return true; }
	return false;
};

SVGFEImageElement.prototype.allowsChild = 
function(candidate) {
	if(!candidate || !candidate.nodeName) { return false; }
	if([ 'animate', 'set', 'animatetransform'
	].indexOf(candidate.nodeName.toLowerCase()) != -1) { return true; }
	return false;
};

SVGFEFloodElement.prototype.allowsChild = 
function(candidate) {
	if(!candidate || !candidate.nodeName) { return false; }
	if([ 'animate', 'set', 'animatecolor'
	].indexOf(candidate.nodeName.toLowerCase()) != -1) { return true; }
	return false;
};

SVGFEDiffuseLightingElement.prototype.allowsChild = SVGFESpecularLightingElement.prototype.allowsChild = 
function(candidate) {
	if(!candidate || !candidate.nodeName) { return false; }
	if([ 'desc', 'metadata', 'title',
		'fedistantlight', 'fepointlight', 'fespotlight'
	].indexOf(candidate.nodeName.toLowerCase()) != -1) { return true; }
	return false;
};