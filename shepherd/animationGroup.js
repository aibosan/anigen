/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Builds upon normal SVG group element to provide group animation - quick creation and management of multiple animations between set @animationState objects
 */
function animationGroup(target, numeric, flags, attributes) {
	if(!target || !((target instanceof animationState) || (target instanceof SVGElement))) { return null; }
	
	if(!numeric) {
		numeric = { 'dur': '10s', 'begin': '0s', 'repeatCount': 'indefinite' }
	}
	if(!flags) { flags = {}; }
	if(!numeric.dur) { numeric.dur = '10s'; }
	if(!numeric.begin) { numeric.begin = '0s'; }
	if(!numeric.repeatCount) { numeric.repeatCount = 'indefinite'; }
	if(!flags.calcMode) { flags.calcMode = 'spline'; }
	
	this.type = 7;
	this.timelineObject = null;
	
	if(target instanceof animationState) {
		// instancing from animationState object
		this.groupName = target.group;
		this.group = target.groupElement;
		this.element = target.element.cloneNode(true);
		this.element.stripId(true);
		this.element.shepherd = this;
		
		this.link = document.createElementNS(svgNS, 'use');
			this.link.setAttribute('anigen:lock', 'skip');
			this.link.generateId();
			this.link.setAttribute('height', '100%');
			this.link.setAttribute('width', '100%');
			this.link.setAttribute('x', '0');
			this.link.setAttribute('y', '0');
			this.link.setAttribute('xlink:href', '#'+this.group.id);
			this.link.setAttribute('style', 'display:none');
			// comments kinda break inkscape
			//this.link.appendChild(document.createComment("This exists to prevent inkscape's cleanup from removing the partent from defs."));
			
		
		this.childElements = this.element.getChildren(true);
		this.animations = {};
		
		this.element.insertBefore(this.link, this.element.children[0]);
		
		this.dur = new time(numeric.dur);
		this.beginList = [ new time(numeric.begin+'s') ];
		this.repeatCount = numeric.repeatCount;
		
		this.additive = flags.additive;
		this.accumulate = flags.accumulate;
		this.fill = flags.fill;
		this.calcMode = flags.calcMode;
		
		this.times = [ 0, 1 ];
		this.splines = [ new spline("0 0 1 1") ];
		this.values = [ (parseInt(target.number) || 0), (parseInt(target.number) || 0) ];
				
		this.element.removeAttribute('anigen:name');
		this.element.removeAttribute('anigen:number');
		this.element.setAttribute('anigen:type', "animationGroup");
		this.element.setAttribute('anigen:keytimes', numeric.keytimes || "0;1");
		this.element.setAttribute('anigen:keysplines', numeric.keysplines || "0 0 1 1");
		this.element.setAttribute('anigen:values', numeric.values || (target.number+";"+target.number));
		this.element.setAttribute('anigen:intensity', numeric.intensity || "1;1");
		this.element.setAttribute('anigen:begin', this.beginList.join(';'));
		this.element.setAttribute('anigen:dur', this.dur);
		this.element.setAttribute('anigen:repeatcount', numeric.repeatCount);
		this.element.setAttribute('anigen:calcmode', this.calcMode);
		this.element.setAttribute('anigen:additive', this.additive ? 'sum' : 'replace');
		this.element.setAttribute('anigen:accumulate', this.accumulate ? 'sum' : 'none');
		this.element.setAttribute('anigen:fill', this.fill ? 'freeze' : 'replace');
		this.element.generateId(true);
		
		if(attributes) {
			for(var i = 0; i < attributes.length; i++) {
				this.animate(attributes[i], true);
			}
			this.commit(true);
		}
		
	} else {
		// instancing from existing element
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
				this.link.setAttribute('anigen:lock', 'skip');
				continue;
			}
			if(!childrenCandidates[i].isAnimation()) {
				this.childElements.push(childrenCandidates[i])
			} else {
				if(childrenCandidates[i] instanceof SVGAnimateElement &&
					childrenCandidates[i].getAttribute('anigen:childindex')) {
					var attr = childrenCandidates[i].getAttribute('attributeName');
					if(!attr) { continue; }
					if(!this.animations[attr]) { this.animations[attr] = []; }
					this.animations[attr].push(childrenCandidates[i]);
					childrenCandidates[i].setAttribute('anigen:lock', 'skip');
				}
			}
		}
		try {
			window.dispatchEvent(new Event("treeSeed"));
		} catch(e) { }
	}
}

animationGroup.prototype = Object.create(SVGAnimationElement.prototype);

animationGroup.prototype.setIntensity = function(index, value) {
	if(isNaN(parseFloat(value))) { return false; }
	this.getKeyframes();
	try {
		this.keyframes.getItem(index).intensity = parseFloat(value);
	} catch(err) {
		throw err;
	}
}


animationGroup.prototype.animate = function(attribute, noCommit) {
	if(this.animations[attribute] != null) { return; }
	
	this.animations[attribute] = [];
	
	for(var i = 0; i < this.childElements.length; i++) {
		var isCSS = false;
		var val = this.childElements[i].getAttribute(attribute);
		if(!val) {
			val = this.childElements[i].style.hasNativeProperty(attribute) ? (this.childElements[i].style[attribute] || window.getComputedStyle(this.childElements[i])[attribute]) : null;
			isCSS = true;
		}
		
		if(!val) { continue; }
		var anim = document.createElementNS(svgNS, 'animate');
		anim.setAttribute('attributeType', isCSS ? "CSS" : "XML");
		anim.setAttribute('attributeName', attribute);
		anim.setAttribute('anigen:childindex', i);
		anim.setAttribute('anigen:lock', 'skip');
		anim.generateId();
		this.childElements[i].appendChild(anim);
		this.animations[attribute].push(anim);
	}
	
	if(!noCommit) {
		this.commit(true);
	}
}

animationGroup.prototype.unanimate = function(attribute) {
	if(!this.animations[attribute]) { return; }
	for(var i = 0; i < this.animations[attribute].length; i++) {
		this.animations[attribute][i].parentNode.removeChild(this.animations[attribute][i]);
	}
	delete this.animations[attribute];
	
	window.dispatchEvent(new Event("treeSeed"));
	svg.select();
}


animationGroup.prototype.check = function() {
	if(svg.animationStates[this.groupName] && svg.animationStates[this.groupName][0]) {
		var thisStructure = this.element.getStructure(
			function(target) { if(target instanceof SVGAnimateElement || target.getAttribute('anigen:insensitive')) { return false; } return true; }
		).join('');
		var thatStructure = svg.animationStates[this.groupName][0].element.getStructure(
			function(target) { if(target instanceof SVGAnimateElement || target.getAttribute('anigen:insensitive')) { return false; } return true; }
		).join('');
		return (thisStructure == thatStructure);
	}
	return false;
}

animationGroup.prototype.rebuild = function(noHistory) {
	if(!svg.animationStates[this.groupName] || !svg.animationStates[this.groupName][0]) { return; }
	
	var attrs = [];
	for(var i in this.animations) {
		attrs.push(i);
	}
	
	var pretender = new animationGroup(svg.animationStates[this.groupName][0], 
		{ 	'dur': this.element.getAttribute('anigen:dur'),
			'begin': this.element.getAttribute('anigen:begin'),
			'repeatCount': this.element.getAttribute('anigen:repeatcount'),
			'values': this.element.getAttribute('anigen:values'),
			'intensity': this.element.getAttribute('anigen:intensity'),
			'keysplines': this.element.getAttribute('anigen:keysplines'),
			'keytimes': this.element.getAttribute('anigen:keytimes')
		}, {
			'additive': this.element.getAttribute('anigen:additive') == 'sum',
			'accumulate': this.element.getAttribute('anigen:accumulate') == 'sum',
			'fill': this.element.getAttribute('anigen:fill') == 'freeze',
			'calcMode': this.element.getAttribute('anigen:calcmode')
		}, attrs
	);
	
	if(!pretender) { return; }
	
	for(var i in this.animations) {
		this.unanimate(i);
	}
	
	var otherAnimations = this.element.getElementsByTagName('animate', true, true);
	
	var relativePaths = [];
	for(var i = 0; i < otherAnimations.length; i++) {
		var path = [];
		var current = otherAnimations[i];
		do {
			var candidates = current.parentNode.getElementsByTagName(current.nodeName.toLowerCase());
			
			path.push({ 'nodeName': current.nodeName.toLowerCase(), 'index': candidates.indexOf(current)});
			current = current.parentNode;
		} while(current != this.element);
		path.reverse();
		relativePaths.push({'element': otherAnimations[i], 'position': path.splice(-1)[0]['index'], 'path': path });
	}
	
	for(var i = 0; i < relativePaths.length; i++) {
		var current = pretender.element;
		for(var j = 0; j < relativePaths[i].path.length; j++) {
			var candidates = current.getElementsByTagName(relativePaths[i].path[j].nodeName);
			if(candidates[relativePaths[i].path[j].index]) {
				current = candidates[relativePaths[i].path[j].index];
			} else {
				break;
			}
		}
		if(current.children[relativePaths[i].position]) {
			current.insertBefore(relativePaths[i].element, current.children[relativePaths[i].position]);
		} else {
			current.appendChild(relativePaths[i].element);
		}
	}
	
	pretender.element.setAttribute('id', this.element.getAttribute('id'));
	pretender.element.setAttribute('transform', this.element.getAttribute('transform'));
	if(this.element.getAttribute('anigen:sync')) {
		pretender.element.setAttribute('anigen:sync', 'true');
	}
		
	var par = this.element.parentNode;
	var nex = this.element.nextElementSibling;
	
	this.element.parentNode.removeChild(this.element);
	
	if(!noHistory || !svg || !svg.history) {
		svg.history.add(new historyCreation(
			this.element.cloneNode(true), par.getAttribute('id'), nex ? nex.getAttribute('id') : null, true, true));
		svg.history.add(new historyCreation(
			pretender.element.cloneNode(true), par.getAttribute('id'), nex ? nex.getAttribute('id') : null, false, true));
	}
	
	if(nex) {
		par.insertBefore(pretender.element, nex);
	} else {
		par.appendChild(pretender);
	}
	
	window.dispatchEvent(new Event('treeSeed'));
	window.dispatchEvent(new Event('rootSelect'));
	
	return pretender;
}

animationGroup.prototype.commit = function(noHistory, noWipe) {
	if(noHistory && !noWipe) { this.wipe(); }
	this.getKeyframes();
	
	var out = this.element;
	var count = 0;
	var intensityChanged = false;
	
	var newTimes = this.keyframes.getTimes().join(';');
	var newSplines = this.keyframes.getSplines().join(';');
	var newIntensity = this.keyframes.getIntensity().join(';');
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
	
	if(noHistory || (newTimes != this.getAttribute('anigen:keytimes') && newTimes.length != 0 && this.getAttribute('anigen:keytimes'))) {
		histFrom['anigen:keytimes'] = this.getAttribute('anigen:keytimes');
		histTo['anigen:keytimes'] = newTimes;
		this.setAttribute('anigen:keytimes', newTimes);
		for(var i in this.animations) {
			for(var j = 0; j < this.animations[i].length; j++) {
				this.animations[i][j].setAttribute('keyTimes', newTimes);
			}
		}
		count++;
	}
	if(noHistory || (newSplines != this.getAttribute('anigen:keysplines') && newSplines.length != 0 && this.getAttribute('anigen:keysplines'))) {
		histFrom['anigen:keysplines'] = this.getAttribute('anigen:keysplines');
		histTo['anigen:keysplines'] = newSplines;
		this.setAttribute('anigen:keysplines', newSplines);
		for(var i in this.animations) {
			for(var j = 0; j < this.animations[i].length; j++) {
				this.animations[i][j].setAttribute('keySplines', newSplines);
			}
		}
		count++;
	}
	
	var oldIntensity;
	if(!this.getAttribute('anigen:intensity')) {
		oldIntensity = [];
		for(var i = 0; i < this.keyframes.length; i++) {
			oldIntensity.push(1);
		}
	} else {
		oldIntensity = this.getAttribute('anigen:intensity').split(';');
		for(var i = 0; i < oldIntensity.length; i++) {
			oldIntensity[i] = parseFloat(oldIntensity[i]);
		}
	}
	
	if(newIntensity != this.getAttribute('anigen:intensity')) {	
		histFrom['anigen:intensity'] = this.getAttribute('anigen:intensity');
		histTo['anigen:intensity'] = newIntensity;
		this.setAttribute('anigen:intensity', newIntensity);
		count++;
		intensityChanged = true;
	}
	
	if(noHistory || intensityChanged || (newValues != this.getAttribute('anigen:values') && newValues.length != 0 && this.getAttribute('anigen:values'))) {
		var oldValues = this.getAttribute('anigen:values').split(';');
		for(var i = 0; i < oldValues.length; i++) {
			oldValues[i] = parseInt(oldValues[i]);
		}
		histFrom['anigen:values'] = this.getAttribute('anigen:values');
		histTo['anigen:values'] = newValues;
		this.setAttribute('anigen:values', newValues);
		
		var grp = svg.animationStates[this.groupName];
		if(!grp) { return false;};
		this.getKeyframes();
		
		for(var i in this.animations) {		// for all groups of animations attributes animated
			for(var j = 0; j < this.animations[i].length; j++) { // for each animation itself
				var lastValue = null;
			
				var newValues = this.animations[i][j].getAttribute('values') ? this.animations[i][j].getAttribute('values').split(';') : [];
				
				var childIndex = this.animations[i][j].getAttribute('anigen:childindex');
				if(!childIndex) { continue; }
				childIndex = parseInt(childIndex);
				
				var lastChange = null;
				for(k = 0; k < this.keyframes.length; k++) { // for each keyFrame
					if(	this.keyframes.getItem(k) == oldValues[k] &&
						oldIntensity[k] == this.keyframes.getItem(k).intensity &&
						(lastChange < (k-1) || this.keyframes.getItem(k).intensity == 1)) {
						continue;
					}
					lastChange = k;
					
					var newValue = grp[this.keyframes.getItem(k).value] ? (grp[this.keyframes.getItem(k).value].children[childIndex].getAttribute(i) || window.getComputedStyle(grp[this.keyframes.getItem(k).value].children[childIndex])[i]) : grp[0];
					
					if(i != 'd' || this.keyframes.getItem(k).intensity == 1) {
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
								
							var adjValue = pathFrom.inbetween(pathTo, this.keyframes.getItem(k).intensity);
								adjValue = adjValue.toString();
							
							lastValue = adjValue;
							newValues[k] = adjValue;
						}
					}
					
				}
				
				newValues.splice(this.keyframes.length, newValues.length);
				
				newValues = newValues.join(';');
				
				this.animations[i][j].setAttribute('values', newValues);
			}
		}
		count++;
	}
	
	
	if(noHistory || (newDur != this.getAttribute('anigen:dur') && newDur.length != 0 && this.getAttribute('anigen:dur'))) {
		histFrom['anigen:dur'] = this.getAttribute('anigen:dur');
		histTo['anigen:dur'] = newDur;
		this.setAttribute('anigen:dur', newDur);
		for(var i in this.animations) {
			for(var j = 0; j < this.animations[i].length; j++) {
				this.animations[i][j].setAttribute('dur', newDur);
			}
		}
		count++;
	}
	
	if(noHistory || (newRepeatCount != this.getAttribute('anigen:repeatcount') && newRepeatCount.length != 0)) {
		histFrom['anigen:repeatcount'] = this.getAttribute('anigen:repeatcount');
		histTo['anigen:repeatcount'] = newRepeatCount;
		this.setAttribute('anigen:repeatcount', newRepeatCount);
		for(var i in this.animations) {
			for(var j = 0; j < this.animations[i].length; j++) {
				this.animations[i][j].setAttribute('repeatCount', newRepeatCount);
			}
		}
		count++;
	}
	if(noHistory || (newCalcMode != this.getAttribute('anigen:calcmode') && newCalcMode.length != 0)) {
		histFrom['anigen:calcmode'] = this.getAttribute('anigen:calcmode');
		histTo['anigen:calcmode'] = newCalcMode;
		this.setAttribute('anigen:calcmode', newCalcMode);
		for(var i in this.animations) {
			for(var j = 0; j < this.animations[i].length; j++) {
				this.animations[i][j].setAttribute('calcMode', newCalcMode);
			}
		}
		count++;
	}
	if(noHistory || (newFill != this.getAttribute('anigen:fill') && newFill.length != 0)) {
		histFrom['anigen:fill'] = this.getAttribute('anigen:fill');
		histTo['anigen:fill'] = newFill;
		this.setAttribute('anigen:fill', newFill);
		for(var i in this.animations) {
			for(var j = 0; j < this.animations[i].length; j++) {
				this.animations[i][j].setAttribute('fill', newFill);
			}
		}
		count++;
	}
	if(noHistory || (newAdditive != this.getAttribute('anigen:additive') && newAdditive.length != 0)) {
		histFrom['anigen:additive'] = this.getAttribute('anigen:additive');
		histTo['anigen:additive'] = newAdditive;
		this.setAttribute('anigen:additive', newAdditive);
		for(var i in this.animations) {
			for(var j = 0; j < this.animations[i].length; j++) {
				this.animations[i][j].setAttribute('additive', newAdditive);
			}
		}
		count++;
	}
	if(noHistory || (newAccumulate != this.getAttribute('anigen:accumulate') && newAccumulate.length != 0)) {
		histFrom['anigen:accumulate'] = this.getAttribute('anigen:accumulate');
		histTo['anigen:accumulate'] = newAccumulate;
		this.setAttribute('anigen:accumulate', newAccumulate);
		for(var i in this.animations) {
			for(var j = 0; j < this.animations[i].length; j++) {
				this.animations[i][j].setAttribute('accumulate', newAccumulate);
			}
		}
		count++;
	}
	
	if(noHistory || (newBegin != this.getAttribute('anigen:begin') && newBegin.length != 0 && this.getAttribute('anigen:begin'))) {
		histFrom['anigen:begin'] = this.getAttribute('anigen:begin');
		histTo['anigen:begin'] = newBegin;
		this.setAttribute('anigen:begin', newBegin);
		
		
		for(var i in this.animations) {
			for(var j = 0; j < this.animations[i].length; j++) {
				this.animations[i][j].setAttribute('begin', newBegin);
				
				var nex = this.animations[i][j].nextElementSibling;
				var par = this.animations[i][j].parentNode;
				par.removeChild(this.animations[i][j]);
				
				if(nex) {
					par.insertBefore(this.animations[i][j], nex);
				} else {
					par.appendChild(this.animations[i][j]);
				}
			}
		}
		
		count++;
	}
	
	if(!noHistory && svg && svg.history && count > 0) {
		svg.history.add(new historyAttribute(this.element.id, histFrom, histTo, true));
	}
	
	svg.gotoTime();
	return out;
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

animationGroup.prototype.isInvertible = function() {
	return false;
}

animationGroup.prototype.isScalable = function() {
	return true;
}

animationGroup.prototype.scaleValues = function(factor) {
	this.getKeyframes();
	for(var i = 0; i < this.keyframes.length; i++) {
		this.keyframes.getItem(i).intensity *= factor;
	}
}

animationGroup.prototype.demo = function() {
	this.setCalcMode('spline');
	this.setFill('remove');
	this.setAdditive('replace');
	this.setAccumulate('none');
	this.setRepeatCount('indefinite');
	this.setBeginList([ new time(0) ]);
	this.setDur(new time(svg.animationStates[this.groupName].length));
	
	this.keyframes = new keyframeList();
	
	var ratio = 1/(svg.animationStates[this.groupName].length);
	
	for(var i = 0; i < svg.animationStates[this.groupName].length; i++) {
		this.keyframes.push(new keyframe(i*ratio, (i > 0 ? new spline(4) : null), svg.animationStates[this.groupName][i].number));
	}
	this.keyframes.push(new keyframe(1, new spline(4), svg.animationStates[this.groupName][0].number));
	
	this.commit(true, true);
}

animationGroup.prototype.inbetween = function(one, two, ratio) {
	this.getKeyframes();
	try {
		var keyframeTwo = this.keyframes.getItem(two);
		var newKeyframe = this.keyframes.inbetween(one, two, ratio);
			newKeyframe.value = keyframeTwo.value;
			
			newKeyframe.intensity = 0.5*keyframeTwo.intensity;
			//keyframeTwo.intensity = 0.5 + keyframeTwo.intensity/2;
			//keyframeTwo.intensity -= (1-keyframeTwo.intensity)*(2/3);
			
			if(newKeyframe.intensity == 1) {
				keyframeTwo.intensity = 0;
			} else {
				keyframeTwo.intensity = 1-(1-keyframeTwo.intensity)/(1-newKeyframe.intensity);
			}
			
	} catch(err) {
		throw err;
	}
}

animationGroup.prototype.setUpdate = function(boo) {
	if(boo) {
		this.setAttribute('anigen:sync', 'true');
	} else {
		this.removeAttribute('anigen:sync');
	}
}


