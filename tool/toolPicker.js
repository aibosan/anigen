/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Picker tool
 */
function toolPicker() {
	tool.call(this);
}

toolPicker.prototype = Object.create(tool.prototype);

toolPicker.prototype.mouseClick = function(event) {
	if(!svg || !(svg instanceof root) || event.button == 2) { return; }
	
	if(event.target == svg.svgElement || svg.selected == svg.svgElement) { return; }
	
	if(event.target.original) { event.target = event.target.original; }
	
	if(svg.selected instanceof SVGAnimationElement && event.shiftKey && event.target.hasAnimation() && event.target.getAnimations()[0]) {
		svg.selected.pasteTiming(event.target.getAnimations()[0]);
		svg.select(svg.selected.commit());
		return;
	}
	
	if(svg.selected instanceof SVGAnimateMotionElement && event.target instanceof SVGPathElement) {
		// motion gets a new path if the target is a path
		svg.selected.setPath(event.target, event.shiftKey || event.ctrlKey);
		svg.selected.commit();
		return;
	}
	
	if((svg.selected.shepherd instanceof animationGroup || svg.selected instanceof SVGAnimationElement) &&
		(event.target.shepherd instanceof animationGroup || event.target.hasAnimation()) &&
		!(svg.selected instanceof SVGAnimateElement) || (svg.selected instanceof SVGAnimateElement && anigenManager.classes.windowAnimation.selected.length == 0)) {
		
		var fr, to;
		to = svg.selected.shepherd || svg.selected;
		fr = event.target.shepherd || event.target.getAnimations()[0];
		
		to.pasteTiming(fr, true)
		svg.select(to.commit());
		
		return;
	}
	
	if(svg.selected instanceof SVGAnimateElement) {
		// attribute animation gets new values for selected animation keyframes (if applicable)
		if(anigenManager.classes.windowAnimation.selected.length == 0) { return; }
		var val = event.target.style[svg.selected.getAttribute('attributeName')] || event.target.getAttribute(svg.selected.getAttribute('attributeName'));
		if(!val) {
			// if no values is found, reverts to the parent's default value instead
			val = svg.selected.parentNode.style[svg.selected.getAttribute('attributeName')] || svg.selected.parentNode.getAttribute(svg.selected.getAttribute('attributeName'));
		}
		for(var i = 0; i < anigenManager.classes.windowAnimation.selected.length; i++) {
			svg.selected.setValue(anigenManager.classes.windowAnimation.selected[i], val, true);
		}
		svg.selected.commit();
		anigenManager.classes.windowAnimation.refreshKeyframes();
		svg.ui.edit(svg.selected);
		return;
	}
	
	var tFillColor = event.target.style.fill;
	var tFillOpacity = event.target.style.fillOpacity || 1;
	
	var trg = event.target;
	while((tFillColor == 'inherit' || tFillColor == null) && trg.parentNode && !(trg.parentNode instanceof SVGSVGElement)) {
		trg = trg.parentNode;
		tFillColor = trg.style.fill;
	}
	trg = event.target;
	while(tFillOpacity == 'inherit' && trg.parentNode && !(trg.parentNode instanceof SVGSVGElement)) {
		trg = trg.parentNode;
		tFillOpacity = trg.style.fillOpacity;
	}
	
	if(event.shiftKey) {
		svg.selected.setAttributeHistory({'stroke': tFillColor, 'strokeOpacity': tFillOpacity || 1 });
	} else {
		svg.selected.setAttributeHistory({'fill': tFillColor, 'fillOpacity': tFillOpacity || 1 });
	}
	
	anigenManager.classes.windowColors.refresh();
	
}

toolPicker.prototype.mouseMove = function(event) {
	if(!svg || !(svg instanceof root)) { return; }
	
	this.lastEvent = event;
	
	if(event.target == svg.svgElement || svg.selected == svg.svgElement) {
		anigenManager.setCursor('url(_cursors/picker.png) 5 5');
	} else if(svg.selected instanceof SVGAnimateMotionElement && event.target instanceof SVGPathElement) {
		anigenManager.setCursor('url(_cursors/picker_path.png) 5 5');
	} else if((svg.selected.shepherd instanceof animationGroup || svg.selected instanceof SVGAnimationElement) &&
		(event.target.shepherd instanceof animationGroup || event.target.hasAnimation()) &&
		!(svg.selected instanceof SVGAnimateElement) || (svg.selected instanceof SVGAnimateElement && anigenManager.classes.windowAnimation.selected.length == 0)) {
		anigenManager.setCursor('url(_cursors/picker_time.png) 5 5');
	} else {
		if(event.shiftKey) {
			anigenManager.setCursor('url(_cursors/picker_stroke.png) 5 5');
		} else {
			anigenManager.setCursor('url(_cursors/picker_fill.png) 5 5');
		}
		
	}
	
	if((event.button == 1 || event.buttons == 4) && this.lastEvent) {
		var dX = Math.round((this.lastEvent.clientX - event.clientX)/svg.zoom);
		var dY = Math.round((this.lastEvent.clientY - event.clientY)/svg.zoom);
		this.lastEvent = event;
		svg.moveView(dX, dY);
		return;
	}
}

toolPicker.prototype.keyDown = function(event) {
	if(!svg) { return; }
	if(svg.selected instanceof SVGAnimateElement || svg.selected.shepherd instanceof SVGAnimateElement || !this.lastEvent || (this.lastEvent && this.lastEvent.target == svg.svgElement) || svg.selected == svg.svgElement) {
		return true;
	}
	if(event.shiftKey) {
		anigenManager.setCursor('url(_cursors/picker_stroke.png) 5 5');
	} else {
		anigenManager.setCursor('url(_cursors/picker_fill.png) 5 5');
	}
	return true;
}

toolPicker.prototype.keyUp = function(event) {
	if(event.shiftKey) {
		anigenManager.setCursor('url(_cursors/picker_stroke.png) 5 5');
	} else {
		anigenManager.setCursor('url(_cursors/picker_fill.png) 5 5');
	}
	return true;
}


