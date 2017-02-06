/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Editor's main toolbar
 */
function infoContext() {
    this.container = document.createElement("div");
	this.seed();
}

infoContext.prototype.seed = function() {
	this.buttons = {};
	
	this.buttons.groupTool = new uiButton('near_me', 'anigenActual.tool = 1;', 'Group selection (F1)', { 'state': anigenActual.tool == 1 ? 1 : 0, 'radio': true, 'toggle': true, 'class': 'flip-h floatLeft' }).shepherd;
	this.buttons.elementTool = new uiButton('edit', 'anigenActual.tool = 2;', 'Element selection (F2)', { 'state': anigenActual.tool == 2 ? 1 : 0, 'radio': true, 'toggle': true, 'class': 'flip-v floatLeft' }).shepherd;
	this.buttons.zoomTool = new uiButton('search', 'anigenActual.tool = 3;', 'Zoom (F3)', { 'state': anigenActual.tool == 3 ? 1 : 0, 'radio': true, 'toggle': true, 'class': 'floatLeft' }).shepherd;
	this.buttons.pickerTool = new uiButton('colorize', 'anigenActual.tool = 4;', 'Attribute picker (F7)', { 'state': anigenActual.tool == 4 ? 1 : 0, 'radio': true, 'toggle': true, 'class': 'floatLeft' }).shepherd;
	
	this.buttons.animate = new uiButton('power_settings_new', 'popup.macroAnimateMenu(anigenManager.classes.context.buttons.animate.container);', 'Animate element...', { 'toggle': true, 'class': 'floatLeft turn-90' }).shepherd;
	this.buttons.edit = new uiButton('reorder', 'overlay.macroEdit(svg.selected);', 'Edit attributes', { 'class': 'floatLeft' }).shepherd;
	this.buttons.children = new uiButton('details', 'popup.macroChildren(anigenManager.classes.context.buttons.children.container, svg.selected);', 'Child nodes...', { 'toggle': true, 'class': 'floatLeft' }).shepherd;
	this.buttons.parent = new uiButton('change_history', 'svg.select(svg.selected.getViableParent());', 'Select parent', { 'class': 'floatLeft' } ).shepherd;
	
	this.buttons.keyframePrev = new uiButton('arrow_back', 'if(svg.selected instanceof SVGAnimationElement) { svg.gotoTime(svg.selected.getPreviousTime()); } else if(svg.selected.shepherd && svg.selected.shepherd instanceof animationGroup) { svg.gotoTime(svg.selected.shepherd.getPreviousTime());}', 'Jump to previous keyframe (Ctrl+Left)', { 'class': 'floatLeft' }).shepherd;
	this.buttons.keyframeNext = new uiButton('arrow_forward', 'if(svg.selected instanceof SVGAnimationElement) { svg.gotoTime(svg.selected.getNextTime()); } else if(svg.selected.shepherd && svg.selected.shepherd instanceof animationGroup) { svg.gotoTime(svg.selected.shepherd.getNextTime()); }', 'Jump to next keyframe (Ctrl+Left)', { 'class': 'floatLeft' }).shepherd;
	
	this.buttons.layers = new uiButton('layers', 'anigenManager.classes.windowLayers.toggle();', 'Show layers (Ctrl+Shift+L)', { 'toggle': true }).shepherd;
	this.buttons.keyframes = new uiButton('hourglass_empty', 'anigenManager.classes.windowAnimation.toggle();', 'Show animation keyframes (Ctrl+Shift+K)', { 'toggle': true }).shepherd;
	this.buttons.colors = new uiButton('format_paint', 'anigenManager.classes.windowColors.toggle();', 'Show fill and stroke', { 'toggle': true }).shepherd;
	this.buttons.tree = new uiButton('share', 'anigenManager.named.left.toggle();anigenManager.classes.rulerH.refresh();anigenManager.classes.rulerV.refresh();anigenActual.settings.set("tree", !(anigenActual.settings.get("tree")));', 'Show XML tree (Ctrl+Shift+X)', { 'toggle': true, 'class': 'turn-90' }).shepherd;
	
	
	// float setup
	this.buttons.layers.container.addClass('floatRight');
	this.buttons.keyframes.container.addClass('floatRight');
	this.buttons.colors.container.addClass('floatRight');
	this.buttons.tree.container.addClass('floatRight');
	
	// radio setup
	this.buttons.groupTool.setRadioChain(this.buttons.elementTool);
	this.buttons.elementTool.setRadioChain(this.buttons.zoomTool);
	this.buttons.zoomTool.setRadioChain(this.buttons.pickerTool);
	this.buttons.pickerTool.setRadioChain(this.buttons.groupTool);
	
	
	// container fill
	this.container.appendChild(this.buttons.groupTool.container);
	this.container.appendChild(this.buttons.elementTool.container);
	this.container.appendChild(this.buttons.zoomTool.container);
	this.container.appendChild(this.buttons.pickerTool.container);
	this.container.appendChild(new uiBreak('floatLeft'));
	this.container.appendChild(this.buttons.animate.container);
	this.container.appendChild(this.buttons.edit.container);
	this.container.appendChild(this.buttons.children.container);
	this.container.appendChild(this.buttons.parent.container);
	this.container.appendChild(new uiBreak('floatLeft'));
	this.container.appendChild(this.buttons.keyframePrev.container);
	this.container.appendChild(this.buttons.keyframeNext.container);
	
	this.container.appendChild(this.buttons.tree.container);
	this.container.appendChild(this.buttons.layers.container);
	this.container.appendChild(this.buttons.colors.container);
	this.container.appendChild(this.buttons.keyframes.container);
	
	
	this.refresh();
};

infoContext.prototype.refresh = function() {
	var childNodes = null;
	
	
	if(svg.selected != null) {
		var prevTime, nextTime;
		if(svg.selected instanceof SVGAnimationElement) {
			this.buttons.keyframes.enable();
			if(this.buttons.keyframes.state == 1) {
				anigenManager.classes.windowAnimation.show();
			}
			prevTime = svg.selected.getPreviousTime();
			nextTime = svg.selected.getNextTime();
		} else if(svg.selected.shepherd && (svg.selected.shepherd instanceof animationGroup || svg.selected.shepherd instanceof animatedViewbox)) {
			this.buttons.keyframes.enable();
			if(this.buttons.keyframes.state == 1) {
				anigenManager.classes.windowAnimation.show();
			}
			prevTime = svg.selected.shepherd.getPreviousTime();
			nextTime = svg.selected.shepherd.getNextTime();
		} else {
			this.buttons.keyframes.disable();
			//this.buttons.keyframes.setState(0);
		}
		if(prevTime != null) {
			this.buttons.keyframePrev.enable();
		} else {
			this.buttons.keyframePrev.disable();
		}
		if(nextTime != null) {
			this.buttons.keyframeNext.enable();
		} else {
			this.buttons.keyframeNext.disable();
		}
		
		childNodes = [];
		
		for (var i = 0; i < svg.selected.children.length; i++) {
			if(svg.selected.children[i].getAttribute("anigen:lock") == 'interface') { continue; }
			if(svg.selected.children[i].getAttribute("anigen:lock") == 'skip') {
				for(var j = 0; j < svg.selected.children[i].children.length; j++) {
					childNodes.push({
						type: 'text',
						text: "<span class='nodeName'>&lt;" + svg.selected.children[i].children[j].nodeName + "&gt;</span> " + svg.selected.children[i].children[j].id,
						id: svg.selected.children[i].children[j].id
					});
				}
				continue;
			}
			svg.selected.children[i].generateId();
			childNodes.push({
				type: 'text',
				text: "<span class='nodeName'>&lt;" + svg.selected.children[i].nodeName + "&gt;</span> " + svg.selected.children[i].id,
				id: svg.selected.children[i].id
			});
		}
		
		this.buttons.animate.enable();
		this.buttons.edit.enable();
		
		if(childNodes.length == 0) {
			this.buttons.children.disable();
		} else {
			this.buttons.children.enable();
		}
		
		if(svg.selected.nodeName.toLowerCase() == 'svg') {
			this.buttons.parent.disable();
		} else {
			this.buttons.parent.enable();
		}
	} else {
		this.buttons.animate.disable();
		this.buttons.edit.disable();
		this.buttons.parent.enable();
	}
};
