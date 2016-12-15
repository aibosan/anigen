/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for SVG "animateMotion" element
 */
 
SVGAnimateMotionElement.prototype.getPath = function() {
	if(this.path) { return this.path; }
	this.path = null;
	for(var i = 0; i < this.children.length; i++) {
		if(this.children[i] instanceof SVGMPathElement) {
			this.path = document.getElementById(this.children[i].getAttribute('xlink:href').substring(1));
			if(this.path) {
				this.xlink = this.children[i];
				return this.path;
			}
		}
	}
	
	if(!this.getAttribute('path')) { return null; }
	this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
	this.path.setD(this.getAttribute('path'));
	var center = this.getCenter(true);
	
	//var CTMBase = this.parentNode.getCTMBase();
	//this.path.setAttribute('transform', CTMBase.toString()+' translate('+center.x+', '+center.y+')');
	
	this.path.setAttribute('transform', 'translate('+center.x+', '+center.y+')');
	return this.path;
}

SVGAnimateMotionElement.prototype.setPathData = function(data) {
	this.path = null;
	this.setAttribute('path', data);
}

SVGAnimateMotionElement.prototype.setPath = function(target, absolute) {
	if(!(target instanceof SVGPathElement)) { return; }
	
	this.path = null;
	var path = target.cloneNode(false);
		path.consumeTransform();
		path.setStartAtZero();
	if(absolute) {
		try {
			var origin = target.getPathData().baseVal.getItem(0);
		} catch(err) {
			// no path data
			return;
		}
		var center = this.getCenter();
		// doesn't take CTM of target path into account?
		path.moveAllBy(origin.x-center.x, origin.y-center.y );
	}
	this.setAttribute('path', path.getAttribute('d'));
		
	svg.select();
	svg.gotoTime();
}

SVGAnimateMotionElement.prototype.getKeyframes = function() {
	if(this.keyframes) {
		return this.keyframes;
	}
	
	var timesArray = this.getAttribute('keyTimes') ? this.getAttribute('keyTimes').split(';') : [];
	var splineArray = this.getAttribute('keySplines') ? this.getAttribute('keySplines').split(';') : [];
	var valueArray = this.getAttribute('keyPoints') ? this.getAttribute('keyPoints').split(';') : [];
	
	this.keyframes = new keyframeList();
	
	for(var i = 0; i < timesArray.length; i++) {
		this.keyframes.push(
			new keyframe(parseFloat(timesArray[i]),
				(splineArray[i-1] ? new spline(splineArray[i-1]) : null),
				parseFloat(valueArray[i])
			)
		);
	}
	return this.keyframes;
}



// commits values into element
SVGAnimateMotionElement.prototype.commit = function(noHistory) {
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
	
	var newRotate = String(this.getRotate());
	
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
	if(newValues != this.getAttribute('keyPoints') && newValues.length != 0 && this.getAttribute('keyPoints')) {
		histFrom['keyPoints'] = this.getAttribute('keyPoints');
		histTo['keyPoints'] = newValues;
		this.setAttribute('keyPoints', newValues);
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
	
	if(newRotate != this.getAttribute('rotate') && newRotate.length != 0 && this.getAttribute('rotate')) {
		histFrom['rotate'] = this.getAttribute('rotate');
		histTo['rotate'] = newRotate;
		this.setAttribute('rotate', newRotate);
		count++;
	}
	
	if(newBegin != this.getAttribute('begin') && newBegin.length != 0 && this.getAttribute('begin')) {
		histFrom['begin'] = this.getAttribute('begin');
		histTo['begin'] = newBegin;
		this.setAttribute('begin', newBegin);
		
		var clone = this.cloneNode(true);
		clone.wipe();
		this.parentNode.insertBefore(clone, this);
		this.parentNode.removeChild(this);
		out = clone;
		
		if(svg.selected == this) { svg.selected = clone; }
		if(windowAnimation.animation == this) { windowAnimation.animation = clone; }
		tree.seed();
		tree.select(svg.selected);
		svg.select();
		
		count++;
	}
	
	if(!noHistory && svg && svg.history && count > 0) {
		svg.history.add(new historyAttribute(this.id, histFrom, histTo, true));
	}
	
	svg.gotoTime();
	return out;
}

SVGAnimateMotionElement.prototype.getRotate = function(value) {
	if(!this.rotate) {
		this.rotate = this.getAttribute('rotate');
		if(!isNaN(this.rotate)) { this.rotate = parseFloat(this.rotate); }
	}
	return this.rotate;
}

SVGAnimateMotionElement.prototype.setRotate = function(value) {
	if(isNaN(value) && (value != 'auto' || value != 'auto-reverse')) { return; }
	if(!isNaN(value)) { value = parseFloat(value); }
	this.rotate = value;
}


SVGAnimateMotionElement.prototype.generateAnchors = function() {
	this.getPath();
	var generated = this.path.generateAnchors();
	if(!this.xlink) {
		for(var i = 0; i < generated.anchors[0].length; i++) {
			generated.anchors[0][i].bound = { 'animation': this };
			generated.anchors[0][i].actions.move += 'this.bound.animation.setPathData(this.element.pathData.baseVal.toString());';
		}
		this.path.style.stroke = '#aa0000';
		this.path.style.fill = 'none';
		this.path.setAttribute('stroke-width', 1.5/svg.zoom+"px");
		this.path.adjustZoom = function() {
			this.setAttribute("stroke-width", 1.5/svg.zoom+"px");
		}
		generated.paths = [ this.path ];
	}
	return generated;
}

