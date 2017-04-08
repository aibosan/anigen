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


SVGAnimationElement.prototype.getKeyframes = function() {
	if(this.keyframes) {
		return this.keyframes;
	}
	
	if(this instanceof animationGroup) {
		var timesArray = this.getAttribute('anigen:keytimes') ? this.getAttribute('anigen:keytimes').split(';') : [];
		var splineArray = this.getAttribute('anigen:keysplines') ? this.getAttribute('anigen:keysplines').split(';') : [];
		var valueArray = this.getAttribute('anigen:values') ? this.getAttribute('anigen:values').split(';') : [];
		var intensityArray = this.getAttribute('anigen:intensity') ? this.getAttribute('anigen:intensity').split(';') : [];
	} else {
		var timesArray = this.getAttribute('keyTimes') ? this.getAttribute('keyTimes').split(';') : [];
		var splineArray = this.getAttribute('keySplines') ? this.getAttribute('keySplines').split(';') : [];
		var valueArray = this.getAttribute('values') ? this.getAttribute('values').split(';') : [];
	}
	
	this.keyframes = new keyframeList();
	
	for(var i = 0; i < timesArray.length; i++) {
		var newValue = valueArray[i];
		if(!isNaN(newValue)) {
			newValue = parseFloat(newValue);
		}
		this.keyframes.push(
			new keyframe(parseFloat(timesArray[i]),
				(splineArray[i-1] ? new spline(splineArray[i-1]) : null),
				newValue,
				(intensityArray && intensityArray[i] != null ? parseFloat(intensityArray[i]) : null)
			)
		);
	}
	return this.keyframes;
}


// returns a parsed list of time objects corresponding to the "begin" attribute values
// copies the same list as element.beginList
SVGAnimationElement.prototype.getBeginList = function() {
	if(this.beginList) { return this.beginList; }
	this.beginList = [];
	if(!this.getAttribute('begin') && !this.getAttribute('anigen:begin')) { return this.beginList; }
	var temp = this instanceof animationGroup ? this.getAttribute('anigen:begin').split(';') : this.getAttribute('begin').split(';');
	for(var i = 0; i < temp.length; i++) {
		this.beginList.push(new time(temp[i]));
	}
	return this.beginList;
}

// sets begin of given index to given time object, and remakes (clones and deletes) the element to stop lingering begins
// throws DOMException if index is out of bounds
// returns new element
SVGAnimationElement.prototype.setBegin = function(index, value) {
	this.getBeginList();
	
	if(index < 0 || index >= this.beginList.length) { throw new DOMException(1); }
	
	this.beginList[index] = new time(value);
}

SVGAnimationElement.prototype.removeBegin = function(index) {
	this.getBeginList();
	
	if(index < 0 || index >= this.beginList.length) { throw new DOMException(1); }
	
	this.beginList.splice(index, 1);
}

SVGAnimationElement.prototype.addBegin = function(timeValue) {
	this.getBeginList();
	
	var newTime = new time(timeValue);
	
	this.beginList.push(newTime);
	this.beginList.sort(function(a,b) { return a.seconds-b.seconds; });
}

SVGAnimationElement.prototype.setBeginList = function(arr) {
	var newList = [];
	for(var i = 0; i < arr.length; i++) {
		if(!(arr[i] instanceof time)) { return false; } 
		newList.push(arr[i].clone());
	}
	this.beginList = newList;
}


// returns dur as time object
// copies the same object as element.dur
SVGAnimationElement.prototype.getDur = function() {
	if(this.dur) { return this.dur; }
	this.dur = this instanceof animationGroup ? new time(this.getAttribute('anigen:dur')) : new time(this.getAttribute('dur'));
	return this.dur;
}

SVGAnimationElement.prototype.setDur = function(value, keepTimes, adjustBegins) {
	this.getDur();
	if(typeof value !== 'object') {
		value = new time(value);
	} else {
		if(!(value instanceof time)) { return; }
		value = value.clone();
	}
	var ratio = this.dur.seconds/value.seconds;
	
	if(keepTimes) {
		this.getKeyframes();
		var lastOne = this.keyframes.getItem(this.keyframes.length-1).time == 1;
		
		for(var i = 0; i < this.keyframes.arr.length; i++) {
			this.keyframes.getItem(i).time *= ratio;
			if(this.keyframes.getItem(i).time > 1) { this.keyframes.getItem(i).time = 1; }
		}
		
		if(lastOne) {
			this.keyframes.getItem(this.keyframes.length-1).time = 1;
		}
	}
	
	if(adjustBegins) {
		this.getBeginList();
		
		for(var i = 0; i < this.beginList.length; i++) {
			this.beginList[i].seconds /= ratio;
			this.beginList[i].value /= ratio;
		}
	}
	
	this.dur = value;
}


// returns repeatCount attribute; integer for numeric value, string for "indefinite"
// copies the same as element.repeatCount
SVGAnimationElement.prototype.getRepeatCount = function() {
	if(this.repeatCount != null) { return this.repeatCount; }
	this.repeatCount = (this instanceof animationGroup ? this.getAttribute('anigen:repeatcount') : this.getAttribute('repeatCount')) || 0;
	if(!isNaN(this.repeatCount)) { this.repeatCount = parseInt(this.repeatCount); }
	return this.repeatCount;
}

SVGAnimationElement.prototype.setRepeatCount = function(value) {
	if(isNaN(value) && value != 'indefinite') { return; }
	if(value != 'indefinite') { value = parseInt(value); }
	
	this.repeatCount = value;
}



SVGAnimationElement.prototype.getCalcMode = function() {
	if(this.calcMode) { return this.calcMode; }
	this.calcMode = this instanceof animationGroup ? this.getAttribute('anigen:calcmode') : this.getAttribute('calcMode');
	return this.calcMode;
}

SVGAnimationElement.prototype.setCalcMode = function(value) {
	this.calcMode = value || 'linear';
}


SVGAnimationElement.prototype.getFill = function() {
	if(this.fill) { return this.fill; }
	this.fill = (this instanceof animationGroup ? this.getAttribute('anigen:fill') : this.getAttribute('fill')) || 'replace';
	return this.fill;
}

SVGAnimationElement.prototype.setFill = function(value) {
	if(typeof value === 'boolean') {
		this.fill = value ? 'freeze' : 'remove';
	} else {
		this.fill = value || 'remove';
	}
}


SVGAnimationElement.prototype.getAdditive = function() {
	if(this.additive) { return this.additive; }
	this.additive = (this instanceof animationGroup ? this.getAttribute('anigen:additive') : this.getAttribute('additive')) || 'replace';
	return this.additive;
}

SVGAnimationElement.prototype.setAdditive = function(value) {
	if(this.getAttribute('attributeName') == 'd') {
		this.getKeyframes();
		
		var originalPath = document.createElementNS(svgNS, 'path');
			originalPath.setAttribute('d', this.parentNode.getPathData().baseVal);
		if(this.getAttribute('additive') == 'replace') {
			// will be sum -> original data has to be subtraced instead of added
			originalPath.negate();
		}
		
		for(var i = 0; i < this.keyframes.length; i++) {
			var path = document.createElementNS(svgNS, 'path');
			path.setAttribute('d', this.keyframes.getItem(i).value);
			path.sum(originalPath);
			this.keyframes.getItem(i).value = path.getAttribute('d');
		}
	}
	
	if(typeof value === 'boolean') {
		this.additive = value ? 'sum' : 'replace';
	} else {
		this.additive = value;
	}
	
}



SVGAnimationElement.prototype.getAccumulate = function() {
	if(this.accumulate) { return this.accumulate; }
	this.accumulate = (this instanceof animationGroup ? this.getAttribute('anigen:accumulate') : this.getAttribute('accumulate')) || 'none';
	return this.accumulate;
}

SVGAnimationElement.prototype.setAccumulate = function(value) {
	if(typeof value === 'boolean') {
		this.accumulate = value ? 'sum' : 'none';
	} else {
		this.accumulate = value;
	}
}



// commits all changes into the element and returns element (for cases of change of begin)
// also makes history
SVGAnimationElement.prototype.commit = function(noHistory) {
	if(noHistory) { this.wipe(); }
	
	this.getKeyframes();
	
	var out = this;
	var count = 0;
	
	var newTimes = this.keyframes.getTimes().join(';');
	var newSplines = this.keyframes.getSplines().join(';');
	var newValues = this.keyframes.getValues().join(';');
	
	var newBegin = this.getBeginList().join(';');
	
	var newDur = this.getDur().toString();
	
	var newRepeatCount = String(this.getRepeatCount());
	var newCalcMode = this.getCalcMode();
	var newFill = this.getFill();
	var newAdditive = this.getAdditive();
	var newAccumulate = this.getAccumulate();
	
	var histFrom = {};
	var histTo = {};
	
	if(newTimes != this.getAttribute('keyTimes') && newTimes.length != 0 && this.getAttribute('keyTimes')) {
		histFrom['keyTimes'] = this.getAttribute('keyTimes');
		histTo['keyTimes'] = newTimes;
		this.setAttribute('keyTimes', newTimes);
		count++;
	}
	if(newSplines != this.getAttribute('keySplines') && newSplines.length != 0 && this.getAttribute('keySplines')) {
		histFrom['keySplines'] = this.getAttribute('keySplines');
		histTo['keySplines'] = newSplines;
		this.setAttribute('keySplines', newSplines);
		count++;
	}
	if(newValues != this.getAttribute('values') && newValues.length != 0 && this.getAttribute('values')) {
		histFrom['values'] = this.getAttribute('values');
		histTo['values'] = newValues;
		this.setAttribute('values', newValues);
		count++;
	}
	
	
	if(newDur != this.getAttribute('dur') && newDur.length != 0 && this.getAttribute('dur')) {
		histFrom['dur'] = this.getAttribute('dur');
		histTo['dur'] = newDur;
		this.setAttribute('dur', newDur);
		count++;
	}
	
	if(newRepeatCount != this.getAttribute('repeatCount') && newRepeatCount.length != 0 && this.getAttribute('repeatCount')) {
		histFrom['repeatCount'] = this.getAttribute('repeatCount');
		histTo['repeatCount'] = newRepeatCount;
		this.setAttribute('repeatCount', newRepeatCount);
		count++;
	}
	if(newCalcMode != this.getAttribute('calcMode') && newCalcMode.length != 0 && this.getAttribute('calcMode')) {
		histFrom['calcMode'] = this.getAttribute('calcMode');
		histTo['calcMode'] = newCalcMode;
		this.setAttribute('calcMode', newCalcMode);
		count++;
	}
	if(newFill != this.getAttribute('fill') && newFill.length != 0 && this.getAttribute('fill')) {
		histFrom['fill'] = this.getAttribute('fill');
		histTo['fill'] = newFill;
		this.setAttribute('fill', newFill);
		count++;
	}
	if(newAdditive != this.getAttribute('additive') && newAdditive.length != 0 && this.getAttribute('additive')) {
		histFrom['additive'] = this.getAttribute('additive');
		histTo['additive'] = newAdditive;
		this.setAttribute('additive', newAdditive);
		count++;
	}
	if(newAccumulate != this.getAttribute('accumulate') && newAccumulate.length != 0 && this.getAttribute('accumulate')) {
		histFrom['accumulate'] = this.getAttribute('accumulate');
		histTo['accumulate'] = newAccumulate;
		this.setAttribute('accumulate', newAccumulate);
		count++;
	}
	
	if(newBegin != this.getAttribute('begin') && newBegin.length != 0 && this.getAttribute('begin')) {
		histFrom['begin'] = this.getAttribute('begin');
		histTo['begin'] = newBegin;
		
		var nex = this.nextElementSibling;
		var par = this.parentNode;
		par.removeChild(this);
		
		this.setAttribute('begin', newBegin);
		out = this.cloneNode(true);
		
		if(nex) {
			par.insertBefore(out, nex);
		} else {
			par.appendChild(out);
		}
		
		window.dispatchEvent(new Event('treeSeed'));
		window.dispatchEvent(new Event('rootSelect'));
		
		count++;
	}
	
	if(!noHistory && svg && svg.history && count > 0) {
		svg.history.add(new historyAttribute(this.id, histFrom, histTo, true));
	}
	
	svg.gotoTime();
	return out;
}

SVGAnimationElement.prototype.wipe = function() {
	this.keyframes = null;
	this.beginList = null;
	this.dur = null;
	this.repeatCount = null;
	this.calcMode = null;
	this.fill = null;
	this.additive = null;
	this.accumulate = null;
	
	this.path = null;
	this.xlink = null;
	this.rotate = null;
	
	this.intensity = null;
}



// sets keyTime at given index
// throws DOMException if index is out of bounds
SVGAnimationElement.prototype.setTime = function(index, value) {
	if(value < 0) { value = 0; }
	if(value > 1) { value = 1; }
	this.getKeyframes();
	try {
		if(this.keyframes.getItem(index).time == value) { return true; }
		this.keyframes.getItem(index).time = value;
	} catch(err) {
		throw err;
	}
}


SVGAnimationElement.prototype.getValue = function(index) {
	this.getKeyframes();
	try {
		return this.keyframes.getItem(index).value;
	} catch(err) {
		throw err;
	}
}

// sets value at given index
// throws DOMException if index is out of bounds
SVGAnimationElement.prototype.setValue = function(index, value, isAbsolute) {
	this.getKeyframes();
	
	if(!isAbsolute && this.getAttribute('attributeName') == 'd' && this.getAttribute('additive') == 'sum') {
		// assumes absolute values -> need to subtract original path data
		var originalPath = document.createElementNS(svgNS, 'path');
			originalPath.setAttribute('d', this.parentNode.getPathData().baseVal);
			originalPath.negate();
		var newPath = document.createElementNS(svgNS, 'path');
			newPath.setAttribute('d', value);
			newPath.sum(originalPath);
			value = newPath.getAttribute('d');
	}
	
	try {
		this.keyframes.getItem(index).value = value;
	} catch(err) {
		throw err;
	}
}


SVGAnimationElement.prototype.getSpline = function(index) {
	this.getSplines();
	if(index < 0 || index >= this.splines.length) { throw new DOMException(1); }
	return this.splines[index].toString();
}

// sets spline at given index
// throws DOMException if index is out of bounds
SVGAnimationElement.prototype.setSpline = function(index, value) {
	if(index == 0) { return; }
	if(typeof value !== 'object') {
		value = new spline(value);
	}
	if(!(value instanceof spline)) {
		return;
	}
	
	this.getKeyframes();
	
	try {
		this.keyframes.getItem(index).spline = new spline(value);
	} catch(err) {
		throw err;
	}
}





SVGAnimationElement.prototype.getProgress = function(time) {
	time = time != null ? time : this.getCurrentTime();
	
	var closestBegin = null;
	var currentLoop = null;
	var currentLoopBeginTime = null;
	var currentProgress = null;
	var running = true;
	
	
	this.getBeginList();
	for(var i = 0; i < this.beginList.length; i++) {
		if(this.beginList[i].special) { continue; }
		if(time >= this.beginList[i].seconds &&
			(closestBegin == null || (closestBegin != null && closestBegin < this.beginList[i].seconds))) {		// OFFER SLACK?
				closestBegin = this.beginList[i].seconds;
		}
	}
	if(closestBegin == null) {		// animation hasn't started yet
		for(var i = 0; i < this.beginList.length; i++) {
			if(this.beginList[i].special) { continue; }
			if(time < this.beginList[i].seconds &&
				(closestBegin == null || (closestBegin != null && closestBegin > this.beginList[i].seconds))) {		// OFFER SLACK?
					closestBegin = this.beginList[i].seconds;
			}
		}
		
		if(closestBegin != null) {
			currentProgress = (time-closestBegin)/this.getDur().seconds;
		}
		
		running = false;
		return {	'begin': closestBegin,
					'loop': currentLoop,
					'loopBeginTime': currentLoopBeginTime,
					'progress': currentProgress,
					'running': running
				};
	}
	
	this.getDur();
	currentLoop = Math.floor((time-closestBegin)/this.dur.seconds);
	currentProgress = (time-currentLoopBeginTime)/this.dur.seconds;
	
	if(currentProgress == 1) {		// exactly at the end of the loop
		currentLoop--;
	}
	
	this.getRepeatCount();
	if(typeof this.repeatCount === 'number' && currentLoop > this.repeatCount) {	// animation has ended already
		currentLoop = this.repeatCount;
		currentLoopBeginTime = closestBegin+currentLoop*this.dur.seconds;
		currentProgress = (time-currentLoopBeginTime)/this.dur.seconds;
		
		running = false;
		
		return {	'begin': closestBegin,
					'loop': currentLoop,
					'loopBeginTime': currentLoopBeginTime,
					'progress': currentProgress,
					'running': running
				};
	}
	
	currentLoopBeginTime = closestBegin+currentLoop*this.dur.seconds;
	currentProgress = (time-currentLoopBeginTime)/this.dur.seconds;
	
	return {	'begin': closestBegin,
				'loop': currentLoop,
				'loopBeginTime': currentLoopBeginTime,
				'progress': currentProgress,
				'running': running
			};
}

SVGAnimationElement.prototype.getClosestFrames = function(inclusive, time) {
	var progress = this.getProgress(time);
	this.getKeyframes();
	
	var next = null;
	var previous = null;
	var closest = null;
	
	var reply = {	'previous': {	'frame': null,
									'index': null },
					'next': 	{	'frame': null,
									'index': null },
					'closest': 	{	'frame': null,
									'index': null },
					'begin': progress.begin,
					'loop': progress.loop,
					'loopBeginTime': progress.loopBeginTime,
					'progress': progress.progress,
					'running': progress.running,
					'undeflow': false,
					'perfect': false
				};
	
	if(!reply.running) {
		if(reply.loopBeginTime == null) {	// didn't start yet
			reply.closest.frame = reply.next.frame = this.keyframes.getItem(0);
			reply.closest.index = reply.next.index = 0;
		} else {	// ended already
			if(reply.progress == 1) {
				reply.closest.index = reply.previous.index = this.keyframes.length-2;
			} else {
				reply.closest.index = reply.previous.index = this.keyframes.length-1;
			}
			reply.closest.frame = reply.previous.frame = this.keyframes.getItem(reply.closest.index);
		}
		return reply;
	}
	
	for(var i = 0; i < this.keyframes.length; i++) {
		if(inclusive) {
			if(reply.next.frame == null && reply.progress <= this.keyframes.getItem(i).time) {
				reply.next.frame = this.keyframes.getItem(i);
				reply.next.index = i;
			}
			if(reply.progress >= this.keyframes.getItem(i).time) {
				reply.previous.frame = this.keyframes.getItem(i);
				reply.previous.index = i;
			}
		} else {
			if(reply.next.frame == null && (reply.progress - this.keyframes.getItem(i).time) < -0.0001) {	// SLACK
				reply.next.frame = this.keyframes.getItem(i);
				reply.next.index = i;
			}
			if((reply.progress - this.keyframes.getItem(i).time) > 0.0001) {	// SLACK
				reply.previous.frame = this.keyframes.getItem(i);
				reply.previous.index = i;
			}
		}
	}
	
	if(!reply.next.frame) { 
		reply.closest.frame = reply.previous.frame;
		reply.closest.index = reply.previous.index;
	}
	
	if(!reply.previous.frame) {
		if(reply.loop > 0) {	// underflow
			reply.underflow = true;
			reply.previous.index = this.keyframes.length-1;
			reply.previous.frame = this.keyframes.getItem(reply.previous.index);
		} else {
			reply.closest.frame = reply.next.frame;
			reply.closest.index = reply.next.index;
		}
	}
	
	if(reply.next.frame && reply.previous.frame) {
		if(Math.abs(reply.next.frame.time-reply.progress) < Math.abs(reply.underflow ? reply.progress : (reply.previous.frame.time-reply.progress))) {
			reply.closest.frame = reply.next.frame;
			reply.closest.index = reply.next.index;
		} else {
			reply.closest.frame = reply.previous.frame;
			reply.closest.index = reply.previous.index;
		}
	}
	
	// SLACK
	if(Math.abs(reply.closest.frame.time-reply.progress) < 0.00001) {
		reply.progress = reply.closest.frame.time;
		reply.perfect = true;
	}
	
	return reply;
}

SVGAnimationElement.prototype.getClosest = function(inclusive, time) {
	var data = this.getClosestFrames(inclusive, time);
	
	var next = null;
	var previous = null;
	var closest = null;
	
	if(!data.running) {
		if(data.loopBeginTime == null) {		// not started yet
			if(data.begin) {
				if(data.next) {	closest = next = data.begin; }
			}
		} else {	// ended already
			if(data.previous.frame) {
				closest = previous = data.loopBeginTime+data.previous.frame.time*this.getDur().seconds;
			}
		}
		data.previous.time = previous;
		data.next.time = next;
		data.closest.time = closest;
		return data;
	}
	
	if(data.loopBeginTime != null) {
		// on underflow, has to offer SLACK, otherwise the first and last keyframes will overlap (and the method defaults to "next")
		if(data.previous.frame) {	previous = data.underflow ? -0.00001+(data.loopBeginTime-this.getDur().seconds)+data.previous.frame.time*this.getDur().seconds : data.loopBeginTime+data.previous.frame.time*this.getDur().seconds; }
		if(data.next.frame) {	next = data.loopBeginTime+data.next.frame.time*this.getDur().seconds; }
		if(data.closest.frame) {	closest = data.closest.index == data.next.index ? next : previous; }
	}
	
	data.previous.time = previous;
	data.next.time = next;
	data.closest.time = closest;
	
	return data;
}


// moves value and (if applicable) its spline to given targetIndex
SVGAnimationElement.prototype.moveValue = function(movedIndex, targetIndex) {
	this.getKeyframes();
	try {
		this.keyframes.switchItems(movedIndex, targetIndex);
	} catch(err) {
		throw err;
	}
}

SVGAnimationElement.prototype.addValue = function(value, time, spline, intensity) {
	this.getKeyframes();
	
	var newKeyframe = new keyframe(time, spline, value, intensity);
	this.keyframes.push(newKeyframe);
	this.keyframes.sort();
}


// duplicates value (and if applicable, its spline) at given index
// throws DOMException if index is out of bounds
SVGAnimationElement.prototype.duplicateValue = function(index) {
	this.getKeyframes();
	try {
		return this.keyframes.duplicate(index);
	} catch(err) {
		throw err;
	}
}

SVGAnimationElement.prototype.inbetween = function(one, two, ratio) {
	this.getKeyframes();
	try {
		return this.keyframes.inbetween(one, two, ratio);
	} catch(err) {
		throw err;
	}
}

// removes value (and if applicable, its spline) at given index
// throws DOMException if index is out of bounds
SVGAnimationElement.prototype.removeValue = function(index, makeHistory) {
	this.getKeyframes();
	try {
		this.keyframes.remove(index);
	} catch(err) {
		throw err;
	}
}

// returns true if values of animation can be inverted (e.g. visibility; "visible" <-> "hidden")
// this should be overriden by SVGAnimateTransform and SVGAnimateMotion implementations
SVGAnimationElement.prototype.isInvertible = function() {
	if(this.getAttribute('attributeName') == 'display' || this.getAttribute('attributeName') == 'visibility') { return true; }
	
	this.getKeyframes();
	try {
		return this.keyframes.getItem(0).isInvertible();
	} catch(err) {
		return false;
	}
}

SVGAnimationElement.prototype.isScalable = function() {
	if(this.getAttribute('attributeName') == 'display' || this.getAttribute('attributeName') == 'visibility') { return true; }
	
	this.getKeyframes();
	try {
		return this.keyframes.getItem(0).isScalable();
	} catch(err) {
		return false;
	}
}

// inverts all values (if .isInvertible() is true)
// this should be overriden by SVGAnimateTransform and SVGAnimateMotion implementations
SVGAnimationElement.prototype.invertValues = function(index) {
	this.getKeyframes();
	try { 
		return this.keyframes.invertValues(index);
	} catch(err) {
		throw err;
	}
}

SVGAnimationElement.prototype.scaleValues = function(index, factor) {
	this.getKeyframes();
	try { 
		return this.keyframes.scaleValues(index, factor);
	} catch(err) {
		throw err;
	}
}
	
// balances keyTime values between given indexes so that they are evenly spaced
SVGAnimationElement.prototype.balanceFrames = function(first, last) {
	this.getKeyframes();
	try { 
		return this.keyframes.balance(first, last);
	} catch(err) {
		throw err;
	}
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
SVGAnimationElement.prototype.pasteTiming = function(donor) {
	if(!(donor instanceof SVGAnimationElement)) { return; }
	
	this.getKeyframes();
	donor.getKeyframes();
	
	try { 
		this.keyframes.pasteTimes(donor.keyframes);
	} catch(err) {
		throw err;
	}
	
	this.setCalcMode(donor.getCalcMode());
	this.setDur(donor.getDur());
	this.setRepeatCount(donor.getRepeatCount());
	this.setBeginList(donor.getBeginList());
//	this.setAccumulate(donor.getAccumulate());
//	this.setAdditive(donor.getAdditive());
	this.setFill(donor.getFill());
	
//	return this.commit();
}

// returns current value this animation imposes upon its parent
// 		for all but "d" attribute defaults to parentNode's attribute.animVal
// returns null if no such attribute exist (e.g. CSS attributes)
SVGAnimationElement.prototype.getCurrentValue = function(time) {
	if(this.getAttribute('attributeName') == 'd') {
		var closest = this.getClosest(true, time);
		
		if(!closest.running || !closest.next.frame) {
			var temp = document.createElementNS("http://www.w3.org/2000/svg", "path");
			if(!closest.previous.frame || this.getAttribute('fill') != 'freeze') {		// hasn't started or ended with fill=remove
				temp.setAttribute('d', this.parentNode.getAttribute('d'));
				return temp.getPathData().baseVal;
			} else {	// ended with fill=freeze
				temp.setAttribute('d', this.keyframes.getItem(this.keyframes.length-1).value);
				return temp.getPathData().baseVal;
			}
		}
		
		if(closest.closest.frame.time == closest.progress || closest.perfect) {
			var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
				path.setAttribute('d', closest.closest.frame.value);
			return path.getPathData().baseVal;
		}
		
		if(this.getAttribute('calcMode') == 'discrete') {
			var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
				path.setAttribute('d', closest.previous.frame.value);
			return path.getPathData().baseVal;
		}
		
		var ratio = (closest.progress-closest.previous.frame.time)/(closest.next.frame.time-closest.previous.frame.time);
		
		var pathBefore = document.createElementNS("http://www.w3.org/2000/svg", "path");
		var pathAfter = document.createElementNS("http://www.w3.org/2000/svg", "path");
		
		pathBefore.setAttribute('d', closest.previous.frame.value);
		pathAfter.setAttribute('d', closest.next.frame.value);
		
		if(closest.next.frame.spline) {
			ratio = closest.next.frame.spline.getValue(ratio);
		}
		
		return pathBefore.inbetween(pathAfter, ratio);
		
	} else {
		if(this.parentNode[this.getAttribute('attributeName')] && this.parentNode[this.getAttribute('attributeName')].animVal && this.parentNode[this.getAttribute('attributeName')].animVal.value) {
			return this.parentNode[this.getAttribute('attributeName')].animVal.value;
		}
		if(this.parentNode[this.getAttribute('attributeName')] && this.parentNode[this.getAttribute('attributeName')].animVal && this.parentNode[this.getAttribute('attributeName')].animVal.toString()) {
			return this.parentNode[this.getAttribute('attributeName')].animVal.toString();
		}
		if(this.parentNode.getAttribute(this.getAttribute('attributeName'))) {
			return this.parentNode.getAttribute(this.getAttribute('attributeName'));
		}
		return null;
	}
}




SVGAnimationElement.prototype.stretchTo = function(time, override) {
	time = time != null ? time : this.getCurrentTime();
	
	var closest = this.getClosest(true);
	
	if(closest.progress >= 0 && closest.progress <= 1) { return; }	// no stretching needed
	
	if(!override && (this.getRepeatCount() != 0 || this.getBeginList.length > 1)) { return; }		// can't stretch, would break loops
	
	if(closest.progress < 0) {
		var stretchBy = closest.progress*this.getDur().seconds;
		var moveBy = (-1*closest.progress*this.getDur().seconds)/(this.getDur().seconds-stretchBy);
		
		this.setDur(this.getDur().seconds-stretchBy, true);
		this.setBegin(0, time);
		
		for(var i = 0; i < this.keyframes.length; i++) {
			this.keyframes.getItem(i).time += moveBy;
		}
		
		this.setTime(this.keyframes.length-1, 1);
		var newValue = this.duplicateValue(0);
		newValue.time = 0;
	}
	if(closest.progress > 1) {
		var stretchBy = (closest.progress)*this.getDur().seconds;
		var moveBy = (-1*closest.progress*this.getDur().seconds)/(this.getDur().seconds-stretchBy);
		
		this.setDur(stretchBy, true);
		this.duplicateValue(this.keyframes.length-1);
		this.setTime(this.keyframes.length-1, 1);
		newValue = this.keyframes.getItem(this.keyframes.length-1, 1);
	}
	return newValue;
}




SVGAnimationElement.prototype.valuesToViewport = function(CTM) { }

SVGAnimationElement.prototype.valuesToUserspace = function(CTM) { }



SVGAnimationElement.prototype.getCenter = function(viewport) {
	if(!this.parentNode || typeof this.parentNode.getCenter !== 'function') { return null; }
	return this.parentNode.getCenter(viewport);
}

SVGAnimationElement.prototype.getFarCorner = function(reference) {
	if(!this.getViableParent()) { return {'x':0,'y':0}; }
	return this.getViableParent().getFarCorner(reference);
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




