/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Fallback "tool" for handling anchors (UI nodes)
 */
function toolAnchor() {
	tool.call(this);
}

toolAnchor.prototype = Object.create(tool.prototype);

toolAnchor.prototype.mouseClick = function(event) {
	var keys = { 'ctrlKey': event.ctrlKey == true, 'altKey': event.altKey == true, 'shiftKey': event.shiftKey == true };
	
	if(this.target) {
		if(!event.shiftKey && !event.altKey && !event.ctrlKey) {
			svg.ui.clearSelect();
			svg.ui.addSelect(this.target);
		} else if(event.shiftKey) {
			svg.ui.toggleSelect(this.target);
		}
		if(this.target.actions && this.target.actions.click) {
			this.target.click(keys);
		}
	}
}

toolAnchor.prototype.mouseMove = function(event) {
	if(!svg || !(svg instanceof root)) { return; }
	
	var threshold = 3;
	if(!this.downEvent || (Math.abs(this.downEvent.clientX-event.clientX)<threshold && Math.abs(this.downEvent.clientY-event.clientY)<threshold)) {
		return;
	}
	
	var evaluated = svg.evaluateEventPosition(event);
	var keys = { 'ctrlKey': event.ctrlKey == true, 'altKey': event.altKey == true, 'shiftKey': event.shiftKey == true };
	
	var previousAbsolute = this.target.getAbsolute();
	
	var dAbsolute = { 'x': evaluated.x - previousAbsolute.x, 'y': evaluated.y - previousAbsolute.y };
	
	if(!this.target.selected) {
		if(this.target.selectable) {
			svg.ui.clearSelect();
			svg.ui.addSelect(this.target);
		} else {
			this.target.moveBy(dAbsolute.x, dAbsolute.y, keys);
		}
	}
	
	if(this.target.selectable) {
		for(var i = 0; i < svg.ui.selectedIndexes.length; i++) {
			var candidate = svg.ui.anchorContainer.children[svg.ui.selectedIndexes[i]];
			if(!candidate) { break; }
			if(!candidate.shepherd) { continue; }
			candidate.shepherd.moveBy(dAbsolute.x, dAbsolute.y, keys);
		}
	}
	
	if(svg && svg.ui && svg.ui.highlight && svg.ui.selectionBox) {
		svg.ui.highlight.refresh();
		svg.ui.selectionBox.refresh();
	}
	
	anigenManager.classes.windowAnimation.refreshKeyframes(true);
	
	this.lastEvent = event;
}

toolAnchor.prototype.mouseUp = function(event) {
	var keys = { 'ctrlKey': event.ctrlKey == true, 'altKey': event.altKey == true, 'shiftKey': event.shiftKey == true };
	
	if(typeof this.target.mouseUp === 'function') {
		this.target.mouseUp(keys);
	}
	this.lastEvent = null;
	this.downEvent = null;
}