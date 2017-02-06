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
	
	this.lastEvent = event;
	
	if(event.target == svg.selected || event.target.isChildOf(svg.selected)) {
		this.target = svg.selected;
	}
	
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
}

toolGroup.prototype.mouseClick = function(event) {
	if(!svg || !(svg instanceof root)) { return; }
	if(event.button != 0) { return; }
	if(event.target == svg.svgElement) {
		if(svg.selected instanceof SVGGElement) {
			svg.select(svg.getCurrentLayer() || svg.svgElement);
		}
		return;
	}
	
	if(typeof event.target.isInsensitive !== 'function' || event.target.isInsensitive()) { return; }
	
	var selectionTarget = event.target;
	while(selectionTarget.hasAnimation()) {
		selectionTarget = selectionTarget.getAnimations()[0];
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
		return;
	}
	
	if(svg.selected == selectionTarget) { svg.ui.selectionBox.showRotation = !svg.ui.selectionBox.showRotation; }
	svg.select(selectionTarget);
}

toolGroup.prototype.mouseDblClick = function(event) {
	if(!svg || !(svg instanceof root)) { return; }
	if(typeof event.target.isInsensitive !== 'function' || event.target.isInsensitive()) { return; }
	
	if(svg.selected.isChildOf(event.target)) { return; }
		
	var selectionTarget = event.target;
	while(selectionTarget.hasAnimation()) {
		// if clicked element has animations, first one is selected
		selectionTarget = selectionTarget.getAnimations()[0];
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
	
	if((event.button == 1 || event.buttons == 4) && this.lastEvent) {
		var dX = Math.round((this.lastEvent.clientX - event.clientX)/svg.zoom);
		var dY = Math.round((this.lastEvent.clientY - event.clientY)/svg.zoom);
		this.lastEvent = event;
		svg.moveView(dX, dY);
		return;
	}
	
	if(!this.target || !(this.target instanceof SVGElement)) { return; }
	
	var CTM = this.target.getCTM();
	evalFrom = svg.evaluateEventPosition(this.lastEvent);
	evalTo = svg.evaluateEventPosition(event);
	
	if(this.target.getAttribute('inkscape:groupmode') == 'layer') { return; }
	
	this.target.translateBy(evalTo.x-evalFrom.x, evalTo.y-evalFrom.y, true);
	
	svg.gotoTime();
	svg.select();
	
	this.lastEvent = event;
}

toolGroup.prototype.mouseContextMenu = tool.prototype.mouseContextMenu;