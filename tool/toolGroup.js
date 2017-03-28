/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Group selection tool
 */
function toolGroup() {
	tool.call(this);
}

toolGroup.prototype = Object.create(tool.prototype);

toolGroup.prototype.mouseDown = function(event) {
	if(!svg || !(svg instanceof root)) { return; }
	
	this.downEvent = event;
	this.lastEvent = event;
	
	if(event.button <= 1 && (event.target == svg.selected || event.target.isChildOf(svg.selected))) {
		this.target = svg.selected;
		anigenManager.setCursor('url(_cursors/group_active_held.png)');
	}
	
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
}

toolGroup.prototype.mouseClick = function(event) {
	if(!svg || !(svg instanceof root)) { return; }
	if(event.button != 0) { return; }
	if(event.target == svg.svgElement) {
		svg.select(svg.getCurrentLayer() || svg.svgElement);
		return;
	}
	
	if(typeof event.target.isInsensitive !== 'function' || event.target.isInsensitive()) { return; }
	
	var selectionTarget = event.target;
	while(selectionTarget.hasAnimation(true)) {
		selectionTarget = selectionTarget.getAnimations(true)[0];
	}
	
	
	if(event.ctrlKey) {
		svg.select(selectionTarget);
		return;
	}
	
	while(selectionTarget && selectionTarget.getViableParent()
		&& (selectionTarget.getViableParent() != svg.selected)
		&& (selectionTarget.getViableParent() != svg.selected.parentNode)
		&& (selectionTarget.getViableParent().getAttribute('inkscape:groupmode') != 'layer')
		&& !(selectionTarget.getViableParent() instanceof SVGSVGElement)) {
		selectionTarget = selectionTarget.getViableParent();
	}
	if(selectionTarget.isChildOf(svg.selected) && svg.selected != svg.svgElement && svg.selected.getAttribute('inkscape:groupmode') != 'layer') {
		// if the already selected element is a child of the candidate, the result would be jumping up a level, so it's dismissed
		svg.ui.selectionBox.showRotation = !svg.ui.selectionBox.showRotation;
		svg.select();
		return;
	}
	
	if(svg.selected == selectionTarget) { svg.ui.selectionBox.showRotation = !svg.ui.selectionBox.showRotation; }
	
	svg.select(selectionTarget);
}

toolGroup.prototype.mouseDblClick = function(event) {
	if(!svg || !(svg instanceof root)) { return; }
	if(typeof event.target.isInsensitive !== 'function' || event.target.isInsensitive()) { return; }
	
	if(event.target == svg.svgElement) {
		svg.select(svg.svgElement);
		return;
	}
	
	if(svg.selected.isChildOf(event.target)) { return; }
	
	
	
	if(svg.selected == event.target) {
		// if the clicked element is the leaf AND is already selected, switch to element editing tool and reselect
		if(anigenActual.tool == 2) {
			if(event.target.hasAnimation(true)) {
				svg.select(event.target.getAnimations(true)[0]);
			}
		} else {
			anigenActual.setTool(2);
			svg.select();
		}
		return;
	}
	
	var selectionTarget = event.target;
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

toolGroup.prototype.mouseMove = function(event) {
	if(!svg || !(svg instanceof root)) { return; }
	
	
	if(this.target && event.button <= 1) {
		anigenManager.setCursor('url(_cursors/group_active_held.png)');
	} else if((event.target.isChildOf(svg.selected) || event.target == svg.selected) && svg.selected != svg.svgElement) {
		anigenManager.setCursor('url(_cursors/group_active.png)');
	} else {
		anigenManager.setCursor('url(_cursors/group.png)');
	}
	
	if(!this.target || !(this.target instanceof SVGElement)) { return; }
	
	var CTM = this.target.getCTM();
	
	if(event.ctrlKey && !anigenActual.tools[0].target) {
		var fakeFrom = {};
		var fakeTo = {};
		if(Math.abs(event.clientX-this.downEvent.clientX) < Math.abs(event.clientY-this.downEvent.clientY)) {
			fakeFrom.clientX = 0;
			fakeFrom.clientY = this.lastEvent.clientY;
			fakeTo.clientX = 0;
			fakeTo.clientY = event.clientY;	
		} else {
			fakeFrom.clientX = this.lastEvent.clientX;
			fakeFrom.clientY = 0;
			fakeTo.clientX = event.clientX;	
			fakeTo.clientY = 0;	
		}
		evalFrom = svg.evaluateEventPosition(fakeFrom);
		evalTo = svg.evaluateEventPosition(fakeTo);
	} else {
		evalFrom = svg.evaluateEventPosition(this.lastEvent);
		evalTo = svg.evaluateEventPosition(event);
	}
	
	if(this.target.getAttribute('inkscape:groupmode') == 'layer') { return; }
	
	svg.ui.selectionBox.origin = null;
	this.target.translateBy(evalTo.x-evalFrom.x, evalTo.y-evalFrom.y, true);
	
	svg.gotoTime();
	svg.select();
	
	this.lastEvent = event;
}

toolGroup.prototype.mouseContextMenu = tool.prototype.mouseContextMenu;