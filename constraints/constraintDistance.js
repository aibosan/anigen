/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Constraint enforcing constant distance from central point (circular motion)
 */
function constraintDistance(center, radius, optional) {
    this.center = center;
	this.radius = radius;
	this.optional = optional;
}

constraintDistance.prototype.resolve = function(x, y, keys) {
	if(this.optional && !keys.ctrlKey) {
		return { 'x': x, 'y': y }
	}
	
	var angle = Math.atan2((x-this.center.y), (y-this.center.x));
	return {
		'x': this.center.x + this.radius*Math.cos(angle),
		'y': this.center.y + this.radius*Math.sin(angle)
	}
}