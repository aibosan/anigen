/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Element selection tool
 */
function toolElement() {
	toolGroup.call(this);
}

toolElement.prototype = Object.create(toolGroup.prototype);

toolElement.prototype.mouseDown = function(event) {
	if(!svg || !(svg instanceof root)) { return; }
	
	this.lastEvent = event;
	
	if(event.target == svg.selected || event.target.isChildOf(svg.selected)) {
		this.target = svg.selected;
	}
	
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
}

toolElement.prototype.mouseClick = function(event) {
	if(!svg || !(svg instanceof root)) { return; }
	if(event.button != 0) { return; }
	if(svg.selected instanceof SVGAnimationElement && svg.selected.isChildOf(event.target)) { return; }
	if(typeof event.target.isInsensitive !== 'function' || event.target.isInsensitive()) { return; }
	
	svg.select(event.target);
}

toolElement.prototype.mouseDblClick = function(event) {
	if(!svg || !(svg instanceof root)) { return; }
	
	if(!event.target.isChildOf(svg.ui.highlight.container) && (
		typeof event.target.isInsensitive !== 'function' || event.target.isInsensitive())) { return; }
	
	if(event.target == svg.svgElement) {
		svg.select(svg.svgElement);
		return;
	}
	
	var target = event.target;
	
	if(target.isChildOf(svg.ui.highlight.container)) {
		
		target = svg.selected;
		
		if(target instanceof SVGPathElement) {
			var adjusted = svg.evaluateEventPosition(event);
			
			target.split(adjusted, true);
			
			svg.ui.clearSelect();
			
			svg.select();
			return;
		}
	}
	
	if(svg.selected.isChildOf(target)) { return; }
	
	
	
	if(svg.selected == target) {
		// if the clicked element is the leaf AND is already selected, switch to element editing tool and reselect
		if(anigenActual.tool == 2) {
			if(target.hasAnimation(true)) {
				svg.select(target.getAnimations(true)[0]);
			}
		} else {
			anigenActual.setTool(2);
			svg.select();
		}
		return;
	}
	
	var selectionTarget = target;
	if(selectionTarget.hasAnimation(true)) {
		// if clicked element has animations, first one is selected
		selectionTarget = selectionTarget.getAnimations(true)[0];
	}
	
	if(!selectionTarget.getViableParent()) { return; }		// in case no viable parent exists
	while(selectionTarget.getViableParent() && (selectionTarget.getViableParent().getAttribute('inkscape:groupmode') != 'layer') && selectionTarget.getViableParent() instanceof SVGElement
		&& selectionTarget.getViableParent() != svg.selected) {
			// works up from the clicked element to one just inside the currently selected object
		selectionTarget = selectionTarget.getViableParent();
	}
	if(svg.selected.isChildOf(selectionTarget)) {
		// once again, prevents selecting a parent object
		return;
	}
	
	svg.select(selectionTarget);

}

toolElement.prototype.mouseMove = function(event) {
	if(event.target.isChildOf(svg.ui.highlight.container)) {
		anigenManager.setCursor('url(_cursors/element_grab.png)');
	} else {
		anigenManager.setCursor('url(_cursors/element.png)');
	}
}