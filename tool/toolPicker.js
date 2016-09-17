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
	if(!svg || !(svg instanceof root)) { return; }
	
	if(event.target.original) { event.target = event.target.original; }
	
	if(svg.selected instanceof SVGAnimationElement && event.shiftKey && event.target.hasAnimation() && event.getAnimations()[0]) {
		svg.selected.pasteTiming(event.getAnimations()[0]);
		return;
	}
	
	
	if(svg.selected instanceof SVGAnimateMotionElement) {
		// motion gets a new path if the target is a path
		if(event.target instanceof SVGPathElement) {
			svg.selected.setPath(event.target, true);
		}
		return;
	} else if(svg.selected instanceof SVGAnimateElement) {
		// attribute animation gets new values for selected animation keyframes (if applicable)
		if(windowAnimation.selected.length == 0) { return; }
		var val = event.target.style[svg.selected.getAttribute('attributeName')] || event.target.getAttribute(svg.selected.getAttribute('attributeName'));
		if(!val) {
			// if no values is found, reverts to the parent's default value instead
			val = svg.selected.parentNode.style[svg.selected.getAttribute('attributeName')] || svg.selected.parentNode.getAttribute(svg.selected.getAttribute('attributeName'));
		}
		for(var i = 0; i < windowAnimation.selected.length; i++) {
			svg.selected.setValue(windowAnimation.selected[i], val, true);
		}
		windowAnimation.refreshKeyframes();
		svg.ui.edit(svg.selected);
		return;
	}
	
	
	var oldStyle = svg.selected.getAttribute('style');
	if(event.shiftKey) {
		svg.selected.style.stroke = event.target.style.fill;
		svg.selected.style.strokeOpacity = event.target.style.fillOpacity || 1;
	} else {
		svg.selected.style.fill = event.target.style.fill || 'none';
		svg.selected.style.fillOpacity = event.target.style.fillOpacity || 1;
	}
	svg.history.add(new historyAttribute(svg.selected.id,
		{ 'style': oldStyle }, { 'style': svg.selected.getAttribute('style') }, true));
	
}


