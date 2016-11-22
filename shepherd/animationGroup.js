/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Builds upon normal SVG group element to provide group animation - quick creation and management of multiple animations between set @animationState objects
 */
function animationGroup(target, numeric, flags, attributes) {
	if(!target || !((target instanceof animationState) || (target instanceof SVGElement))) { return null; }
	
	if(!numeric) {
		numeric = { dur: '10s', begin: '0s', repeatCount: 'indefinite' }
	}
	if(!flags) { flags = {}; }
	if(!numeric.dur) { numeric.dur = '10s'; }
	if(!numeric.begin) { numeric.begin = '0s'; }
	if(!numeric.repeatCount) { numeric.repeatCount = 'indefinite'; }
	if(!flags.additive) { flags.additive = 'replace'; }
	if(!flags.accumulate) { flags.accumulate = 'none'; }
	if(!flags.fill) { flags.fill = 'remove'; }
	if(!flags.calcMode) { flags.calcMode = 'spline'; }
	
	this.type = 7;
	this.calcMode = flags.calcMode;
	this.timelineObject = null;
	
	if(target instanceof animationState) {
		// instancing from animationState object
		this.groupName = target.group;
		this.group = target.groupElement;
		this.element = target.element.cloneNode(true);
		this.element.stripId(true);
		this.element.shepherd = this;
		
		this.link = document.createElementNS(svgNS, 'use');
			this.link.generateId();
			this.link.setAttribute('height', '100%');
			this.link.setAttribute('width', '100%');
			this.link.setAttribute('x', '0');
			this.link.setAttribute('y', '0');
			this.link.setAttribute('xlink:href', '#'+this.group.id);
			this.link.setAttribute('style', 'display:none');
			this.link.appendChild(document.createComment("This exists to prevent inkscape's cleanup from removing the partent from defs."));
			
		
		this.childElements = this.element.getChildren(true);
		this.animations = {}
		
		this.element.insertBefore(this.link, this.element.children[0]);
		
		this.dur = new time(numeric.dur);
		this.beginList = [ new time(numeric.begin+'s') ];
		this.repeatCount = numeric.repeatCount;
		
		this.additive = flags.additive;
		this.accumulate = flags.accumulate;
		this.fill = flags.fill;
		
		this.times = [ 0, 1 ];
		this.splines = [ new spline("0 0 1 1") ];
		this.values = [ (parseInt(target.number) || 0), (parseInt(target.number) || 0) ];
				
		this.element.removeAttribute('anigen:name');
		this.element.removeAttribute('anigen:number');
		this.element.setAttribute('anigen:type', "animationGroup");
		this.element.setAttribute('anigen:keytimes', "0;1");
		this.element.setAttribute('anigen:keysplines', "0 0 1 1");
		this.element.setAttribute('anigen:values', target.number+";"+target.number);
		this.element.setAttribute('anigen:begin', this.beginList.join(';'));
		this.element.setAttribute('anigen:dur', this.dur);
		this.element.setAttribute('anigen:repeatcount', numeric.repeatCount);
		this.element.setAttribute('anigen:calcmode', this.calcMode);
		this.element.setAttribute('anigen:additive', this.additive);
		this.element.setAttribute('anigen:accumulate', this.accumulate);
		this.element.setAttribute('anigen:fill', this.fill);
		this.element.generateId(true);
		
		if(attributes) {
			for(var i = 0; i < attributes.length; i++) {
				this.animate(attributes[i]);
			}
		}
		
	} else {
		// instancing from actual element
		this.element = target;
		this.element.shepherd = this;
		if(this.element.getAttribute('anigen:type') != 'animationGroup') { return; }
		var childrenCandidates = this.element.getChildren(true);
		this.childElements = [];
		this.animations = {};
		
		this.groupName = this.element.getAttribute('anigen:group');
		var found = svg.defs.getElementsByAttribute('anigen:name', this.groupName);
		if(found.length == 0) { return false; }
		this.group = found[0];
		
		for(var i = 0; i < childrenCandidates.length; i++) {
			if(childrenCandidates[i] instanceof SVGUseElement && childrenCandidates[i].getAttribute('xlink:href') == '#'+this.group.id) {
				this.link = childrenCandidates[i];
				continue;
			}
			if(!childrenCandidates[i].isAnimation()) {
				this.childElements.push(childrenCandidates[i])
			} else {
				var attr = childrenCandidates[i].getAttribute('attributeName');
				if(!attr) { continue; }
				if(!this.animations[attr]) { this.animations[attr] = []; }
				this.animations[attr].push(childrenCandidates[i]);
			}
		}
	}
}

animationGroup.prototype = Object.create(SVGAnimationElement.prototype);

animationGroup.prototype.getBeginList = function() {
	this.beginList = [];
	var temp = this.element.getAttribute('anigen:begin').split(';');
	for(var i = 0; i < temp.length; i++) {
		this.beginList.push(new time(temp[i]));
	}
	return this.beginList;
}

animationGroup.prototype.getDur = function() {
	this.dur = new time(this.element.getAttribute('anigen:dur'));
	return this.dur;
}

animationGroup.prototype.getRepeatCount = function() {
	if(this.element.getAttribute('anigen:repeatCount')) {
		if(!this.element.getAttribute('anigen:repeatcount')) {
			this.element.setAttribute('anigen:repeatcount', this.element.getAttribute('anigen:repeatCount'));
		}
		this.element.removeAttribute('anigen:repeatCount');
	}
	this.repeatCount = this.element.getAttribute('anigen:repeatcount');
	if(!isNaN(this.repeatCount)) { this.repeatCount = parseInt(this.repeatCount); }
	return this.repeatCount;
}

animationGroup.prototype.getCalcMode = function() {
	if(this.element.getAttribute('anigen:calcMode')) {
		if(!this.element.getAttribute('anigen:calcmode')) {
			this.element.setAttribute('anigen:calcmode', this.element.getAttribute('anigen:calcMode'));
		}
		this.element.removeAttribute('anigen:calcMode');
	}
	this.calcMode = this.element.getAttribute('anigen:calcmode');
	return this.calcMode;
}

animationGroup.prototype.getFill = function() {
	if(this.getAttribute('anigen:freeze')) {
		if(!this.getAttribute('anigen:fill')) {
			this.setAttribute('anigen:fill', this.getAttribute('anigen:freeze') == 'true' ? 'freeze' : 'remove');
		}
		this.removeAttribute('anigen:freeze');
	}
	this.fill = this.getAttribute('anigen:fill') || 'replace';
	return this.fill;
}

animationGroup.prototype.getAdditive = function() {
	this.additive = this.getAttribute('anigen:additive') || 'replace';
	if(this.additive == 'true') { this.additive = 'sum'; }
	if(this.additive == 'false') { this.additive = 'replace'; }
	this.setAttribute('anigen:additive', this.additive);
	return this.additive;
}

animationGroup.prototype.getAccumulate = function() {
	this.accumulate = this.getAttribute('anigen:accumulate') || 'none';
	if(this.accumulate == 'true') { this.accumulate = 'sum'; }
	if(this.accumulate == 'false') { this.accumulate = 'none'; }
	this.setAttribute('anigen:accumulate', this.accumulate);
	return this.accumulate;
}

animationGroup.prototype.getValues = function() {
	this.values = [];
	var temp = this.element.getAttribute('anigen:values');
	if(!temp) {
		var vFrom = this.getAttribute('anigen:from');
		var vTo = this.getAttribute('anigen:to');
		if(vFrom && vTo) {
			this.values.push(vFrom);
			this.values.push(vTo);
			this.element.setAttribute('anigen:values', this.values.join(';'));
			this.removeAttribute('anigen:from');
			this.removeAttribute('anigen:to');
		}
	} else {
		temp = temp.split(';');
		for(var i = 0; i < temp.length; i++) {
			this.values.push(parseInt(temp[i]));
		}
	}
	return this.values;
}

animationGroup.prototype.getTimes = function() {
	this.times = [];
	
	var temp = this.element.getAttribute('anigen:keytimes');
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

animationGroup.prototype.getSplines = function() {
	this.splines = [];
	
	var temp = this.element.getAttribute('anigen:keysplines');
	if(temp == null) {
		this.getTimes();
		for(var i = 0; i < this.times.length-1; i++) {
			this.splines.push(new spline(null));
		}
	} else {
		temp = temp.split(';');
		for(var i = 0; i < temp.length; i++) {
			this.splines.push(new spline(temp[i]));
		}
	}
	return this.splines;
}

animationGroup.prototype.getIntensity = function() {
	this.intensity = [];
	
	var temp = this.element.getAttribute('anigen:intensity');
	if(temp == null) {
		this.getValues();
		var c = 1 / (this.values.length - 1);
		for(var i = 0; i < this.values.length; i++) {
			this.intensity.push(1);
		}
	} else {
		temp = temp.split(';');
		for(var i = 0; i < temp.length; i++) {
			this.intensity.push(parseFloat(temp[i]));
		}
	}
	
	return this.intensity;
}

animationGroup.prototype.animate = function(attribute) {
	if(this.animations[attribute] != null) { return; }
	
	this.animations[attribute] = [];
	
	for(var i = 0; i < this.childElements.length; i++) {
		var isCSS = false;
		var val = this.childElements[i].getAttribute(attribute);
		if(!val) {
			val = this.childElements[i].style[attribute] || window.getComputedStyle(this.childElements[i])[attribute];
			isCSS = true;
		}
		if(!val) { continue; }
		var anim = document.createElementNS(svgNS, 'animate');
		anim.setAttribute('attributeType', isCSS ? "CSS" : "XML");
		anim.setAttribute('attributeName', attribute);
		anim.setAttribute('anigen:childindex', i);
		anim.generateId();
		this.childElements[i].appendChild(anim);
		this.animations[attribute].push(anim);
	}
	
	this.commitAll();
	tree.seed();
	svg.select();
}

animationGroup.prototype.unanimate = function(attribute) {
	if(!this.animations[attribute]) { return; }
	for(var i = 0; i < this.animations[attribute].length; i++) {
		this.animations[attribute][i].parentNode.removeChild(this.animations[attribute][i]);
	}
	delete this.animations[attribute];
	tree.seed();
	svg.select();
}


animationGroup.prototype.commitSplines = function(fromAttribute) {
	var newSplines = fromAttribute ? this.getAttribute('anigen:keysplines') : this.splines.join(';');
	
	for(var i in this.animations) {
		for(var j = 0; j < this.animations[i].length; j++) {
			this.animations[i][j].setAttribute('keySplines', newSplines);
		}
	}
	
	this.element.setAttribute('anigen:keysplines', newSplines);
}

animationGroup.prototype.commitTimes = function(fromAttribute) {
	var newTimes = fromAttribute ? this.getAttribute('anigen:keytimes') : this.times.join(';');
	
	//this.validateTimes();
	
	for(var i in this.animations) {
		for(var j = 0; j < this.animations[i].length; j++) {
			this.animations[i][j].setAttribute('keyTimes', newTimes);
		}
	}
	
	this.element.setAttribute('anigen:keytimes', newTimes);
}

animationGroup.prototype.commitValues = function(fromAttribute, onlyIndex) {
	var newValues = fromAttribute ? this.getAttribute('anigen:values') : this.values.join(';');
	this.getIntensity();
	
	var grp = svg.animationStates[this.groupName];
	if(!grp) { return false;}
	
	this.element.setAttribute('anigen:values', newValues);
	this.getValues();
	
	for(var i in this.animations) {		// for all groups of animations attributes animated
		for(var j = 0; j < this.animations[i].length; j++) { // for each animation itself
			var lastValue = null;
		
			var newValues = this.animations[i][j].getAttribute('values') ? this.animations[i][j].getAttribute('values').split(';') : [];
			
			var childIndex = this.animations[i][j].getAttribute('anigen:childindex');
			if(!childIndex) { continue; }
			childIndex = parseInt(childIndex);
			
			var k = onlyIndex != null ? onlyIndex : 0;
			
			if(onlyIndex != null && onlyIndex > 0) {
				lastValue = newValues[onlyIndex-1];
			}
			
			for(k; k < this.values.length; k++) { // for each keyFrame
				var newValue = grp[this.values[k]].children[childIndex].getAttribute(i) || window.getComputedStyle(grp[this.values[k]].children[childIndex])[i];
				
				if(i != 'd' || this.intensity[k] == 1) {
					newValues[k] = newValue;
					lastValue = newValue;
				} else {
					if(lastValue == null) {
						lastValue = newValue;
						newValues[k] = newValue;
					} else {
						var pathFrom = document.createElementNS(svgNS, 'path');
							pathFrom.setAttribute('d', lastValue);
						var pathTo = document.createElementNS(svgNS, 'path');
							pathTo.setAttribute('d', newValue);
							
						var adjValue = pathFrom.inbetween(pathTo, this.intensity[k]);
							adjValue = adjValue.toString();
						
						lastValue = adjValue;
						newValues[k] = adjValue;
					}
				}
				
				if(onlyIndex != null && this.intensity[k] == 1) { break; }
			}
			
			newValues = newValues.join(';');
			
			this.animations[i][j].setAttribute('values', newValues);
		}
	}
	
	return true;
}

animationGroup.prototype.commitBegins = function(fromAttribute) {
	var newBegin = fromAttribute ? this.element.getAttribute('anigen:begin') : this.beginList.join(';');
	
	for(var i in this.animations) {
		for(var j = 0; j < this.animations[i].length; j++) {
			this.animations[i][j].setAttribute('begin', newBegin);
			var clone = this.animations[i][j].cloneNode(true);
			var par = this.animations[i][j].parentNode;
			par.insertBefore(clone, this.animations[i][j]);
			par.removeChild(this.animations[i][j]);
			this.animations[i][j] = clone;
		}
	}
	
	this.element.setAttribute('anigen:begin', newBegin);
}

animationGroup.prototype.commitRepeatCount = function(fromAttribute) {
	var newRepeatCount = fromAttribute ? this.element.getAttribute('anigen:repeatcount') : this.repeatCount;
	
	for(var i in this.animations) {
		for(var j = 0; j < this.animations[i].length; j++) {
			this.animations[i][j].setAttribute('repeatCount', newRepeatCount);
		}
	}
}

animationGroup.prototype.commitDur = function(fromAttribute) {
	var newDur = fromAttribute ? this.element.getAttribute('anigen:dur') : this.dur;
	
	for(var i in this.animations) {
		for(var j = 0; j < this.animations[i].length; j++) {
			this.animations[i][j].setAttribute('dur', newDur);
		}
	}
}

animationGroup.prototype.commitCalcMode = function(fromAttribute) {
	var newCalcMode = fromAttribute ? this.element.getAttribute('anigen:calcmode') : this.calcMode;
	
	for(var i in this.animations) {
		for(var j = 0; j < this.animations[i].length; j++) {
			this.animations[i][j].setAttribute('calcMode', newCalcMode);
		}
	}
}

animationGroup.prototype.commitFill = function() {
	var newFill = this.element.getAttribute('anigen:fill') || 'replace';
	for(var i in this.animations) {
		for(var j = 0; j < this.animations[i].length; j++) {
			this.animations[i][j].setAttribute('fill', newFill);
		}
	}
}

animationGroup.prototype.commitAdditive = function(fromAttribute) {
	var newAdditive = this.element.getAttribute('anigen:additive') || 'replace';
	for(var i in this.animations) {
		for(var j = 0; j < this.animations[i].length; j++) {
			this.animations[i][j].setAttribute('additive', newAdditive);
		}
	}
}

animationGroup.prototype.commitAccumulate = function(fromAttribute) {
	var newAccumulate = this.element.getAttribute('anigen:accumulate') || 'replace';
	for(var i in this.animations) {
		for(var j = 0; j < this.animations[i].length; j++) {
			this.animations[i][j].setAttribute('accumulate', newAccumulate);
		}
	}
}

animationGroup.prototype.commitIntensity = function(fromAttribute, onlyIndex) {
	var newIntensity = fromAttribute ? this.getAttribute('anigen:intensity') : this.intensity.join(';');
		
	this.element.setAttribute('anigen:intensity', newIntensity);
	this.commitValues(false, onlyIndex);
}


animationGroup.prototype.commitAll = function(fromAttribute) {
	this.commitBegins(fromAttribute);
	this.commitRepeatCount(fromAttribute);
	this.commitDur(fromAttribute);
	
	this.commitCalcMode(fromAttribute);
	this.commitFill(fromAttribute);
	this.commitAdditive(fromAttribute);
	this.commitAccumulate(fromAttribute);
	
	this.commitTimes(fromAttribute);
	this.commitSplines(fromAttribute);
	this.commitValues(fromAttribute);
}

animationGroup.prototype.setTime = function(index, value) {
	if(isNaN(parseFloat(value)) || value < 0 || value > 1) { return false; }
	this.times[index] = parseFloat(value);
	this.commitTimes();
	return true;
}

animationGroup.prototype.setBegin = function(index, value, makeHistory) {
	this.getBeginList();
	
	if(index < 0 || index >= this.beginList.length) { throw new DOMException(1); }
	
	this.beginList[index] = new time(value);
	
	if(makeHistory && svg && svg.history) {
		svg.history.add(new historyAttribute(this.element.id, 
			{ 'anigen:begin': this.getAttribute('anigen:begin') },
			{ 'anigen:begin': this.beginList.join(';') }, true));
	}
	
	this.commitBegins();
	
	tree.seed();
	tree.select(svg.selected);
	return this;
}

animationGroup.prototype.setDur = function(value, makeHistory, keepTimes) {
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
			svg.history.add(new historyAttribute(this.element.id, 
				{ 'anigen:keytimes': this.getAttribute('anigen:keytimes'), 'anigen:dur': this.getAttribute('anigen:dur') },
				{ 'anigen:keytimes': this.times.join(';'), 'anigen:dur': newDur.toString() }, true));
		}
		
		this.dur = newDur;
		this.setAttribute('anigen:dur', this.dur);
		this.commitDur();
		this.commitTimes();
		if(this.timelineObject) {	this.timelineObject.takeValues();	}
	} else {
		if(makeHistory && svg && svg.history) {
			svg.history.add(new historyAttribute(this.element.id, 
				{ 'anigen:dur': this.getAttribute('anigen:dur') },
				{ 'anigen:dur': newDur.toString() }, true));
		}
		
		this.dur = newDur;
		this.element.setAttribute('anigen:dur', this.dur);
		this.commitDur();
	}
}

animationGroup.prototype.setRepeatCount = function(value, makeHistory) {
	if(isNaN(value) && value != 'indefinite') { return; }
	if(value != 'indefinite') { value = parseInt(value); }
	
	if(makeHistory && svg && svg.history) {
		svg.history.add(new historyAttribute(this.element.id, 
			{ 'anigen:repeatcount': this.getAttribute('anigen:repeatcount') },
			{ 'anigen:repeatcount': value }, true));
	}
	
	this.repeatCount = value;
	this.element.setAttribute('anigen:repeatcount', value);
	
	this.commitRepeatCount();
}

animationGroup.prototype.setCalcMode = function(value, makeHistory) {
	if(makeHistory && svg && svg.history) {
		svg.history.add(new historyAttribute(this.element.id, 
			{ 'anigen:calcmode': this.getAttribute('anigen:calcmode') },
			{ 'anigen:calcmode': value }, true));
	}
	
	this.setAttribute('anigen:calcmode', value);
	this.calcMode = value;
	
	this.commitCalcMode();
}
animationGroup.prototype.setFill = function(value, makeHistory) {
	if(makeHistory && svg && svg.history) {
		svg.history.add(new historyAttribute(this.element.id, 
			{ 'anigen:fill': this.getAttribute('anigen:fill') },
			{ 'anigen:fill': value }, true));
	}
	
	this.setAttribute('anigen:fill', value);
	this.fill = value;
	
	this.commitFill();
}
animationGroup.prototype.setAdditive = function(value, makeHistory) {
	if(makeHistory && svg && svg.history) {
		svg.history.add(new historyAttribute(this.element.id, 
			{ 'anigen:additive': this.getAttribute('anigen:additive') },
			{ 'anigen:additive': value }, true));
	}
	
	this.setAttribute('anigen:additive', value);
	this.additive = value;
	
	this.commitAdditive();
}
animationGroup.prototype.setAccumulate = function(value, makeHistory) {
	if(makeHistory && svg && svg.history) {
		svg.history.add(new historyAttribute(this.element.id, 
			{ 'anigen:accumulate': this.getAttribute('anigen:accumulate') },
			{ 'anigen:accumulate': value }, true));
	}
	
	this.setAttribute('anigen:accumulate', value);
	this.accumulate = value;
	
	this.commitAccumulate();
}

animationGroup.prototype.setIntensity = function(index, value, makeHistory) {
	if(isNaN(parseFloat(value))) { return false; }
	
	this.getIntensity();
	
	this.intensity[index] = parseFloat(value);
	
	if(makeHistory && svg && svg.history) {
		svg.history.add(new historyAttribute(this.element.id, 
			{ 'anigen:intensity': this.getAttribute('anigen:intensity') },
			{ 'anigen:calcmode': this.intensity.join(';') }, true));
	}
	
	this.commitIntensity(false, index);
	return true;
}



animationGroup.prototype.createInbetween = function(one, two, newValue, makeHistory) {
	if(two < one) {
		var temp = one;
		one = two;
		two = temp;
	}
	var ratio = 0.5;
	
	this.duplicateValue(one, makeHistory);
	this.getValues();
	this.getSplines();
	
	this.times[one+1] += (this.times[two+1]-this.times[one])*ratio;
	if(this.splines) {
		this.splines[one] = this.splines[one].inbetween(this.splines[two], ratio);
	}
	
	/*
	this.values[one+1] = this.values[one].inbetween(this.values[two+1], ratio);
	*/
	this.values[one+1] = newValue;
	
	if(makeHistory) { this.makeHistory(true, true, (this.splines ? true : false)); }
	if(this.splines) { this.commitSplines(); }
	this.commitTimes();
	this.commitValues();
}


animationGroup.prototype.setAttribute = function(attributeName, attributeValue) {
	this.element.setAttribute(attributeName, attributeValue);
}

animationGroup.prototype.getAttribute = function(attributeName) {
	return this.element.getAttribute(attributeName);
}

animationGroup.prototype.removeAttribute = function(attributeName) {
	return this.element.removeAttribute(attributeName);
}

animationGroup.prototype.getCurrentTime = function() {
	if(svg && svg.svgElement) {
		return svg.svgElement.getCurrentTime();
	}
	return 0;
}

animationGroup.prototype.getCenter = function(viewport) {
	return this.element.getCenter();
}

animationGroup.prototype.pasteTiming = function(donor, makeHistory) {
	if(!(donor instanceof SVGAnimationElement)) { return; }
	
	donor.getSplines();
	donor.getTimes();
	donor.getDur();
	donor.getRepeatCount();
	donor.getBeginList();
	
	var oldTimes = this.getAttribute('anigen:keytimes');
	var oldSplines = this.getAttribute('anigen:keysplines');
	var oldCalcMode = this.getAttribute('anigen:calcmode');
	var oldDur = this.getAttribute('anigen:dur');
	var oldRepeatCount = this.getAttribute('anigen:repeatcount');
	var oldBegin = this.getAttribute('anigen:begin');
	
	this.getTimes();
	
		
	while(donor.times.length > this.times.length) {
		this.duplicateValue(this.times.length-1, makeHistory);
	}
	while(donor.times.length < this.times.length) {
		this.removeValue(this.times.length-1, makeHistory);
	}
	
	this.setAttribute('anigen:keytimes', donor.times.join(';'));
	this.setAttribute('anigen:repeatcount', donor.repeatCount);
	
	this.setAttribute('anigen:calcmode', donor.getAttribute('anigen:calcmode') || donor.getAttribute('calcMode'));
	if(donor.splines) {
		this.setAttribute('anigen:keysplines', donor.splines.join(';'));
	} else {
		this.splines = null;
		this.removeAttribute('anigen:keysplines');
	}
	
	this.setDur(donor.dur, true);
	this.setRepeatCount(donor.dur, true);
	
	this.setAttribute('anigen:begin', donor.beginList.join(';'));
	
	this.getTimes();
	this.getSplines();
	this.getBeginList();
	
	if(this.timelineObject) { this.timelineObject.takeValues(); }
	
	if(makeHistory) {
		var arrFrom = {
			'anigen:keytimes': oldTimes,
			'anigen:keysplines': oldSplines,
			'anigen:calcmode': oldCalcMode,
			'anigen:dur': oldDur,
			'anigen:repeatcount': oldRepeatCount,
			'anigen:begin': oldBegin
		};
		var arrTo = {
			'anigen:keytimes': this.getAttribute('anigen:keytimes'),
			'anigen:keysplines': this.getAttribute('anigen:keysplines'),
			'anigen:calcmode': this.getAttribute('anigen:calcmode'),
			'anigen:dur': this.getAttribute('anigen:dur'),
			'anigen:repeatcount': this.getAttribute('anigen:repeatcount'),
			'anigen:begin': this.getAttribute('anigen:begin')
		};
		
		svg.history.add(new historyAttribute(this.element.id, arrFrom, arrTo, true));
	}
	
	this.commitAll();
	
	return this.element;
}

// makes history (separated to allow inheritance by animationGroup)
// times, values, splines are NEW attributes to be added - old ones have to still be in the element itself
animationGroup.prototype.makeHistory = function(times, values, splines) {
	if(!svg || !svg.history || !(times || values || splines)) { return; }
	
	var arrFrom = {};
	var arrTo = {};
	
	if(times) {
		arrFrom['anigen:keytimes'] = this.getAttribute('anigen:keytimes');
		arrTo['anigen:keytimes'] = this.times.join(';');
	}
	if(values) {
		arrFrom['anigen:values'] = this.getAttribute('anigen:values');
		arrTo['anigen:values'] = this.values.join(';');
	}
	if(splines) {
		arrFrom['anigen:keysplines'] = this.getAttribute('anigen:keysplines');
		arrTo['anigen:keysplines'] = this.splines.join(';');
	}
	
	svg.history.add(new historyAttribute(this.element.id, arrFrom, arrTo, true));
}

animationGroup.prototype.isInvertible = function() {
	return false;
}


