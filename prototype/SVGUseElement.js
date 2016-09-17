/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for SVG <use> element
 */

SVGUseElement.prototype.getCenter = function(viewport) {
	/*
	var xMax, xMin, xMax_anim, xMin_anim;
	var yMax, yMin, yMax_anim, yMin_anim;
	
	for(var i = 0; i < this.children.length; i++) {
		if(!(this.children[i] instanceof SVGAnimationElement) && typeof this.children[i].getCenter === 'function') {
			var coords = this.children[i].getCenter(viewport);
			if(!coords) { continue; }
			if(coords.x != null && (xMax == null || xMax < coords.x)) { xMax = coords.x; }
			if(coords.x != null && (xMin == null || xMin > coords.x)) { xMin = coords.x; }
			if(coords.y != null && (yMax == null || yMax < coords.y)) { yMax = coords.y; }
			if(coords.y != null && (yMin == null || yMin > coords.y)) { yMin = coords.y; }
			
			if(coords.x_anim != null && (xMax_anim == null || xMax_anim < coords.x_anim)) { xMax_anim = coords.x_anim; }
			if(coords.x_anim != null && (xMin_anim == null || xMin_anim > coords.x_anim)) { xMin_anim = coords.x_anim; }
			if(coords.y_anim != null && (yMax_anim == null || yMax_anim < coords.y_anim)) { yMax_anim = coords.y_anim; }
			if(coords.y_anim != null && (yMin_anim == null || yMin_anim > coords.y_anim)) { yMin_anim = coords.y_anim; }
		}
	}
	
	if(xMax == null || xMin == null || yMax == null || yMin == null) { return; }
	
	var cx = xMin+(xMax-xMin)/2;
	var cy = yMin+(yMax-yMin)/2;
	
	var cx_anim = xMin_anim+(xMax_anim-xMin_anim)/2;
	var cy_anim = yMin_anim+(yMax_anim-yMin_anim)/2;
	
	return { 'x': cx, 'y': cy, 'x_anim': cx_anim, 'y_anim': cy_anim,
		'left': xMin, 'right': xMax, 'top': yMin, 'bottom': yMax };
		*/
}


