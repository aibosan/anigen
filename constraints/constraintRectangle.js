/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Constraint enforcing values to be inside given rectangle
 */
function constraintRectangle(dimensions, optional) {
    this.dimensions = dimensions || {};
	if(!this.dimensions.x) { dimensions.x = 0; }
	if(!this.dimensions.y) { dimensions.y = 0; }
	if(!this.dimensions.width) { dimensions.width = 0; }
	if(!this.dimensions.height) { dimensions.height = 0; }
	
	this.optional = optional;
}

constraintRectangle.prototype.resolve = function(x, y, keys) {
	if(this.optional && !keys.ctrlKey) {
		return { 'x': x, 'y': y }
	}
	
	if(x < this.dimensions.x) { x = this.dimensions.x; }
	if(x > this.dimensions.x + this.dimensions.width) { x = this.dimensions.x + this.dimensions.width; }
	if(y < this.dimensions.y) { y = this.dimensions.y; }
	if(y > this.dimensions.y + this.dimensions.width) { y = this.dimensions.y + this.dimensions.width; }
	
	return { 'x': x, 'y': y };
}