/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Constraint enforcing specific position
 */
function constraintPosition(point, optional) {
    this.point = point;
	this.optional = optional;
	
	this.resolve = function(x, y, keys) {
		if(this.optional && !keys.altKey) {
			return { 'x': x, 'y': y };
		}
		return { 'x': this.point.x, 'y': this.point.y };
	};
}