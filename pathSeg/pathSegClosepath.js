/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Implements SVGPathSegClosepathAbs
 */
function pathSegClosepath() {
	this.pathSegType = 1;
	this.pathSegTypeAsLetter = 'z';
}

pathSegClosepath.prototype = Object.create(pathSeg.prototype);

pathSegClosepath.prototype.toString = function() {
	return 'Z';
}
	
pathSegClosepath.prototype.moveTo = function() { }
	
pathSegClosepath.prototype.moveBy = function() { }
	
pathSegClosepath.prototype.adjust = function() { return this; }
	
pathSegClosepath.prototype.getAdjusted = function() { return new pathSegClosepath(); }
	
pathSegClosepath.prototype.inbetween = function(other, ratio) {
	if(!(other instanceof pathSegClosepath)) { throw new Error('Path segment type mismatch.'); }
	
	return new pathSegClosepath();
}

pathSegClosepath.prototype.clone = function() {
	return new pathSegClosepath();
}

pathSegClosepath.prototype.getMin = pathSegClosepath.prototype.getMax = function() {
	return null;
}
