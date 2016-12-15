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
		this.getValues();
		this.getTimes();
		this.getSplines();
		this.getValues();
		
		this.commitAll();
		
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
		this.animation.setAttribute('keyTimes', newTimes);
		count++;
	}
	if(newSplines != this.getAttribute('anigen:keysplines') && newSplines.length != 0 && this.getAttribute('anigen:keysplines')) {
		histFrom['anigen:keysplines'] = this.getAttribute('anigen:keysplines');
		histTo['anigen:keysplines'] = newSplines;
		this.setAttribute('anigen:keysplines', newSplines);
		this.animation.setAttribute('keySplines', newSplines);
		count++;
	}
	
	if(newValues != this.getAttribute('anigen:values') && newValues.length != 0 && this.getAttribute('anigen:values')) {
		var oldValues = this.getAttribute('anigen:values').split(';');
		histFrom['anigen:values'] = this.getAttribute('anigen:values');
		histTo['anigen:values'] = newValues;
		this.setAttribute('anigen:values', newValues);
		
		var newValues = [];
		for(var i = 0; i < this.keyframes.length; i++) {
			var currentFrame = this.keyframes.getItem(i);
			var pData = [];
				pData.push('M');
				pData.push(currentFrame.x);
				pData.push(currentFrame.y);
				pData.push('L');
				pData.push(currentFrame.x+currentFrame.width);
				pData.push(currentFrame.y);
				pData.push('L');
				pData.push(currentFrame.x+currentFrame.width);
				pData.push(currentFrame.y+currentFrame.height);
				pData.push('L');
				pData.push(currentFrame.x);
				pData.push(currentFrame.y+currentFrame.height);
				pData.push('Z');
			newValues.push(pData.join(' '));
		}
		newValues = newValues.join(';');
		
		this.animation.setAttribute('values', newValues);
		count++;
	}
	
	
	if(newDur != this.getAttribute('anigen:dur') && newDur.length != 0 && this.getAttribute('anigen:dur')) {
		histFrom['anigen:dur'] = this.getAttribute('anigen:dur');
		histTo['anigen:dur'] = newDur;
		this.setAttribute('anigen:dur', newDur);
		this.animation.setAttribute('dur', newDur);
		count++;
	}
	
	if(newRepeatCount != this.getAttribute('anigen:repeatcount') && newRepeatCount.length != 0 && this.getAttribute('anigen:repeatcount')) {
		histFrom['anigen:repeatcount'] = this.getAttribute('anigen:repeatcount');
		histTo['anigen:repeatcount'] = newRepeatCount;
		this.setAttribute('anigen:repeatcount', newRepeatCount);
		this.animation.setAttribute('repeatCount', newRepeatCount);
		count++;
	}
	if(newCalcMode != this.getAttribute('anigen:calcmode') && newCalcMode.length != 0 && this.getAttribute('anigen:calcmode')) {
		histFrom['anigen:calcmode'] = this.getAttribute('anigen:calcmode');
		histTo['anigen:calcmode'] = newCalcMode;
		this.setAttribute('anigen:calcmode', newCalcMode);
		this.animation.setAttribute('calcMode', newCalcMode);
		count++;
	}
	if(newFill != this.getAttribute('anigen:fill') && newFill.length != 0 && this.getAttribute('anigen:fill')) {
		histFrom['anigen:fill'] = this.getAttribute('anigen:fill');
		histTo['anigen:fill'] = newFill;
		this.setAttribute('anigen:fill', newFill);
		this.animation.setAttribute('fill', newFill);
		count++;
	}
	if(newAdditive != this.getAttribute('anigen:additive') && newAdditive.length != 0 && this.getAttribute('anigen:additive')) {
		histFrom['anigen:additive'] = this.getAttribute('anigen:additive');
		histTo['anigen:additive'] = newAdditive;
		this.setAttribute('anigen:additive', newAdditive);
		this.animation.setAttribute('additive', newAdditive);
		count++;
	}
	if(newAccumulate != this.getAttribute('anigen:accumulate') && newAccumulate.length != 0 && this.getAttribute('anigen:accumulate')) {
		histFrom['anigen:accumulate'] = this.getAttribute('anigen:accumulate');
		histTo['anigen:accumulate'] = newAccumulate;
		this.setAttribute('anigen:accumulate', newAccumulate);
		this.animation.setAttribute('accumulate', newAccumulate);
		count++;
	}
	
	
	if(newBegin != this.getAttribute('anigen:begin') && newBegin.length != 0 && this.getAttribute('anigen:begin')) {
		histFrom['anigen:begin'] = this.getAttribute('anigen:begin');
		histTo['anigen:begin'] = newBegin;
		this.setAttribute('anigen:begin', newBegin);
		this.animation.setAttribute('begin', newBegin);
		var clone = this.animation.cloneNode(true);
		this.animation.parentNode.insertBefore(clone, this.animation);
		this.animation.removeChild(this.animation);
		this.animation = clone;
		count++;
	}
	
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
	this.getValues();
	this.getTimes();
	this.getSplines();
	this.getValues();
	
	var anim = document.createElementNS(svgNS, 'animate');
		anim.setAttribute('attributeType', 'auto');
		anim.setAttribute('attributeName', 'viewBox');
		anim.setAttribute('begin', this.element.getAttribute('anigen:begin'));
		anim.setAttribute('dur', this.element.getAttribute('anigen:dur'));
		anim.setAttribute('repeatCount', this.element.getAttribute('anigen:repeatcount'));
		anim.setAttribute('calcMode', this.element.getAttribute('anigen:calcmode'));
		anim.setAttribute('keyTimes', this.element.getAttribute('anigen:keytimes'));
		anim.setAttribute('values', this.element.getAttribute('anigen:values'));
		anim.setAttribute('fill', this.element.getAttribute('anigen:fill') || 'remove');
		anim.setAttribute('additive', this.element.getAttribute('anigen:additive') || 'replace');
		anim.setAttribute('accumulate', this.element.getAttribute('anigen:accumulate') || 'none');
		
		anim.setAttribute('id', this.element.id);
		if(this.splines) {
			anim.setAttribute('keySplines', this.element.getAttribute('anigen:keysplines'));
		}
	
	return anim;
}

animatedViewbox.prototype.generateAnchors = function() {
	if(windowAnimation.selected.length == 0) { return null; }
	
	svg.ui.selectionBox.hide();
	
	var allAnchors = [];
	var allConnectors = [];
	var allPaths = [];

	var lastAnchors;
	var currentAnchors;
	var firstAnchors;
	var lastRect;
	
	for(var i = 0; i < windowAnimation.selected.length; i++) {
		lastRect = document.createElementNS(svgNS, 'rect');
		lastRect.setAttribute('x', this.values[windowAnimation.selected[i]].x);
		lastRect.setAttribute('y', this.values[windowAnimation.selected[i]].y);
		lastRect.setAttribute('width', this.values[windowAnimation.selected[i]].width);
		lastRect.setAttribute('height', this.values[windowAnimation.selected[i]].height);
		lastRect.setAttribute("anigen:lock", "interface");
		lastRect.setAttribute('style', 'fill:none;stroke:#aa0000;stroke-width:'+2/(svg.zoom)+'px');
		currentAnchors = lastRect.generateAnchors();
		
		if(firstAnchors == null) { firstAnchors = currentAnchors; }
		
		if(windowAnimation.selected.length != 1 && i == windowAnimation.selected.length-1 &&
			this.values[windowAnimation.selected[i]].x == this.values[windowAnimation.selected[0]].x &&
			this.values[windowAnimation.selected[i]].y == this.values[windowAnimation.selected[0]].y &&
			this.values[windowAnimation.selected[i]].width == this.values[windowAnimation.selected[0]].width &&
			this.values[windowAnimation.selected[i]].height == this.values[windowAnimation.selected[0]].height) {
				currentAnchors = firstAnchors;
		} else {
			allAnchors = allAnchors.concat(currentAnchors.anchors);
			allPaths.push(lastRect);
		}
		currentAnchors.anchors[0][0].actions.move = 'this.element.setX(absolute.x);this.element.setY(absolute.y);'
		currentAnchors.anchors[0][0].addChild(currentAnchors.anchors[0][1]);
		for(var j = 0; j < currentAnchors.anchors[0].length; j++) {
			currentAnchors.anchors[0][j].animation = this;
			currentAnchors.anchors[0][j].actions.move += 'this.animation.setValue('+windowAnimation.selected[i]+', null, this.element, true);';
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

animatedViewbox.prototype.setValue = function(index, portion, value, makeHistory) {
	this.getValues();
	
	if(index < 0 || index >= this.values.length) { throw new DOMException(1); }
	
	if(!portion && value instanceof SVGRectElement) {
		this.values[index].x = value.x.baseVal.value;
		this.values[index].y = value.y.baseVal.value;
		this.values[index].width = value.width.baseVal.value;
		this.values[index].height = value.height.baseVal.value;
		if(makeHistory) { this.makeHistory(false, true, false); }
		this.commitValues();
		return;
	}
	
	if(portion < 0 || portion > 4) { throw new DOMException(1); }
	
	switch(portion) {
		case 0:
			this.values[index].x = value;
			break;
		case 1:
			this.values[index].y = value;
			break;
		case 2:
			var ratio = svg.svgBox[3]/svg.svgBox[2];
			this.values[index].width = value;
			this.values[index].height = value*ratio;
			break;
		case 3:
			var ratio = svg.svgBox[2]/svg.svgBox[3];
			this.values[index].width = value*ratio;
			this.values[index].height = value;
			break;
	}
	
	if(makeHistory) { this.makeHistory(false, true, false); }
	this.commitValues();
}


