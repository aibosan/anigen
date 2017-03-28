/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Implements keyframe - the collection of time, value, and spline
 */
function keyframe(time, inSpline, value, intensity) {
	this.time = time;
	if(inSpline != null && inSpline instanceof spline) {
		this.spline = inSpline.clone();
	} else {
		this.spline = null;
	}
	
	if(value != null && typeof value.clone === 'function') {
		this.value = value.clone();
	} else {
		this.value = value;
	}
	this.intensity = intensity != null ? intensity : 1;
}

keyframe.prototype.inbetween = function(other, ratio) {
	if(!(typeof this.value === 'number' && typeof other.value === 'number') &&
		!(typeof this.value.inbetween === 'function' && typeof other.value.inbetween === 'function'))
			{ throw new DOMException(9); }
	
	var newSpline;
	if(this.spline && other.spline) {
		newSpline = this.spline.inbetween(other.spline, ratio);
	} else if(other.spline) {
		newSpline = other.spline.clone();
	}
	
	var newValue = typeof this.value === 'number' ? this.value+ratio*(other.value-this.value) : this.value.inbetween(other.value, ratio);
	
	return new keyframe(
		this.time + ratio*(other.time-this.time),
		newSpline,
		newValue,
		this.intensity + ratio*(other.intensity-this.intensity)
	);
}

keyframe.prototype.clone = function() {
	return new keyframe(this.time, this.spline, this.value, this.intensity);
}