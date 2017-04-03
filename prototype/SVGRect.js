/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for SVG "rect" element
 */

SVGRect.prototype.toString = function() {
	return this.x+' '+this.y+' '+this.width+' '+this.height;
}

SVGRect.prototype.intersects = function(other) {
	if(!other || (!(other instanceof SVGRect ) &&
		(other.x == null || other.y == null || other.width == null || other.height == null))) {
			return false;
	}
	
	return !(other.x > this.x+this.width || 
           other.x+other.width < this.x || 
           other.y > this.y+this.height ||
           other.y+other.height < this.y);
}
