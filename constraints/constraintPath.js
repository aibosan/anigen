/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Constraint enforcing constant distance from central point (circular motion)
 */
function constraintPath(pathData, optional) {
	if(!pathData) { return; }
    this.path = document.createElementNS(svgNS, 'path');
	this.path.setAttribute('d', pathData);
	this.optional = optional;
}

constraintPath.prototype.resolve = function(x, y, keys) {
	if(this.optional && !keys.ctrlKey) {
		return { 'x': x, 'y': y }
	}
	return this.path.closestPoint([x, y]);
}
