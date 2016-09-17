/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for SVG animation elements (the core element all SVG animations inherit from)
 */

SVGAnimationElement.prototype.translateBy = function(byX, byY, makeHistory) {
	return;
}
 

SVGAnimationElement.prototype.consumeTransform = function(matrixIn) {
	this.removeAttribute('transform');
}

SVGAnimationElement.prototype.setZero = function(x, y, makeHistory) {
	this.parentNode.setZero(x, y, makeHistory);
}
	
// returns a parsed list of time objects corresponding to the "begin" attribute values
// copies the same list as element.beginList
SVGAnimationElement.prototype.getBeginList = function() {
	this.beginList = [];
	if(!this.getAttribute('begin')) { return this.beginList; }
	var temp = this.getAttribute('begin').split(';');
	for(var i = 0; i < temp.length; i++) {
		this.beginList.push(new time(temp[i]));
	}
	return this.beginList;
}

// returns dur as time object
// copies the same object as element.dur
SVGAnimationElement.prototype.getDur = function() {
	this.dur = new time(this.getAttribute('dur'));
	return this.dur;
}

// returns repeatCount attribute; integer for numeric value, string for "indefinite"
// copies the same as element.repeatCount
SVGAnimationElement.prototype.getRepeatCount = function() {
	this.repeatCount = this.getAttribute('repeatCount');
	if(!isNaN(this.repeatCount)) { this.repeatCount = parseInt(this.repeatCount); }
	return this.repeatCount;
}

SVGAnimationElement.prototype.getCalcMode = function() {
	this.calcMode = this.getAttribute('calcMode');
	return this.calcMode;
}



// sets begin of given index to given time object, and remakes (clones and deletes) the element to stop lingering begins
// throws DOMException if index is out of bounds
// returns new element
SVGAnimationElement.prototype.setBegin = function(index, value, makeHistory) {
	this.getBeginList();
	
	if(index < 0 || index >= this.beginList.length) { throw new DOMException(1); }
	
	this.beginList[index] = new time(value);
	
	if(makeHistory && svg && svg.history) {
		svg.history.add(new historyAttribute(this.id, 
			{ 'begin': this.getAttribute('begin') },
			{ 'begin': this.beginList.join(';') },
			true));
	}
	
	this.setAttribute('begin', this.beginList.join(';'));
	if(this.timelineObject) { this.timelineObject.takeValues(); }
	
	var par = this.parentNode;
	var nextSibling = this.nextElementSibling;
	var clone = this.cloneNode(true);
	this.parentNode.insertBefore(clone, this);
	this.parentNode.removeChild(this);
	
	return clone;
}

SVGAnimationElement.prototype.removeBegin = function(index, makeHistory) {
	this.getBeginList();
	
	if(index < 0 || index >= this.beginList.length) { throw new DOMException(1); }
	
	this.beginList.splice(index, 1);
	
	if(makeHistory && svg && svg.history) {
		svg.history.add(new historyAttribute(this.id, 
			{ 'begin': this.getAttribute('begin') },
			{ 'begin': this.beginList.length == 0 ? null : this.beginList.join(';') },
			true));
	}
	
	if(this.beginList.length == 0) {
		this.removeAttribute('begin');
	} else {
		this.setAttribute('begin', this.beginList.join(';'));
	}
	if(this.timelineObject) { this.timelineObject.takeValues(); }
	
	var par = this.parentNode;
	var nextSibling = this.nextElementSibling;
	var clone = this.cloneNode(true);
	this.parentNode.insertBefore(clone, this);
	this.parentNode.removeChild(this);
	
	return clone;
}

SVGAnimationElement.prototype.addBegin = function(timeValue, makeHistory) {
	this.getBeginList();
	
	var newTime = new time(timeValue);
	
	this.beginList.push(newTime);
	this.beginList.sort(function(a,b) { return a.value-b.value; });
	
	if(makeHistory && svg && svg.history) {
		svg.history.add(new historyAttribute(this.id, 
			{ 'begin': this.getAttribute('begin') },
			{ 'begin': this.beginList.join(';') },
			true));
	}
	
	this.setAttribute('begin', this.beginList.join(';'));
	if(this.timelineObject) { this.timelineObject.takeValues(); }
	
	var par = this.parentNode;
	var nextSibling = this.nextElementSibling;
	var clone = this.cloneNode(true);
	this.parentNode.insertBefore(clone, this);
	this.parentNode.removeChild(this);
	
	return clone;
}


// sets dur to given value (not time object)
SVGAnimationElement.prototype.setDur = function(value, makeHistory, keepTimes) {
	var newDur = new time(value);
	if(keepTimes) {
		this.getTimes();
		this.getDur();
		
		var ratio = this.dur.value/newDur.value;
		
		for(var i = 0; i < this.times.length; i++) {
			this.times[i] *= ratio;
			if(this.times[i] > 1) { this.times[i] = 1; }
		}
		
		if(makeHistory && svg && svg.history) {
			svg.history.add(new historyAttribute(this.id, 
				{ 'keyTimes': this.getAttribute('keyTimes'), 'dur': this.getAttribute('dur') },
				{ 'keyTimes': this.times.join(';'), 'dur': newDur.toString() }, true));
		}
		
		this.dur = newDur;
		this.setAttribute('dur', this.dur);
		this.commitTimes();
		if(this.timelineObject) {	this.timelineObject.takeValues();	}
		
	} else {
		if(makeHistory && svg && svg.history) {
			svg.history.add(new historyAttribute(this.id, 
				{ 'dur': this.getAttribute('dur') },
				{ 'dur': newDur.toString() }, true));
		}
		
		this.dur = newDur;
		this.setAttribute('dur', this.dur);
		if(this.timelineObject) {	this.timelineObject.takeValues();	}
	}
}

// sets repeatCount to given value
SVGAnimationElement.prototype.setRepeatCount = function(value, makeHistory) {
	if(isNaN(value) && value != 'indefinite') { return; }
	if(value != 'indefinite') { value = parseInt(value); }
	
	if(makeHistory && svg && svg.history) {
		svg.history.add(new historyAttribute(this.id, 
			{ 'repeatCount': this.getAttribute('repeatCount') },
			{ 'repeatCount': value }, true));
	}
	
	this.repeatCount = value;
	this.setAttribute('repeatCount', value);
	
	if(this.timelineObject) { this.timelineObject.takeValues(); }
}

// returns array of animation values ("values" attribute)
// 		if animation has "from" and "to" attributes, they are changed into the general "values" attribute and removed
SVGAnimationElement.prototype.getValues = function() {
	this.values = [];
	var temp = this.getAttribute('values');
	if(!temp) {
		var vFrom = this.getAttribute('from');
		var vTo = this.getAttribute('to');
		if(vFrom && vTo) {
			this.values.push(vFrom);
			this.values.push(vTo);
			this.setAttribute('values', this.values.join(';'));
			this.removeAttribute('from');
			this.removeAttribute('to');
		}
	} else {
		temp = temp.split(';');
		for(var i = 0; i < temp.length; i++) {
			this.values.push(temp[i]);
		}
	}
	return this.values;
}

// returns array of floats corresponding to "keyTimes" attribute
//		if no "keyTimes" attribute exists, creates it according to the number of values
SVGAnimationElement.prototype.getTimes = function() {
	this.times = [];
	
	var temp = this.getAttribute('keyTimes');
	if(temp == null) {
		this.getValues();
		var c = 1 / (this.values.length - 1);
		for(var i = 0; i < this.values.length; i++) {
			this.times.push(i*c);
		}
	} else {
		temp = temp.split(';');
		for(var i = 0; i < temp.length; i++) {
			this.times.push(parseFloat(temp[i]));
		}
	}
	
	return this.times;
}

// returns null if "calcMode" is not "spline"
// returns array of spline objects ("keySplines" attribute)
//		if no "keySpline" attribute exists, creates it according to the number of values; new splines have linear (0 0 1 1) progression
SVGAnimationElement.prototype.getSplines = function() {
	this.calcMode = this.getAttribute('calcMode');
	if(this.calcMode != 'spline') { return null; }
	this.splines = [];
	
	var temp = this.getAttribute('keySplines');
	if(temp == null) {
		this.getTimes();
		for(var i = 0; i < this.times.length-1; i++) {
			this.splines.push(new spline(null));
		}
	} else {
		temp = temp.split(';');
		for(var i = 0; i < temp.length; i++) {
			var newSpline = new spline(temp[i]);
			this.splines.push(newSpline);
		}
	}
	return this.splines;
}

// sets keyTime at given index
// throws DOMException if index is out of bounds
SVGAnimationElement.prototype.setTime = function(index, value, makeHistory) {
	this.getTimes();
	if(index < 0 || index >= this.times.length) { throw new DOMException(1); }
	
	if(value < 0 || value > 1) { throw new Error('Value out of bounds'); }
	if(index == 0 && value != 0) { throw new Error('Value out of bounds'); }
	if(index == this.times.length-1 && value != 1) { throw new Error('Value out of bounds'); }
	if(index > 0 && index-1 < this.times.length && (this.times[index-1] > value || this.times[index+1] < value)) { throw new Error('Value out of bounds'); }
	
	if(Math.abs(this.times[index]-value) < 0.00001) { return; }
	
	if(makeHistory && svg && svg.history) {
		svg.history.add(new historyGeneric(this.id, 
			'target.setTime('+index+', '+this.times[index]+');',
			'target.setTime('+index+', '+value+');', true));
	}
	
	this.times[index] = value;
	this.setAttribute('keyTimes', this.times.join(';'));
}

// commits values into element
SVGAnimationElement.prototype.commitValues = function(fromAttribute) {
	if(fromAttribute) { return; }
	this.setAttribute('values', this.values.join(';'));
}

// commits times into element
SVGAnimationElement.prototype.commitTimes = function(fromAttribute) {
	if(fromAttribute) { return; }
	this.setAttribute('keyTimes', this.times.join(';'));
}

// commits splines into element
SVGAnimationElement.prototype.commitSplines = function(fromAttribute) {
	if(fromAttribute) { return; }
	this.setAttribute('keySplines', this.splines.join(';'));
}

SVGAnimationElement.prototype.commitAll = function(fromAttribute) {
	this.commitTimes(fromAttribute);
	this.commitSplines(fromAttribute);
	this.commitValues(fromAttribute);
}

// makes history (separated to allow inheritance by animationGroup)
// times, values, splines are NEW attributes to be added - old ones have to still be in the element itself
SVGAnimationElement.prototype.makeHistory = function(times, values, splines) {
	if(!svg || !svg.history || !(times || values || splines)) { return; }
	
	var arrFrom = {};
	var arrTo = {};
	
	if(times) {
		arrFrom['keyTimes'] = this.getAttribute('keyTimes');
		arrTo['keyTimes'] = this.times.join(';');
	}
	if(values) {
		arrFrom['values'] = this.getAttribute('values');
		arrTo['values'] = this.values.join(';');
	}
	if(splines) {
		arrFrom['keySplines'] = this.getAttribute('keySplines');
		arrTo['keySplines'] = this.splines.join(';');
	}
	
	svg.history.add(new historyAttribute(this.id, arrFrom, arrTo, true));
}

SVGAnimationElement.prototype.getSpline = function(index) {
	this.getSplines();
	if(index < 0 || index >= this.splines.length) { throw new DOMException(1); }
	return this.splines[index].toString();
}

// sets value at given index
// throws DOMException if index is out of bounds
SVGAnimationElement.prototype.setValue = function(index, value, makeHistory) {
	this.getValues();
	if(index < 0 || index >= this.values.length) { throw new DOMException(1); }
	
	this.values[index] = value;
	if(makeHistory) { this.makeHistory(false, true, false); }
	this.commitValues();
}

SVGAnimationElement.prototype.getValue = function(index) {
	this.getValues();
	if(index < 0 || index >= this.values.length) { throw new DOMException(1); }
	return this.values[index];
}

// sets spline at given index
// throws DOMException if index is out of bounds
SVGAnimationElement.prototype.setSpline = function(index, value, makeHistory) {
	this.getSplines();
	if(!(value instanceof spline)) { return; }
	if(index < 0 || index >= this.splines.length) { throw new DOMException(1); }
	this.splines[index] = value;
	if(makeHistory) { this.makeHistory(false, false, true); }
	this.commitSplines();
}

// sets spline at given index to specific spline type (see spline object)
// throws DOMException if index is out of bounds
SVGAnimationElement.prototype.setSplineType = function(index, value, makeHistory) {
	var newSpline = new spline(value);
	if(!newSpline) { return; }
	if(index < 0 || index >= this.splines.length) { throw new DOMException(1); }
	this.setSpline(index, newSpline, makeHistory);
}

SVGAnimationElement.prototype.setSplineData = function(index, data, makeHistory) {
	var newSpline = new spline(data);
	this.setSpline(index, newSpline, makeHistory);
}

// returns the begin time of current loop
//		if animation is no longer running, returns last viable loop begin time
//		if animation is not yet running, returns null
SVGAnimationElement.prototype.getCurrentLoopBeginTime = function() {
	var time = this.getCurrentTime();
	
	var targetTime = null;
	
	this.getDur();
	this.getBeginList();
	var repeatCount = this.getRepeatCount();
	
	for(var i = 0; i < this.beginList.length; i++) {
		if(this.beginList[i].special) { continue; }
		if(time < this.beginList[i].value) { continue; }
		if(targetTime == null || targetTime < this.beginList[i].value) { targetTime = this.beginList[i].value; }
	}
	// targetTime is now last begin
	
	var loopNumber = Math.floor((time-targetTime)/this.dur.value);
	if(repeatCount != 'indefinite' && repeatCount < loopNumber) { loopNumber = repeatCount; }
	targetTime = targetTime + (loopNumber*this.dur.value);
	return targetTime;
}

// returns the number of current loop; 0 for first loop, null if animation is not running
SVGAnimationElement.prototype.getCurrentLoop = function() {
	var time = this.getCurrentTime();
	
	var targetTime = null;
	
	this.getDur();
	this.getBeginList();
	var repeatCount = this.getRepeatCount();
	
	for(var i = 0; i < this.beginList.length; i++) {
		if(this.beginList[i].special) { continue; }
		if(time < this.beginList[i].value) { continue; }
		if(targetTime == null || targetTime < this.beginList[i].value) { targetTime = this.beginList[i].value; }
	}
	// targetTime is now last begin
	
	if(targetTime == null) { return null; }
	
	var loopNumber = Math.floor((time-targetTime)/this.dur.value);
	return loopNumber;
}

// returns current progress of animation as <0;1> value;
//		this includes multiple begin values and, repetition
SVGAnimationElement.prototype.getCurrentProgress = function(time) {
	var time = time || this.getCurrentTime();
	
	this.getDur();
	this.getBeginList();
	this.getTimes();

	var repeatCount = this.getRepeatCount();
	var progress = null;
	var currentBeginTime = this.getCurrentLoopBeginTime();
	if(currentBeginTime == null) { return null; }
	
	var progress = (time-currentBeginTime)/this.dur.value;
	if(progress > 1) { return 1; }
	return progress;
}

// returns index of previous keyTime, or null if animation is not running
SVGAnimationElement.prototype.getPreviousFrame = function() {
	var progress = this.getCurrentProgress();
	if(progress == null) { return null; }
	
	var last = null;
	for(var i = 0; i < this.times.length; i++) {
		if((this.times[i]-progress) < -0.0001) { last = i; } else { break; }
	}
	return last;
}

// returns absolute time of the previous keyFrame (factoring in begin times, duration, and repeatCount)
SVGAnimationElement.prototype.getPreviousTime = function() {
	var previousFrame = this.getPreviousFrame();
	
	var currentLoop = this.getCurrentLoop();
	var currentBegin = this.getCurrentLoopBeginTime();
	
	if(previousFrame == null) {
		if(currentLoop == 0 || this.times.length <= 1) { return null; } else {
			currentBegin -= this.dur.value;
			previousFrame = this.times.length-2;
		}
	}
	
	return currentBegin + this.times[previousFrame]*this.dur.value;
}

// returns index of next keyTime, or null if no future time exists
SVGAnimationElement.prototype.getNextFrame = function() {
	var progress = this.getCurrentProgress();
	if(progress == null) { return null; }
	
	var next = null;
	for(var i = this.times.length-1; i >= 0; i--) {
		if((this.times[i]-progress) > 0.0001) { next = i; } else { break; }
	}
	return next;
}

// returns absolute time of the previous keyFrame (factoring in begin times, duration, and repeatCount)
SVGAnimationElement.prototype.getNextTime = function() {
	var nextFrame = this.getNextFrame();
	if(nextFrame == null) { return null; }
	
	var currentBegin = this.getCurrentLoopBeginTime();
	return currentBegin + this.times[nextFrame]*this.dur.value;
}

// returns index of closest keyTime
SVGAnimationElement.prototype.getClosestFrame = function() {
	var progress = this.getCurrentProgress();
	if(progress == null) { return null; }
	
	var previous = this.getPreviousFrame();
	var next = this.getNextFrame();
	
	if(previous == null) { return next; }
	if(next == null) { return previous; }
	if(Math.abs(progress - this.times(previous)) < Math.abs(progress - this.times(next))) {
		return previous;
	} else {
		return next;
	}
}

// moves value and (if applicable) its spline to given targetIndex
SVGAnimationElement.prototype.moveValue = function(movedIndex, targetIndex, makeHistory) {
	this.getSplines();
	this.getValues();
	
	if(targetIndex == movedIndex || targetIndex > this.values.length || movedIndex < 0 || targetIndex < 0 || movedIndex >= this.values.length || targetIndex >= this.values.length)  { return; }
	
	var movedValue = this.values.splice(movedIndex, 1);
	this.values.splice(targetIndex, 0, movedValue[0]);
	
	if(this.splines && movedIndex != 0 && targetIndex != 0) {
		var movedSpline = this.splines.splice(movedIndex-1, 1);
		this.splines.splice(targetIndex-1, 0, movedSpline[0]);
	}
	
	if(makeHistory) { this.makeHistory(false, true, (this.splines ? true : false)); }
	if(this.splines) { this.commitSplines(); }
	this.commitValues();
}

// duplicates value (and if applicable, its spline) at given index
// throws DOMException if index is out of bounds
SVGAnimationElement.prototype.duplicateValue = function(index, makeHistory) {
	this.getSplines();
	this.getValues();
	this.getTimes();
	
	if(isNaN(index) || index < 0 || index >= this.values.length) { throw new DOMException(1); }
	
	this.values.splice(index, 0, this.values[index]);
	
	this.times.splice(index, 0, this.times[index]);
	
	if(this.splines) {
		if(index == 0) { index++; }
		this.splines.splice(index-1, 0, this.splines[index-1].clone());
	}
	
	if(makeHistory) { this.makeHistory(true, true, (this.splines ? true : false)); }
	if(this.splines) { this.commitSplines(); }
	this.commitTimes();
	this.commitValues();
}

// removes value (and if applicable, its spline) at given index
// throws DOMException if index is out of bounds
SVGAnimationElement.prototype.removeValue = function(index, makeHistory) {
	this.getSplines();
	this.getValues();
	this.getTimes();
	
	if(isNaN(index) || index < 0 || index >= this.values.length) { throw new DOMException(1); }
	
	this.values.splice(index, 1);
	
	this.times.splice(index, 1);
	this.times[0] = 0;
	this.times[this.times.length-1] = 1;
	
	if(this.splines) {
		if(index == 0) { index++; }
		this.splines.splice(index-1, 1);
	}
	
	if(makeHistory) { this.makeHistory(true, true, (this.splines ? true : false)); }
	if(this.splines) { this.commitSplines(); }
	this.commitTimes();
	this.commitValues();
}

// inserts a value to the given index
SVGAnimationElement.prototype.insertValue = function(index, time, value, splineData, makeHistory) {
	this.values.splice(index, 0, value);
	this.times.splice(index, 0, time);
	
	if(this.splines) {
		if(!splineData) { splineData = "0 0 1 1"; }
		newSpline = new spline(splineData)
		if(index == 0) { index++; }
		this.splines.splice(index-1, 0, newSpline);
	}
	
	if(makeHistory) { this.makeHistory(true, true, (this.splines ? true : false)); }
	if(this.splines) { this.commitSplines(); }
	this.commitTimes();
	this.commitValues();
}

// returns true if values of animation can be inverted (e.g. visibility; "visible" <-> "hidden")
// this should be overriden by SVGAnimateTransform and SVGAnimateMotion implementations
SVGAnimationElement.prototype.isInvertible = function() {
	var attr = this.getAttribute('attributeName');
	if(attr == 'display' || attr == 'visibility') {
		return true;
	} else {
		return false;
	}
}

// inverts all values (if .isInvertible() is true)
// this should be overriden by SVGAnimateTransform and SVGAnimateMotion implementations
SVGAnimationElement.prototype.invertValues = function(index, makeHistory) {
	if(!this.isInvertible()) { return false; }
	this.getValues();
	var attr = this.getAttribute('attributeName');
	
	if(index != null) {
		if(attr == 'display') {
			this.values[index] = this.values[index] == 'none' ? 'inline' : 'none';
		} else if(attr == 'visibility') {
			this.values[index] = this.values[index]== 'hidden' ? 'visible' : 'hidden';
		}
	} else {
		for(var i = 0; i < this.values.length; i++) {
			if(attr == 'display') {
				this.values[i] = this.values[i] == 'none' ? 'inline' : 'none';
			} else if(attr == 'visibility') {
				this.values[i] = this.values[i]== 'hidden' ? 'visible' : 'hidden';
			}
		}
	}
	
	
	if(makeHistory) { this.makeHistory(false, true, false); }
	this.commitValues();
}
	
// balances keyTime values between given indexes so that they are evenly spaced
SVGAnimationElement.prototype.balanceFrames = function(first, last, makeHistory) {
	if(first == null) { first = 0; }
	if(last == null) { last = this.times.length-1; }
	if(last < first) { var temp = last; last = first; first = temp; }
	
	this.getTimes();
	
	if(first == last || first < 0 || first >= this.times.length || last < 0 || last >= this.times.length) { return; }
		
	var delta = (this.times[last] - this.times[first])/(last-first);
	
	var offset = this.times[first];
	for(var i = 1; i+first < last; i++) {
		this.times[i+first] = (offset + i*delta);
	}
	
	
	if(makeHistory) { this.makeHistory(true, false, false); }
	this.commitTimes();
}

// pastes timing attributes from another SVGAnimationElement;
//		- begin
//		- dur
//		- repeatCount
//		- calcMode
//		- keyTimes
//		- keySplines (if applicable)
// trims values if donor has less values than this element
// duplicates last value if donor has more more values than this element
SVGAnimationElement.prototype.pasteTiming = function(donor, makeHistory) {
	if(!(donor instanceof SVGAnimationElement)) { return; }
	
	donor.getSplines();
	donor.getTimes();
	
	this.getTimes();
	
	var oldTimes = this.getAttribute('keyTimes');
	var oldSplines = this.getAttribute('keySplines');
	var oldCalcMode = this.getAttribute('calcMode');
	var oldDur = this.getAttribute('dur');
	var oldRepeatCount = this.getAttribute('repeatCount');
	var oldBegin = this.getAttribute('begin');
	
	while(donor.times.length > this.times.length) {
		this.duplicateValue(this.times.length-1, makeHistory);
	}
	while(donor.times.length < this.times.length) {
		this.removeValue(this.times.length-1, makeHistory);
	}
	
	this.setAttribute('keyTimes', donor.getAttribute('anigen:keytimes') || donor.getAttribute('keyTimes'));
	
	this.setAttribute('calcMode', donor.getAttribute('anigen:calcmode') || donor.getAttribute('calcMode'));
	if(donor.splines) {
		this.setAttribute('keySplines', donor.getAttribute('anigen:keysplines') || donor.getAttribute('keySplines'));
	} else {
		this.splines = null;
		this.removeAttribute('keySplines');
	}
	
	this.setAttribute('dur', donor.getAttribute('anigen:dur') || donor.getAttribute('dur'));
	this.setAttribute('repeatCount', donor.getAttribute('anigen:repeatcount') || donor.getAttribute('repeatCount'));
	this.setAttribute('begin', donor.getAttribute('anigen:begin') || donor.getAttribute('begin'));
	
	if(this.timelineObject) { this.timelineObject.takeValues(); }
	
	var clone = this.cloneNode(true);
	var par = this.parentNode;
	var sibl = this.nextElementSibling;
	
	par.removeChild(this);
	if(sibl) {
		par.insertBefore(clone, sibl);
	} else {
		par.appendChild(clone);
	}
	
	if(makeHistory) {
		var arrFrom = {
			'keyTimes': oldTimes,
			'keySplines': oldSplines,
			'calcMode': oldCalcMode,
			'dur': oldDur,
			'repeatCount': oldRepeatCount,
			'begin': oldBegin
		};
		var arrTo = {
			'keyTimes': this.getAttribute('keyTimes'),
			'keySplines': this.getAttribute('keySplines'),
			'calcMode': this.getAttribute('calcMode'),
			'dur': this.getAttribute('dur'),
			'repeatCount': this.getAttribute('repeatCount'),
			'begin': this.getAttribute('begin')
		};
		
		svg.history.add(new historyAttribute(this.id, arrFrom, arrTo, true));
	}
	
	clone.getTimes();
	clone.getValues();
	clone.getSplines();
	
	return clone;
}

// returns current value this animation imposes upon its parent
// 		for all but "d" attribute defaults to parentNode's attribute.animVal
// returns null if no such attribute exist (e.g. CSS attributes)
SVGAnimationElement.prototype.getCurrentValue = function(time) {
	if(this.getAttribute('attributeName') == 'd') {
		var progress = this.getCurrentProgress(time);
		var times = this.getTimes();
		var values = this.getValues();
		
		var timeBefore, timeAfter;
		var before, after;
		
		if(progress == null) {
			return null;
		}
		
		for(var i = 0; i < times.length; i++) {
			if(this.times[i] == progress) {
				timeBefore = progress;
				before = i;
				break;
			} else if(this.times[i] < progress) {
				timeBefore = this.times[i];
				before = i;
			} else if(timeAfter == null) {
				timeAfter = this.times[i];
				after = i;
				break;
			}
		}
		
		if(timeBefore == progress) {
			var temp = document.createElementNS("http://www.w3.org/2000/svg", "path");
				temp.setAttribute('d', values[before]);
			return temp.getPathData().baseVal;
		}
		
		if(after == null) {
			if(this.getAttribute('fill') == 'freeze') {
				var temp = document.createElementNS("http://www.w3.org/2000/svg", "path");
					temp.setAttribute('d', values[before]);
				return temp.getPathData().baseVal;
			} else {
				return null;
			}
			
		}
		
		var ratio = (progress-timeBefore)/(timeAfter-timeBefore);
		
		var pathBefore = document.createElementNS("http://www.w3.org/2000/svg", "path");
		var pathAfter = document.createElementNS("http://www.w3.org/2000/svg", "path");
		
		pathBefore.setAttribute('d', values[before]);
		pathAfter.setAttribute('d', values[after]);
		
		var splines = this.getSplines();
		
		if(splines && splines[before]) {
			ratio = splines[before].getValue(ratio);
		}
		
		return pathBefore.inbetween(pathAfter, ratio);
		
	} else {
		try {
			return this.parentNode[this.getAttribute('attributeName')].animVal.value;
		} catch(e) {
			return null;
		}
	}
}



SVGAnimationElement.prototype.valuesToViewport = function(CTM) { }

SVGAnimationElement.prototype.valuesToUserspace = function(CTM) { }



SVGAnimationElement.prototype.getCenter = function(viewport) {
	if(!this.parentNode) { return null; }
	return this.parentNode.getCenter(viewport);
}

SVGAnimationElement.prototype.getFarCorner = function(reference) {
	return this.getViableParent().getFarCorner(reference);
}

SVGAnimationElement.prototype.setCalcMode = function(value, makeHistory) {
	if(makeHistory && svg && svg.history) {
		svg.history.add(new historyAttribute(this.id, 
			{ 'calcMode': this.getAttribute('calcMode') },
			{ 'calcMode': value },
			true));
	}
	if(value == null) {
		this.removeAttribute('calcMode');
	} else {
		this.setAttribute('calcMode', value);
	}
}
SVGAnimationElement.prototype.setFill = function(value, makeHistory) {
	if(makeHistory && svg && svg.history) {
		svg.history.add(new historyAttribute(this.id, 
			{ 'fill': this.getAttribute('fill') },
			{ 'fill': value },
			true));
	}
	if(value == null) {
		this.removeAttribute('fill');
	} else {
		this.setAttribute('fill', value);
	}
}
SVGAnimationElement.prototype.setAdditive = function(value, makeHistory) {
	if(makeHistory && svg && svg.history) {
		svg.history.add(new historyAttribute(this.id, 
			{ 'additive': this.getAttribute('additive') },
			{ 'additive': value },
			true));
	}
	if(value == null) {
		this.removeAttribute('additive');
	} else {
		this.setAttribute('additive', value);
	}
}
SVGAnimationElement.prototype.setAccumulate = function(value, makeHistory) {
	if(makeHistory && svg && svg.history) {
		svg.history.add(new historyAttribute(this.id, 
			{ 'accumulate': this.getAttribute('accumulate') },
			{ 'accumulate': value },
			true));
	}
	if(value == null) {
		this.removeAttribute('accumulate');
	} else {
		this.setAttribute('accumulate', value);
	}
}

SVGAnimationElement.prototype.getBBox = function() {
	if(this.parentNode && typeof this.parentNode.getBBox === 'function') {
		return this.parentNode.getBBox();
	} else {
		return null;
	}
}

SVGAnimationElement.prototype.getCTM = function() {
	if(this.parentNode && typeof this.parentNode.getCTM === 'function') {
		return this.parentNode.getCTM();
	} else {
		return null;
	}
}



