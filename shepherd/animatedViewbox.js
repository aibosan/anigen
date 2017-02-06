/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Path extension providing animation of the SVG's viewbox
 */
function animatedViewbox(target) {
	this.x = null;
	this.y = null;
	this.width = null;
	this.height = null;
	
	if(target instanceof root) {
		var candidate = null;
		for(var i = 0; i < target.svgElement.children.length; i++) {
			if(target.svgElement.children[i] instanceof SVGAnimateElement &&
				target.svgElement.children[i].getAttribute('attributeName') == 'viewBox') {
					candidate = target.svgElement.children[i];
					break;
				}
		}
		
		this.x = target.svgBox[0];
		this.y = target.svgBox[1];
		this.width = target.svgBox[2];
		this.height = target.svgBox[3];
		
		this.element = document.createElementNS(svgNS, 'path');
		
		this.element.setAttribute('shape-rendering', 'crispEdges');
		
		this.element.style.stroke = 'gray';
		this.element.style.fill = 'none';
		
		this.element.setAttribute('anigen:type', "animatedViewbox");
		this.element.setAttribute('anigen:x', this.x);
		this.element.setAttribute('anigen:y', this.y);
		this.element.setAttribute('anigen:width', this.width);
		this.element.setAttribute('anigen:height', this.height);
		
		if(candidate) {
			this.element.setAttribute('anigen:keytimes', candidate.getAttribute('keyTimes'));
			this.element.setAttribute('anigen:keysplines', candidate.getAttribute('keySplines'));
			this.element.setAttribute('anigen:values', candidate.getAttribute('values'));
			this.element.setAttribute('anigen:begin', candidate.getAttribute('begin'));
			this.element.setAttribute('anigen:dur', candidate.getAttribute('dur'));
			this.element.setAttribute('anigen:repeatcount', candidate.getAttribute('repeatCount'));
			this.element.setAttribute('anigen:calcmode', candidate.getAttribute('calcMode'));
			this.element.setAttribute('anigen:additive', candidate.getAttribute('additive'));
			this.element.setAttribute('anigen:accumulate', candidate.getAttribute('accumulate'));
			this.element.setAttribute('anigen:fill', candidate.getAttribute('fill'));
			candidate.parentNode.removeChild(candidate);
			this.element.setAttribute('id', candidate.getAttribute('id'));
		} else {
			this.element.setAttribute('anigen:keytimes', "0;1");
			this.element.setAttribute('anigen:keysplines', "0 0 1 1");
			this.element.setAttribute('anigen:values', target.svgBox.join(' ')+";"+target.svgBox.join(' '));
			this.element.setAttribute('anigen:begin', "0s");
			this.element.setAttribute('anigen:dur', "10s");
			this.element.setAttribute('anigen:repeatcount', "indefinite");
			this.element.setAttribute('anigen:calcmode', "spline");
			this.element.setAttribute('anigen:additive', "replace");
			this.element.setAttribute('anigen:accumulate', "none");
			this.element.setAttribute('anigen:fill', "freeze");
			this.element.generateId(false, 'camera');
		}
		
		this.animation = document.createElementNS(svgNS, 'animate');
		this.animation.setAttribute('attributeType', 'auto');
		this.animation.setAttribute('attributeName', 'd');
		this.animation.setAttribute('anigen:lock', 'skip');	
		this.animation.generateId();
		
		this.element.appendChild(this.animation);
		
		this.getBeginList();
		this.getDur();
		this.getRepeatCount();
		this.getCalcMode();
		this.getKeyframes();
		
		this.commit(true);
		
		this.element.shepherd = this;
		
		this.refresh();
		this.adjustZoom();
		svg.svgElement.appendChild(this.element);
	}
}

animatedViewbox.prototype = Object.create(animationGroup.prototype);

animatedViewbox.prototype.refresh = function() {
	var pData = [];
		pData.push('M');
		pData.push(this.x);
		pData.push(this.y);
		pData.push('L');
		pData.push(this.x+this.width);
		pData.push(this.y);
		pData.push('L');
		pData.push(this.x+this.width);
		pData.push(this.y+this.height);
		pData.push('L');
		pData.push(this.x);
		pData.push(this.y+this.height);
		pData.push('Z');
	this.element.setAttribute('d', pData.join(' '));
	this.element.setAttribute("stroke-width", 1/svg.zoom+"px");
}

animatedViewbox.prototype.adjustZoom = function() {
	if(anigenActual.settings.get('canvasFrame')) {
		this.element.removeAttribute("display");
	} else {
		this.element.setAttribute("display", "none");
	}
	
	this.element.setAttribute("stroke-width", 2/svg.zoom+"px");
}


animatedViewbox.prototype.getKeyframes = function() {
	if(this.keyframes) {
		return this.keyframes;
	}
	
	var timesArray = this.getAttribute('anigen:keytimes') ? this.getAttribute('anigen:keytimes').split(';') : [];
	var splineArray = this.getAttribute('anigen:keysplines') ? this.getAttribute('anigen:keysplines').split(';') : [];
	var valueArray = this.getAttribute('anigen:values') ? this.getAttribute('anigen:values').split(';') : [];
	var intensityArray = this.getAttribute('anigen:intensity') ? this.getAttribute('anigen:intensity').split(';') : [];
	
	this.keyframes = new keyframeList();
	
	for(var i = 0; i < timesArray.length; i++) {
		var newValue = new rectangle(valueArray[i]);
		this.keyframes.push(
			new keyframe(parseFloat(timesArray[i]),
				(splineArray[i-1] ? new spline(splineArray[i-1]) : null),
				newValue,
				(intensityArray && intensityArray[i] ? parseFloat(intensityArray[i]) : null)
			)
		);
	}
	return this.keyframes;
}

animatedViewbox.prototype.commit = function(noHistory) {
	if(noHistory) { this.wipe(); }
	this.getKeyframes();
	
	var out = this;
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
	
	if(newTimes != this.getAttribute('anigen:keytimes') && newTimes.length != 0 && this.getAttribute('anigen:keytimes')) {
		histFrom['anigen:keytimes'] = this.getAttribute('anigen:keytimes');
		histTo['anigen:keytimes'] = newTimes;
		this.setAttribute('anigen:keytimes', newTimes);
		count++;
	}
	if(newSplines != this.getAttribute('anigen:keysplines') && newSplines.length != 0 && this.getAttribute('anigen:keysplines')) {
		histFrom['anigen:keysplines'] = this.getAttribute('anigen:keysplines');
		histTo['anigen:keysplines'] = newSplines;
		this.setAttribute('anigen:keysplines', newSplines);
		count++;
	}
	
	if(newValues != this.getAttribute('anigen:values') && newValues.length != 0 && this.getAttribute('anigen:values')) {
		var oldValues = this.getAttribute('anigen:values').split(';');
		histFrom['anigen:values'] = this.getAttribute('anigen:values');
		histTo['anigen:values'] = newValues;
		this.setAttribute('anigen:values', newValues);
		
		count++;
	}
	
	if(newDur != this.getAttribute('anigen:dur') && newDur.length != 0 && this.getAttribute('anigen:dur')) {
		histFrom['anigen:dur'] = this.getAttribute('anigen:dur');
		histTo['anigen:dur'] = newDur;
		this.setAttribute('anigen:dur', newDur);
		count++;
	}
	
	if(newRepeatCount != this.getAttribute('anigen:repeatcount') && newRepeatCount.length != 0 && this.getAttribute('anigen:repeatcount')) {
		histFrom['anigen:repeatcount'] = this.getAttribute('anigen:repeatcount');
		histTo['anigen:repeatcount'] = newRepeatCount;
		this.setAttribute('anigen:repeatcount', newRepeatCount);
		count++;
	}
	if(newCalcMode != this.getAttribute('anigen:calcmode') && newCalcMode.length != 0 && this.getAttribute('anigen:calcmode')) {
		histFrom['anigen:calcmode'] = this.getAttribute('anigen:calcmode');
		histTo['anigen:calcmode'] = newCalcMode;
		this.setAttribute('anigen:calcmode', newCalcMode);
		count++;
	}
	if(newFill != this.getAttribute('anigen:fill') && newFill.length != 0 && this.getAttribute('anigen:fill')) {
		histFrom['anigen:fill'] = this.getAttribute('anigen:fill');
		histTo['anigen:fill'] = newFill;
		this.setAttribute('anigen:fill', newFill);
		count++;
	}
	if(newAdditive != this.getAttribute('anigen:additive') && newAdditive.length != 0 && this.getAttribute('anigen:additive')) {
		histFrom['anigen:additive'] = this.getAttribute('anigen:additive');
		histTo['anigen:additive'] = newAdditive;
		this.setAttribute('anigen:additive', newAdditive);
		count++;
	}
	if(newAccumulate != this.getAttribute('anigen:accumulate') && newAccumulate.length != 0 && this.getAttribute('anigen:accumulate')) {
		histFrom['anigen:accumulate'] = this.getAttribute('anigen:accumulate');
		histTo['anigen:accumulate'] = newAccumulate;
		this.setAttribute('anigen:accumulate', newAccumulate);
		count++;
	}
	
	
	if(newBegin != this.getAttribute('anigen:begin') && newBegin.length != 0 && this.getAttribute('anigen:begin')) {
		histFrom['anigen:begin'] = this.getAttribute('anigen:begin');
		histTo['anigen:begin'] = newBegin;
		this.setAttribute('anigen:begin', newBegin);
		count++;
	}
	
	// rebuilds everything for animation because reasons
	var newValues = [];
	for(var i = 0; i < this.keyframes.length; i++) {
		var currentFrame = this.keyframes.getItem(i);
		var pData = [];
			pData.push('M');
			pData.push(currentFrame.value.x);
			pData.push(currentFrame.value.y);
			pData.push('L');
			pData.push(currentFrame.value.x+currentFrame.value.width);
			pData.push(currentFrame.value.y);
			pData.push('L');
			pData.push(currentFrame.value.x+currentFrame.value.width);
			pData.push(currentFrame.value.y+currentFrame.value.height);
			pData.push('L');
			pData.push(currentFrame.value.x);
			pData.push(currentFrame.value.y+currentFrame.value.height);
			pData.push('Z');
		newValues.push(pData.join(' '));
	}
	newValues = newValues.join(';');
	
	this.animation.setAttribute('keyTimes', newTimes);
	this.animation.setAttribute('keySplines', newSplines);
	this.animation.setAttribute('values', newValues);
	this.animation.setAttribute('dur', newDur);
	this.animation.setAttribute('repeatCount', newRepeatCount);
	this.animation.setAttribute('calcMode', newCalcMode);
	this.animation.setAttribute('fill', newFill);
	this.animation.setAttribute('additive', newAdditive);
	this.animation.setAttribute('accumulate', newAccumulate);
	this.animation.setAttribute('begin', newBegin);
	var clone = this.animation.cloneNode(true);
	this.animation.parentNode.insertBefore(clone, this.animation);
	this.animation.parentNode.removeChild(this.animation);
	this.animation = clone;
	
	if(!noHistory && svg && svg.history && count > 0) {
		svg.history.add(new historyAttribute(this.element.id, histFrom, histTo, true));
	}
	
	return out;
}


animatedViewbox.prototype.transferOut = function() {
	this.getBeginList();
	this.getDur();
	this.getRepeatCount();
	this.getCalcMode();
	this.getKeyframes();
	
	var anim = this.animation.cloneNode();
		anim.setAttribute('attributeName', 'viewBox');
		anim.setAttribute('values', this.element.getAttribute('anigen:values'));
		anim.setAttribute('id', this.element.id);
		
	return anim;
}

animatedViewbox.prototype.generateAnchors = function() {
	if(anigenManager.classes.windowAnimation.selected.length == 0) { return null; }
	
	this.getKeyframes();
	
	svg.ui.selectionBox.hide();
	
	var allAnchors = [];
	var allConnectors = [];
	var allPaths = [];

	var lastAnchors;
	var currentAnchors;
	var firstAnchors;
	var lastRect;
	
	for(var i = 0; i < anigenManager.classes.windowAnimation.selected.length; i++) {
		lastRect = document.createElementNS(svgNS, 'rect');
		lastRect.setAttribute('x', this.keyframes.getItem(anigenManager.classes.windowAnimation.selected[i]).value.x);
		lastRect.setAttribute('y', this.keyframes.getItem(anigenManager.classes.windowAnimation.selected[i]).value.y);
		lastRect.setAttribute('width', this.keyframes.getItem(anigenManager.classes.windowAnimation.selected[i]).value.width);
		lastRect.setAttribute('height', this.keyframes.getItem(anigenManager.classes.windowAnimation.selected[i]).value.height);
		lastRect.setAttribute("anigen:lock", "interface");
		lastRect.setAttribute('style', 'fill:none;stroke:#aa0000;stroke-width:'+2/(svg.zoom)+'px');
		currentAnchors = lastRect.generateAnchors();
		
		if(firstAnchors == null) { firstAnchors = currentAnchors; }
		
		if(anigenManager.classes.windowAnimation.selected.length != 1 && i == anigenManager.classes.windowAnimation.selected.length-1 &&
			this.keyframes.getItem(anigenManager.classes.windowAnimation.selected[i]).value.x == this.keyframes.getItem(anigenManager.classes.windowAnimation.selected[0]).value.x &&
			this.keyframes.getItem(anigenManager.classes.windowAnimation.selected[i]).value.y == this.keyframes.getItem(anigenManager.classes.windowAnimation.selected[0]).value.y &&
			this.keyframes.getItem(anigenManager.classes.windowAnimation.selected[i]).value.width == this.keyframes.getItem(anigenManager.classes.windowAnimation.selected[0]).value.width &&
			this.keyframes.getItem(anigenManager.classes.windowAnimation.selected[i]).value.height == this.keyframes.getItem(anigenManager.classes.windowAnimation.selected[0]).value.height) {
				currentAnchors = firstAnchors;
		} else {
			allAnchors = allAnchors.concat(currentAnchors.anchors);
			allPaths.push(lastRect);
		}
		currentAnchors.anchors[0][0].actions.move = 'this.element.setX(absolute.x);this.element.setY(absolute.y);'
		currentAnchors.anchors[0][0].addChild(currentAnchors.anchors[0][1]);
		for(var j = 0; j < currentAnchors.anchors[0].length; j++) {
			currentAnchors.anchors[0][j].animation = this;
			currentAnchors.anchors[0][j].actions.move += 'this.animation.setValue('+anigenManager.classes.windowAnimation.selected[i]+', null, this.element, true);';
			currentAnchors.anchors[0][j].actions.mouseup = '';
		}
		currentAnchors.anchors[0][1].selectable = false;
		currentAnchors.anchors[0][1].constraint.a = currentAnchors.anchors[0][0];
		currentAnchors.anchors[0][1].constraint.b = currentAnchors.anchors[0][1];
		currentAnchors.anchors[0][1].constraint.optional = false;
		
		if(anigenActual.settings.get('progressCurve') && lastAnchors && currentAnchors && currentAnchors != lastAnchors) {
			for(var j = 0; j < currentAnchors.anchors[0].length; j++) {
				var slave = new connector(currentAnchors.anchors[0][j], lastAnchors.anchors[0][j], '#00aa00');
				allConnectors.push(slave);
			}
		}
		lastAnchors = currentAnchors;
	}
	return { 'connectors': allConnectors, 'anchors': allAnchors, 'paths': allPaths };
}

animatedViewbox.prototype.setValue = function(index, portion, value) {
	this.getKeyframes();
	
	if(index < 0 || index >= this.keyframes.length) { throw new DOMException(1); }
	
	var val = this.keyframes.getItem(index);
	
	if(portion == null) {
		if(!(value instanceof SVGRectElement)) { throw new DOMException(17); }
		val.value.x = value.x.baseVal.value;
		val.value.y = value.y.baseVal.value;
		val.value.width = value.width.baseVal.value;
		val.value.height = value.height.baseVal.value;
		this.commit();
		return;
	}
	
	if(portion < 0 || portion > 4) { throw new DOMException(1); }
	
	switch(portion) {
		case 0:
			val.value.x = value;
			break;
		case 1:
			val.value.y = value;
			break;
		case 2:
			var ratio = svg.svgBox[3]/svg.svgBox[2];
			val.value.width = value;
			val.value.height = value*ratio;
			break;
		case 3:
			var ratio = svg.svgBox[2]/svg.svgBox[3];
			val.value.width = value*ratio;
			val.value.height = value;
			break;
	}
	
	this.commit();
}


