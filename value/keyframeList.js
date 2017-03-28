/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Implements keyframe list - collection of keyframes with methods to generate attributes
 */
function keyframeList() {
	this.arr = [];
	this.length = 0;
}


keyframeList.prototype.clear = function() {
	this.arr = [];
	this.length = 0;
}

keyframeList.prototype.getItem = function(index) {
	if(index < 0 || index >= this.arr.length) {	throw new DOMException(1); }
	return this.arr[index];
}

keyframeList.prototype.insertBefore = function(newItem, index) {
	if(!(newItem instanceof keyframe)) { return; }
	if(index < 0 || index >= this.arr.length) {	throw new DOMException(1); }
	
	this.arr.splice(index, 0, newItem);
	this.length = this.arr.length;
	return this.arr(index);
}

keyframeList.prototype.replace = function(newItem, index) {
	if(!(newItem instanceof keyframe)) { return; }
	if(index < 0 || index >= this.arr.length) {	throw new DOMException(1); }
	
	this.arr[index] = newItem;
	return newItem;
}

keyframeList.prototype.remove = function(index) {
	if(index < 0 || index >= this.arr.length) {	throw new DOMException(1); }
	var item = this.arr.splice(index, 1)[0];
	if(index == 0 && this.arr[0]) { this.arr[0].spline = null; }
	this.length = this.arr.length;
	return item;
}

keyframeList.prototype.push = function(newItem) {
	if(!(newItem instanceof keyframe)) { return; }
	
	this.arr.push(newItem);
	this.length = this.arr.length;
	return newItem;
}

keyframeList.prototype.indexOf = function(item) {
	if(!(item instanceof keyframe)) { return -1; }
	
	return this.arr.indexOf(item);
}


keyframeList.prototype.getTimes = function() {
	var out = [];
	for(var i = 0; i < this.arr.length; i++) {
		out.push(this.arr[i].time);
	}
	return out;
}

keyframeList.prototype.getSplines = function() {
	var out = [];
	for(var i = 0; i < this.arr.length; i++) {
		if(!this.arr[i].spline) { continue; }
		out.push(this.arr[i].spline.toString());
	}
	return out;
}

keyframeList.prototype.getValues = function() {
	var out = [];
	for(var i = 0; i < this.arr.length; i++) {
		out.push(this.arr[i].value.toString());
	}
	return out;
}

keyframeList.prototype.getIntensity = function() {
	var out = [];
	for(var i = 0; i < this.arr.length; i++) {
		if(this.arr[i].intensity == null) {
			out.push(1);
		} else {
			out.push(this.arr[i].intensity);
		}
	}
	return out;
}


keyframeList.prototype.sort = function() {
	this.arr.sort(function(a,b) { return a.time-b.time; });
	for(var i = this.arr.length-1; i > 0; i--) {
		if(this.arr[i].spline == null) {
			this.arr[i].spline = this.arr[i-1].spline;
			this.arr[i-1].spline = null;
		}
	}
}


keyframeList.prototype.duplicate = function(index) {
	if(index < 0 || index >= this.arr.length) {	throw new DOMException(1); }
	
	var clone = this.arr[index].clone();
	
	this.arr.splice(index, 0, clone);
	this.length = this.arr.length;
	
	if(index == 0) {
		if(this.arr[2]) {
			this.arr[1].spline = this.arr[2].spline.clone();
		} else {
			this.arr[1].spline = new spline();
		}
	}
	return clone;
}

keyframeList.prototype.inbetween = function(index1, index2, ratio) {
	if(index2 < index1) {
		var temp = index1;
		index1 = index2;
		index2 = temp;
	}
	if(index1 < 0 || index2 < 0 || index1 >= this.arr.length || index2 >= this.arr.length) { throw new DOMException(1); }
	
	if(ratio == null) { ratio = 0.5; }
	
	try {
		var tween = this.arr[index1].inbetween(this.arr[index2], ratio);
		this.push(tween);
		this.sort();
		this.length = this.arr.length;
		return tween;
	} catch(err) {
		throw err;
	}
}

keyframeList.prototype.switchItems = function(index1, index2) {
	if(index1 < 0 || index2 < 0 || index1 >= this.arr.length || index2 >= this.arr.length) { throw new DOMException(1); }
	var tempValue = this.arr[index1].value;
	var tempSpline = this.arr[index1].spline;
	this.arr[index1].value = this.arr[index2].value;
	this.arr[index1].spline = this.arr[index2].spline;
	this.arr[index2].value = tempValue;
	this.arr[index2].spline = tempSpline;
	this.sort();
}

keyframeList.prototype.invertValues = function(index) {
	if(index != null) {
		if(index < 0 || index >= this.arr.length) { throw new DOMException(1); }
		if(this.arr[index].value == 'none') { this.arr[index].value = 'inline'; } else
		if(this.arr[index].value == 'inline') { this.arr[index].value = 'none'; } else
		if(this.arr[index].value == 'hidden') { this.arr[index].value = 'visible'; } else
		if(this.arr[index].value == 'visible') { this.arr[index].value = 'hidden'; } else 
		if(typeof this.arr[index].value.isInvertible !== 'function' || !this.arr[index].value.isInvertible()) {
			return false;
		} else {
			this.arr[index].value.invert();
		}
	} else {
		for(var i = 0; i < this.arr.length; i++) {
			if(typeof this.arr[i].value.isInvertible !== 'function' || !this.arr[i].value.isInvertible()) { return false; }
			this.arr[i].value.invert();
		}
	}
	return true;
}

keyframeList.prototype.scaleValues = function(index, factor) {
	if(index != null) {
		if(index < 0 || index >= this.arr.length) { throw new DOMException(1); }
		if(typeof this.arr[index].value.isScalable !== 'function' || !this.arr[index].value.isScalable()) {
			return false;
		} else {
			this.arr[index].value.scale(factor);
		}
	} else {
		for(var i = 0; i < this.arr.length; i++) {
			if(typeof this.arr[i].value.isScalable !== 'function' || !this.arr[i].value.isScalable()) {
				return false;
			} else {
				this.arr[i].value.scale(factor);
			}
		}
	}
	return true;
}


keyframeList.prototype.balance = function(index1, index2) {
	if(index1 == null) { index1 = 0; }
	if(index2 == null) { index2 = this.length-1; }
	if(index2 < index1) {
		var temp = index1;
		index1 = index2;
		index2 = temp;
	}
	if(index1 < 0 || index2 < 0 || index1 >= this.arr.length || index2 >= this.arr.length) { throw new DOMException(1); }
	var delta = (this.arr[index2].time-this.arr[index1].time)/(index2-index1);
	var offset = this.arr[index1].time;
	for(var i = 1; i+index1 < index2; i++) {
		this.arr[index1+i].time = offset+delta*i;
	}
}

keyframeList.prototype.pasteTimes = function(otherList) {
	if(!(otherList instanceof keyframeList)) { return false; }
	while(otherList.length > this.arr.length) {
		this.duplicate(this.arr.length-1);
	}
	while(otherList.length < this.arr.length) {
		this.remove(this.arr.length-1);
	}
	for(var i = 0; i < this.arr.length; i++) {
		this.arr[i].spline = otherList.getItem(i).spline ? otherList.getItem(i).spline.clone() : null;
		this.arr[i].time = otherList.getItem(i).time;
		//this.arr[i].intensity = otherList.getItem(i).intensity;
	}
	this.length = this.arr.length;
}






	
	
	
	
	
	
	
	
	
	
	