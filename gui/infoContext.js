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
	
	this.buttons.groupTool = new uiButton('near_me', 'anigenActual.setTool(1, true);', 'Group selection (F1)', { 'state': anigenActual.tool == 1 ? 1 : 0, 'radio': true, 'toggle': true, 'class': 'flip-h floatLeft' }).shepherd;
	this.buttons.elementTool = new uiButton('edit', 'anigenActual.setTool(2, true);', 'Element selection (F2)', { 'state': anigenActual.tool == 2 ? 1 : 0, 'radio': true, 'toggle': true, 'class': 'flip-v floatLeft' }).shepherd;
	this.buttons.zoomTool = new uiButton('search', 'anigenActual.setTool(3, true);', 'Zoom (F3)', { 'state': anigenActual.tool == 3 ? 1 : 0, 'radio': true, 'toggle': true, 'class': 'floatLeft' }).shepherd;
	this.buttons.pickerTool = new uiButton('colorize', 'anigenActual.setTool(4, true);', 'Attribute picker (F7)', { 'state': anigenActual.tool == 4 ? 1 : 0, 'radio': true, 'toggle': true, 'class': 'flip-v floatLeft' }).shepherd;
	
	this.buttons.animate = new uiButton('power_settings_new', 'popup.macroAnimateMenu(anigenManager.classes.context.buttons.animate.container);', 'Animate element...', { 'toggle': true, 'class': 'floatLeft turn-90' }).shepherd;
	this.buttons.edit = new uiButton('reorder', 'overlay.macroEdit(svg.selected);', 'Edit attributes', { 'class': 'floatLeft' }).shepherd;
	this.buttons.children = new uiButton('details', 'popup.macroChildren(anigenManager.classes.context.buttons.children.container, svg.selected);', 'Child nodes...', { 'toggle': true, 'class': 'floatLeft' }).shepherd;
	this.buttons.parent = new uiButton('change_history', 'svg.select(svg.selected.getViableParent());', 'Select parent', { 'class': 'floatLeft' } ).shepherd;
	
	this.buttons.keyframePrev = new uiButton('arrow_back', 'var trg = svg.selected.shepherd || svg.selected;if(typeof trg.getClosest === "function") { svg.gotoTime(trg.getClosest().previous.time); }', 'Jump to previous keyframe (1 / Ctrl+Left)', { 'class': 'floatLeft' }).shepherd;
	this.buttons.keyframeNext = new uiButton('arrow_forward', 'var trg = svg.selected.shepherd || svg.selected;if(typeof trg.getClosest === "function") { svg.gotoTime(trg.getClosest().next.time); }', 'Jump to next keyframe (3 / Ctrl+Right)', { 'class': 'floatLeft' }).shepherd;
	
	this.buttons.layers = new uiButton('layers', 'anigenManager.classes.windowLayers.toggle();', 'Show layers (Ctrl+Shift+L)', { 'toggle': true }).shepherd;
	this.buttons.keyframes = new uiButton('hourglass_empty', 'anigenManager.classes.windowAnimation.toggle();', 'Show animation keyframes (Ctrl+Shift+K)', { 'toggle': true }).shepherd;
	this.buttons.colors = new uiButton('format_paint', 'anigenManager.classes.windowColors.toggle();', 'Show fill and stroke', { 'toggle': true }).shepherd;
	this.buttons.log = new uiButton('toc', 'anigenManager.named.bottom.toggle();anigenManager.refresh();anigenActual.settings.set("bottom", !(anigenActual.settings.get("bottom")));', 'Show event log', { 'toggle': true, 'class': 'flip-h' }).shepherd;
	this.buttons.tree = new uiButton('share', 'anigenManager.named.left.toggle();anigenManager.classes.rulerH.refresh();anigenManager.classes.rulerV.refresh();anigenActual.settings.set("tree", !(anigenActual.settings.get("tree")));', 'Show XML tree (Ctrl+Shift+X)', { 'toggle': true, 'class': 'turn-90' }).shepherd;
	
	
	/* tool-sensitive nodes */
	this.toolGroups = [];
	this.toolGroups[0] = document.createElement('div');
	this.toolGroups[1] = document.createElement('div');
	this.toolGroups[2] = document.createElement('div');
	this.toolGroups[3] = document.createElement('div');
	this.toolGroups[4] = document.createElement('div');
	
	this.toolButtons = {};
	/*
	this.toolButtons.element = {};
	this.toolButtons.element.toPath = new uiButton('gesture', 'svg.toPath(svg.selected);', 'Convert selected element to paths', { 'class': 'floatLeft' }).shepherd;
	
	this.toolGroups[2].appendChild(new uiBreak('floatLeft'));
	this.toolGroups[2].appendChild(this.toolButtons.element.toPath.container);
	*/
	
	this.toolButtons.group = {};
	
	this.toolButtons.group.rotateLeft = new uiButton('rotate_right', 'svg.rotate(svg.selected, { "angle": 90 }, false, true);', 'Rotate 90° clockwise', { 'class': 'floatLeft' }).shepherd;
	this.toolButtons.group.rotateRight = new uiButton('rotate_left', 'svg.rotate(svg.selected, { "angle": -90 }, false, true);', 'Rotate 90° counterclockwise', { 'class': 'floatLeft' }).shepherd;
	this.toolButtons.group.flipH = new uiButton('flip', 'svg.scale(svg.selected, { "scaleX": -1, "scaleY": 1}, false, true);', 'Flip horizontally', { 'class': 'floatLeft' }).shepherd;
	this.toolButtons.group.flipV = new uiButton('flip', 'svg.scale(svg.selected, { "scaleX": 1, "scaleY": -1}, false, true);', 'Flip vertically', { 'class': 'floatLeft turn-90' }).shepherd;
	
	this.toolButtons.group.moveBot = new uiButton('vertical_align_bottom', 'svg.selected.moveBottom(true);window.dispatchEvent(new Event("treeSeed"));svg.select();', 'Lower element to the bottom (end)', { 'class': 'floatLeft' }).shepherd;
	this.toolButtons.group.moveDown = new uiButton('arrow_downward', 'svg.selected.moveDown(true);window.dispatchEvent(new Event("treeSeed"));svg.select();', 'Lower element one step (page down)', { 'class': 'floatLeft' }).shepherd;
	this.toolButtons.group.moveUp = new uiButton('arrow_upward', 'svg.selected.moveUp(true);window.dispatchEvent(new Event("treeSeed"));svg.select();', 'Raise element one step (page up)', { 'class': 'floatLeft' }).shepherd;
	this.toolButtons.group.moveTop = new uiButton('vertical_align_top', 'svg.selected.moveTop(true);window.dispatchEvent(new Event("treeSeed"));svg.select();', 'Raise element to the top (home)', { 'class': 'floatLeft' }).shepherd;
	
	this.toolGroups[1].appendChild(new uiBreak('floatLeft'));
	this.toolGroups[1].appendChild(this.toolButtons.group.rotateLeft.container);
	this.toolGroups[1].appendChild(this.toolButtons.group.rotateRight.container);
	this.toolGroups[1].appendChild(this.toolButtons.group.flipH.container);
	this.toolGroups[1].appendChild(this.toolButtons.group.flipV.container);
	
	this.toolGroups[1].appendChild(new uiBreak('floatLeft'));
	this.toolGroups[1].appendChild(this.toolButtons.group.moveBot.container);
	this.toolGroups[1].appendChild(this.toolButtons.group.moveDown.container);
	this.toolGroups[1].appendChild(this.toolButtons.group.moveUp.container);
	this.toolGroups[1].appendChild(this.toolButtons.group.moveTop.container);
	
	
	
	this.toolButtons.zoom = {};
	
	this.toolButtons.zoom.zoomPlus = new uiButton('add', 'svg.zoomAround(null, null, true);', 'Zoom in', { 'class': 'floatLeft' }).shepherd;
	this.toolButtons.zoom.zoomMinus = new uiButton('remove', 'svg.zoomAround(null, null, false);', 'Zoom out', { 'class': 'floatLeft' }).shepherd;
	this.toolButtons.zoom.zoomReset = new uiButton('search', 'svg.zoom = 1; svg.refreshUI(true);', 'Reset zoom', { 'class': 'floatLeft' }).shepherd;
	
	this.toolGroups[3].appendChild(new uiBreak('floatLeft'));
	this.toolGroups[3].appendChild(this.toolButtons.zoom.zoomPlus.container);
	this.toolGroups[3].appendChild(this.toolButtons.zoom.zoomMinus.container);
	this.toolGroups[3].appendChild(new uiBreak('floatLeft'));
	this.toolGroups[3].appendChild(this.toolButtons.zoom.zoomReset.container);
	
	
	// float setup
	this.buttons.layers.container.addClass('floatRight');
	this.buttons.keyframes.container.addClass('floatRight');
	this.buttons.colors.container.addClass('floatRight');
	this.buttons.log.container.addClass('floatRight');
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
	
	for(var i = 0; i < this.toolGroups.length; i++) {
		this.toolGroups[i].addClass('floatLeft');
		this.toolGroups[i].style.display = 'none';
		this.container.appendChild(this.toolGroups[i]);
	}
	
	this.container.appendChild(this.buttons.tree.container);
	this.container.appendChild(this.buttons.log.container);
	this.container.appendChild(this.buttons.layers.container);
	this.container.appendChild(this.buttons.colors.container);
	this.container.appendChild(this.buttons.keyframes.container);
	
	
	this.refresh();
}

infoContext.prototype.refreshButtons = function() {
	var target = svg.selected;
	
	for(var i = 0; i < this.toolGroups.length; i++) {
		if(i == anigenActual.tool) {
			this.toolGroups[i].style.display = null;
		} else {
			this.toolGroups[i].style.display = 'none';
		}
	}
	
	if(anigenActual.tool == 2) {
		this.toolGroups[1].style.display = null;
	}
	
	if(!target) { return; }
	
	if(target.isAnimation() || (target.shepherd && target.shepherd.isAnimation())) {
		//this.buttons.animate.disable();
		this.buttons.keyframes.enable();
		if(this.buttons.animate.state == 1) {
			anigenManager.classes.windowAnimation.show();
		}
	} else {
		//this.buttons.animate.enable();
		this.buttons.keyframes.disable();
		anigenManager.classes.windowAnimation.hide();
	}
	
	
	
	
	if(!target.parentNode) { return; }
	
	switch(anigenActual.tool) {
		case 0:		// anchor tool (not selectable)
			break;
		case 2:		// element selection
		/*
			if(typeof svg.selected.toPath !== 'function' || svg.selected instanceof SVGSVGElement || svg.selected instanceof SVGDefsElement) {
				this.toolButtons.element.toPath.disable();
			} else {
				this.toolButtons.element.toPath.enable();
			}
		*/
		case 1:		// group selection
		
			if(svg.selected instanceof SVGSVGElement || !svg.selected.isVisualElement()) {
				for(var i in this.toolButtons.group) {
					this.toolButtons.group[i].disable();
				}
			} else {
				for(var i in this.toolButtons.group) {
					this.toolButtons.group[i].enable();
				}
				var viable = typeof target.parentNode.getViableChildren === 'function' ? target.parentNode.getViableChildren() : [];
				var i = viable.indexOf(target);
				if(i == 0) {
					this.toolButtons.group.moveBot.disable();
					this.toolButtons.group.moveDown.disable();
				}
				if(i == viable.length-1) {
					this.toolButtons.group.moveUp.disable();
					this.toolButtons.group.moveTop.disable();
				}
			}
			break;
		case 3:		// zoom tool
			if(svg.zoom == 1) {
				this.toolButtons.zoom.zoomReset.disable();
			} else {
				this.toolButtons.zoom.zoomReset.enable();
			}
			break;
		case 4:		// picker
			break;
	}
	
	
}

infoContext.prototype.refreshKeyframeButtons = function() {
	var target = svg.selected.shepherd || svg.selected;
	
	var hasPrevious = false;
	var hasNext = false;
	
	if(!target.isAnimation()) {
		this.buttons.keyframePrev.disable();
		this.buttons.keyframeNext.disable();
		return;
	}

	var progress = target.getProgress();
	
	target.getRepeatCount();
	
	if(progress.progress > 0 || progress.progress == 0 && 
		progress.begin < svg.svgElement.getCurrentTime()) {
			hasPrevious = true; 
	
	}
	if(progress.progress < 1 || progress.progress == 1 &&
		(target.repeatCount == 'indefinite' || progress.loop < target.repeatCount) ) {
			hasNext = true;
	}
	
	if(hasPrevious) {
		this.buttons.keyframePrev.enable();
	} else {
		this.buttons.keyframePrev.disable();
	}
	if(hasNext) {
		this.buttons.keyframeNext.enable();
	} else {
		this.buttons.keyframeNext.disable();
	}
}

infoContext.prototype.refresh = function() {
	var childNodes = null;
	
	if(svg.selected != null) {
		if(svg.selected instanceof SVGAnimationElement) {
			this.buttons.keyframes.enable();
			if(this.buttons.keyframes.state == 1) {
				anigenManager.classes.windowAnimation.show();
			}
		} else if(svg.selected.shepherd && (svg.selected.shepherd instanceof animationGroup || svg.selected.shepherd instanceof animatedViewbox)) {
			this.buttons.keyframes.enable();
			if(this.buttons.keyframes.state == 1) {
				anigenManager.classes.windowAnimation.show();
			}
		} else {
			this.buttons.keyframes.disable();
			//this.buttons.keyframes.setState(0);
		}
		
		this.refreshKeyframeButtons();
		this.refreshButtons();
		
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
}
