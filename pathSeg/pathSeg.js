/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		"Abstract" class inherited by other pathSeg classes; implementation of SVGPathSeg
 */
function pathSeg() { }

pathSeg.prototype.negate = function() {
	if(this.x != null) { this.x = -1*this.x; }
	if(this.y != null) { this.y = -1*this.y; }
	if(this.x1 != null) { this.x1 = -1*this.x1; }
	if(this.y1 != null) { this.y1 = -1*this.y1; }
	if(this.x2 != null) { this.x2 = -1*this.x2; }
	if(this.y2 != null) { this.y2 = -1*this.y2; }
}

pathSeg.prototype.sum = function(other) {
	if(!(other instanceof pathSeg)) { return; }
	if(this.x != null && other.x != null) { this.x += other.x; }
	if(this.y != null && other.y != null) { this.y += other.y; }
	if(this.x1 != null && other.x1 != null) { this.x1 += other.x1; }
	if(this.y1 != null && other.y1 != null) { this.y1 += other.y1; }
	if(this.x2 != null && other.x2 != null) { this.x2 += other.x2; }
	if(this.y2 != null && other.y2 != null) { this.y2 += other.y2; }
}
