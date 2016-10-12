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

animatedViewbox.prototype.getValues = function() {
	this.values = [];
	var temp = this.getAttribute('anigen:values');
	temp = temp.split(';');
	
	for(var i = 0; i < temp.length; i++) {
		this.values.push(new rectangle(temp[i]));
	}
	return this.values;
}

animatedViewbox.prototype.commitValues = function(fromAttribute) {
	var newValues = [];
	
	if(fromAttribute) {
		this.getValues();
	}
	
	for(var i = 0; i < this.values.length; i++) {
		var pData = [];
			pData.push('M');
			pData.push(this.values[i].x);
			pData.push(this.values[i].y);
			pData.push('L');
			pData.push(this.values[i].x+this.values[i].width);
			pData.push(this.values[i].y);
			pData.push('L');
			pData.push(this.values[i].x+this.values[i].width);
			pData.push(this.values[i].y+this.values[i].height);
			pData.push('L');
			pData.push(this.values[i].x);
			pData.push(this.values[i].y+this.values[i].height);
			pData.push('Z');
		newValues.push(pData.join(' '));
	}
	newValues = newValues.join(';');
	
	if(!fromAttribute) {
		this.element.setAttribute('anigen:values', this.values.join(';'));
	}
	this.animation.setAttribute('values', newValues);
	
	return true;
}

animatedViewbox.prototype.commitSplines = function(fromAttribute) {
	var newSplines = fromAttribute ? this.getAttribute('anigen:keysplines') : this.splines.join(';');
	this.animation.setAttribute('keySplines', newSplines);
	this.element.setAttribute('anigen:keysplines', newSplines);
}

animatedViewbox.prototype.commitTimes = function(fromAttribute) {
	var newTimes = fromAttribute ? this.getAttribute('anigen:keytimes') : this.times.join(';');
	
	this.animation.setAttribute('keyTimes', newTimes);
	this.element.setAttribute('anigen:keytimes', newTimes);
}

animatedViewbox.prototype.commitBegins = function(fromAttribute) {
	var newBegin = fromAttribute ? this.element.getAttribute('anigen:begin') : this.beginList.join(';');
	
	this.animation.setAttribute('begin', newBegin);
	this.element.setAttribute('anigen:begin', newBegin);
}

animatedViewbox.prototype.commitRepeatCount = function(fromAttribute) {
	var newRepeatCount = fromAttribute ? this.element.getAttribute('anigen:repeatcount') : this.repeatCount;
	
	this.element.appendChild(this.animation);
	this.animation.setAttribute('repeatCount', newRepeatCount);
	this.element.setAttribute('anigen:repeatcount', newRepeatCount);
}

animatedViewbox.prototype.commitDur = function(fromAttribute) {
	var newDur = fromAttribute ? this.element.getAttribute('anigen:dur') : this.dur;
	
	this.animation.setAttribute('dur', newDur);
	this.element.setAttribute('anigen:dur', newDur);
}

animatedViewbox.prototype.commitCalcMode = function(fromAttribute) {
	var newCalcMode = fromAttribute ? this.element.getAttribute('anigen:calcmode') : this.calcMode;
	
	this.animation.setAttribute('calcMode', newCalcMode);
	this.element.setAttribute('anigen:calcmode', newCalcMode);
}

animatedViewbox.prototype.commitFill = function() {
	var newFill = this.fill || this.element.getAttribute('anigen:fill');
	
	this.animation.setAttribute('fill', newFill);
	this.element.setAttribute('anigen:fill', newFill);
}

animatedViewbox.prototype.commitAdditive = function(fromAttribute) {
	var newAdditive = this.additive || this.element.getAttribute('anigen:additive');
	
	this.animation.setAttribute('additive', newAdditive);
	this.element.setAttribute('anigen:additive', newAdditive);
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


