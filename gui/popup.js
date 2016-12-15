/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Popup for menus and other small UI notifications
 */
function popup() {
	this.container = document.createElement("div");
	this.container.setAttribute('class', 'popup');
	
    this.content = document.createElement("div");

    this.container.appendChild(this.content);
	
	document.body.appendChild(this.container);
	
	this.container.addEventListener("click", function(event) { 
		event.preventDefault ? event.preventDefault() : event.returnValue = false;
		event.stopPropagation ? event.stopPropagation() : window.event.cancelBubble = true;
	}, false);
	
	this.hidden = true;
	this.event = null;
}

popup.prototype.hide = function() {
	this.container.style.display = 'none';
	this.container.style.opacity = '0';
	this.hidden = true;
	this.event = null;
	document.body.focus();
}

popup.prototype.show = function(target) {
	this.event = window.event;
	var toX, toY;
	var toX2;
	
	this.container.style.top = '0px';
	this.container.style.left = '0px';
	this.container.style.display = 'block';
	this.container.style.opacity = '0';
	
	var size = this.container.getBoundingClientRect();
	var width = (size.right);
	var height = (size.bottom);
	
	if(target) {
		if(target.x != null && target.y != null) {
			toX = target.x;
			toY = target.y;
		} else if(typeof target.getBoundingClientRect === 'function') {
			var rect = target.getBoundingClientRect();
			toX = Math.round(rect.left);
			toX2 = Math.round(rect.right);
			toY = Math.round(rect.bottom + 2);
		}
	} else {
		toX = window.innerWidth/2 - width/2;
		toY = window.innerHeight/2 - height/2;
	}
	
	if((toX + width) > window.innerWidth) {
		if(toX2 != null) {
			toX = toX2 - width;
		} else {
			toX = toX - width - 2;
		}
	}
	if((toY + height) > window.innerHeight) { toY = toY - height - 2; }
	
	toX = Math.round(toX);
	toY = Math.round(toY);
	
	this.container.style.top = toY + 'px';
	this.container.style.left = toX + 'px';
	this.container.style.opacity = '1';
	this.hidden = false;
}

popup.prototype.isHidden = function() {
	return this.hidden;
}

popup.prototype.reset = function() {
	this.hide();
	this.content.removeChildren();
}

popup.prototype.add = function(element) {
	this.content.appendChild(element);
	return element;
}

popup.prototype.addButton = function(button) {
	this.content.appendChild(element);
}
popup.prototype.addButtonOk = function(action) {
	if(!action) { action = ""; }
	var button = document.createElement("button");
	button.setAttribute("class", "black");
	button.setAttribute("onclick", "popup.hide();"+action);
	button.appendChild(document.createTextNode("Ok"));
	this.content.appendChild(button);
}
popup.prototype.addButtonCancel = function(action) {
	if(!action) { action = ""; }
	var button = document.createElement("button");
	button.setAttribute("onclick", "popup.hide();"+action);
	button.appendChild(document.createTextNode("Cancel"));
	this.content.appendChild(button);
}

popup.prototype.confirmation = function(target, text, actionYes, actionNo) {
	this.reset();
	
	if(text) { this.add(build.p(text)); }
	
	this.addButtonOk(actionYes);
	this.addButtonCancel(actionNo);
	
	this.show(target);
}

popup.prototype.input = function(target, type, value, actionYes, actionNo) {
	this.reset();
	
	this.add(build.input(type, value));
	if(actionYes) {
		this.addButtonOk('var value = this.previousSibling.value;' + actionYes);
	} else {
		this.addButtonOk();
	}
	
	if(actionNo) {
		this.addButtonCancel('var value = this.previousSibling.previousSibling.value;' + actionNo);
	} else {
		this.addButtonCancel();
	}
	
	this.show(target);
}

popup.prototype.alert = function(target, text) {
	this.reset();
	
	this.add(build.p(text));
	
	this.addButtonOk();
	
	this.show(target);
}

popup.prototype.macroClock = function(target) {
	if(!target) { return; }
	this.reset();
	
	var value = infoEditor.clock.container.innerHTML;
	if(svg.svgElement.getCurrentTime() < 3600) {
		value = '00:' + value;
	}
	
	this.add(build.input('time', value, { 'step': '0.001' }));
	
	var action = "var time = this.previousSibling.getSeconds();";
		action += "svg.gotoTime(time);";
	
	this.addButtonOk(action);
	this.addButtonCancel();
	
	this.show(target);
}

popup.prototype.macroAnimationContextMenu = function(event, index) {
	this.reset();
	
	var tArray = [];
	var rAttributes = [];
	
	var canInbetween = false;
	for(var i = 0; i < windowAnimation.selected.length-1; i++) {
		if(windowAnimation.selected[i] == windowAnimation.selected[i+1]-1) {
			canInbetween = true;
			break;
		}
	}
	
	var hasSelection = windowAnimation.selected.length > 1;
	
	tArray.push([ build.icon("arrow-up-white"), "Move up" ]);
	tArray.push([ build.icon("plus-white"), "Duplicate" ]);
	tArray.push([ build.icon("arrow-down-white"), "Move down" ]);
	tArray.push([ "", "" ]);
	tArray.push([ build.icon("plus-black"), "Create inbetween" ]);
	tArray.push([ build.icon("clock-black"), "Balance " + (canInbetween ? 'selected' : 'keyframes') ]);
	tArray.push([ build.icon("arrow-double-horizontal-black"), "Invert " + (windowAnimation.selected.length > 1 ? 'selected' : 'keyframe') ]);
	tArray.push([ build.icon("trash-black"), "Remove " + (windowAnimation.selected.length > 1 ? 'selected' : 'keyframe') ]);
	
	rAttributes.push({ 'onclick': 'popup.hide();windowAnimation.contextMenuEvaluate("up", '+index+');' });
	rAttributes.push({ 'onclick': 'popup.hide();windowAnimation.contextMenuEvaluate("duplicate", '+index+');' });
	rAttributes.push({ 'onclick': 'popup.hide();windowAnimation.contextMenuEvaluate("down", '+index+');' });
	rAttributes.push({ 'class': 'hr' });

	if(canInbetween) {
		rAttributes.push({ 'onclick': 'popup.hide();windowAnimation.contextMenuEvaluate("inbetween", '+index+');' });
	} else {
		rAttributes.push({ 'class': 'disabled' });
	}
	
	if(canInbetween || windowAnimation.selected.length == 0) {
		rAttributes.push({ 'onclick': 'popup.hide();windowAnimation.contextMenuEvaluate("balance", '+index+');' });
	} else {
		rAttributes.push({ 'class': 'disabled' });
	}
	
	if(windowAnimation.animation.isInvertible()) {
		rAttributes.push({ 'onclick': 'popup.hide();windowAnimation.contextMenuEvaluate("invert", '+index+');' });
	} else {
		rAttributes.push({ 'class': 'disabled' });
	}
	rAttributes.push({ 'onclick': 'popup.hide();windowAnimation.contextMenuEvaluate("delete", '+index+');' });
	
	this.add(build.table(tArray, null, rAttributes)).setAttribute('class', 'popup-menu');
	
	this.show({'x': event.clientX, 'y': event.clientY });
}

popup.prototype.macroLayerContextMenu = function(event, targetId) {
	this.reset();
	
	var tArray = [];
	var rAttributes = [];
	
	var selText = windowAnimation.selected.length > 0 ? "selected" : "keyframes";
	
	tArray.push([ build.icon("plus-white"), "Add layer..." ]);
	tArray.push([ build.icon("edit-white"), "Rename layer..." ]);
	tArray.push([ "", "" ]);
	tArray.push([ build.icon("arrow-up-white"), "Raise layer" ]);
	tArray.push([ build.icon("arrow-down-white"), "Lower layer" ]);
	tArray.push([ "", "" ]);
	tArray.push([ build.icon("copy-white"), "Duplicate layer" ]);
	tArray.push([ build.icon("trash-black"), "Delete layer" ]);
	
	rAttributes.push({ 'onclick': 'popup.hide();windowLayers.contextMenuEvaluate("add", "'+targetId+'");' });
	rAttributes.push({ 'onclick': 'popup.hide();windowLayers.contextMenuEvaluate("rename", "'+targetId+'");' });
	rAttributes.push({ 'class': 'hr' });
	rAttributes.push({ 'onclick': 'popup.hide();windowLayers.contextMenuEvaluate("raise", "'+targetId+'");' });
	rAttributes.push({ 'onclick': 'popup.hide();windowLayers.contextMenuEvaluate("lower", "'+targetId+'");' });
	rAttributes.push({ 'class': 'hr' });
	rAttributes.push({ 'onclick': 'popup.hide();windowLayers.contextMenuEvaluate("duplicate", "'+targetId+'");' });
	rAttributes.push({ 'onclick': 'popup.hide();windowLayers.contextMenuEvaluate("delete", "'+targetId+'");' });
	
	
	this.add(build.table(tArray, null, rAttributes)).setAttribute('class', 'popup-menu');
	
	this.show({'x': event.clientX, 'y': event.clientY });
}

popup.prototype.macroContextMenu = function(target) {
	this.reset();
	var evaluated = svg.evaluateEventPosition( { 'clientX': target.x, 'clientY': target.y } );
	
	var tArray = [];
	var rAttributes = [];
	
	var selText = windowAnimation.selected.length > 0 ? "selected" : "keyframes";
	
	tArray.push([ build.icon("arrow-undo-black"), "Undo" ]);
	tArray.push([ build.icon("arrow-redo-black"), "Redo" ]);
	
	if(!(svg.selected instanceof SVGSVGElement) && svg.selected.getAttribute('anigen:type') != 'animationGroup' && !svg.selected.hasAnimation()) {
		tArray.push([ "", "" ]);
		tArray.push([ build.icon("gears-white"), "To animation state..." ]);
	} else if(svg.selected instanceof SVGAnimationElement || (svg.selected.shepherd && svg.selected.shepherd instanceof animationGroup)) {
		tArray.push([ "", "" ]);
		tArray.push([ build.icon("plus-white"), "Set value..." ]);
		tArray.push([ build.icon("gears-white"), "Create new state..." ]);
	}
	
	tArray.push([ "", "" ]);
	tArray.push([ build.icon("ex-white"), "Cut" ]);
	tArray.push([ build.icon("edit-white"), "Paste" ]);
	tArray.push([ build.icon("copy-white"), "Copy" ]);
	
	/*
	tArray.push([ "", "" ]);
	tArray.push([ build.icon("arrow-circle-white"), "Rotate..." ]);
	tArray.push([ build.icon("arrow-double-horizontal-white"), "Scale..." ]);
	*/
	tArray.push([ "", "" ]);
	tArray.push([ build.icon("copy-black"), "Duplicate" ]);
	tArray.push([ build.icon("trash-black"), "Delete" ]);
	
	if(svg.history.index >= 0) {
		rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.history.undo();' });
	} else {
		rAttributes.push({ 'class': 'disabled' });
	}
	
	if(svg.history.index < svg.history.histArray.length-1) {
		rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.history.redo();' });
	} else {
		rAttributes.push({ 'class': 'disabled' });
	}
	
	if(!(svg.selected instanceof SVGSVGElement) && svg.selected.getAttribute('anigen:type') != 'animationGroup' && !svg.selected.hasAnimation()) {
		rAttributes.push({ 'class': 'hr' });
		rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();popup.macroToAnimationState(null, svg.selected);' });
	} else if(svg.selected instanceof SVGAnimationElement || (svg.selected.shepherd && svg.selected.shepherd instanceof animationGroup)) {
		rAttributes.push({ 'class': 'hr' });
		rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();popup.macroAddValue();' });
		rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();popup.macroAddState();' });
	}
	
	rAttributes.push({ 'class': 'hr' });
	if(svg.selected != svg.svgElement) {
		rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.cut(svg.selected);' });
	} else {
		rAttributes.push({ 'class': 'disabled' });
	}
	
	if(svg.elementTemp) {
		if(svg.selected.getAttribute('inkscape:groupmode') == 'layer' || svg.selected == svg.svgElement) {
			rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.paste({ "x": '+evaluated.x+', "y": '+evaluated.y+' }, svg.selected);'});
		} else {
			rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.paste({ "x": '+evaluated.x+', "y": '+evaluated.y+' }, svg.selected.parentNode, svg.selected);'});
		}
	} else {
		rAttributes.push({ 'class': 'disabled' });
	}
	
	if(svg.selected != svg.svgElement) {
		rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.copy(svg.selected);' });
		/*
		rAttributes.push({ 'class': 'hr' });
		rAttributes.push({ 'onclick': 'event.stopPropagation();popup.rotate({ "id": "'+target.target.id+'", "x": '+target.x+', "y": '+target.y+' });' });
		rAttributes.push({ 'onclick': 'event.stopPropagation();popup.scale({ "id": "'+target.target.id+'", "x": '+target.x+', "y": '+target.y+' });' });
		*/
		rAttributes.push({ 'class': 'hr' });
		rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.duplicate(svg.selected);'});
		rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.duplicate(svg.selected);'});
	} else {
		rAttributes.push({ 'class': 'disabled' });
		/*
		rAttributes.push({ 'class': 'hr' });
		rAttributes.push({ 'class': 'disabled' });
		rAttributes.push({ 'class': 'disabled' });
		*/
		rAttributes.push({ 'class': 'hr' });
		rAttributes.push({ 'class': 'disabled' });
		rAttributes.push({ 'class': 'disabled' });
	}
	
	this.add(build.table(tArray, null, rAttributes)).setAttribute('class', 'popup-menu');
	
	this.show(target);
}

popup.prototype.macroAddValue = function(target) {
	var animation = svg.selected.shepherd || svg.selected;
	if(!animation || !(animation instanceof SVGAnimationElement)) { return; }
	
	animation.getKeyframes();
	
	this.reset();
	
	var closestFrame = animation.getClosestFrame(true);
	var closestTime = animation.getClosestTime(true);
	var relativeTime = animation.getCurrentProgress();
	
	var closestItem = animation.keyframes.getItem(closestFrame);
	
	var isEditing = Math.abs(relativeTime-closestItem.time) < 0.00001;
	
	if(animation instanceof animationGroup) {
		var chil = svg.animationStates[animation.groupName];
		var opt = [];
		for(var i = 0; i < chil.length; i++) {
			opt.push({'value': String(i), 'text': String(chil[i].name)});
		}
		var stateSelect = build.select(opt);
		
		this.add(stateSelect);
		
		stateSelect.setSelected(closestItem.value);
	} else {
		if(animation instanceof SVGAnimateTransformElement) {
			switch(animation.getAttribute('type')) {
				case 'rotate':
					this.add(build.input('number', closestItem.value.angle));
				case 'translate':
				case 'scale':
					this.add(build.input('number', closestItem.value.x));
					this.add(build.input('number', closestItem.value.y));
					break;
				case 'skewX':
				case 'skewY':
					this.add(build.input('number', closestItem.value.angle));
					break;
			}
		} else {
			return;
		}
	}
	
	if(animation.getCalcMode() == 'spline') {
		var temp = new spline();
		var splineSelect = temp.getSelect();
		var optCustom = document.createElement('option');
			optCustom.setAttribute('value', -1);
			optCustom.appendChild(document.createTextNode('custom'));
		splineSelect.appendChild(optCustom);
		splineSelect.setAttribute('onchange', "if(this.value == '-1') { this.addClass('small');this.nextElementSibling.removeClass('hidden'); } else { this.removeClass('small');this.nextElementSibling.addClass('hidden'); }");
		
		var closestSpline;
		if(closestFrame != null) {
			try {
				closestSpline = closestItem.spline ? closestItem.spline : animation.keyframes.getItem(closestFrame+1).spline;
			} catch(err) {
				// only one keyframe - no spline
				closestSpline = new spline();
			}
			
			closestSpline = closestSpline.type;
		} else {
			closestSpline = 0;
		}
		splineSelect.setSelected(closestSpline);
		
		this.add(splineSelect);
		
		var ins1 = build.input('number', '0', { 'min': 0, 'max': 1, 'step': 0.05, 'pattern': '[0-9]*' });
		var ins2 = build.input('number', '0', { 'min': 0, 'max': 1, 'step': 0.05, 'pattern': '[0-9]*' });
		var ins3 = build.input('number', '1', { 'min': 0, 'max': 1, 'step': 0.05, 'pattern': '[0-9]*' });
		var ins4 = build.input('number', '1', { 'min': 0, 'max': 1, 'step': 0.05, 'pattern': '[0-9]*' });
		var contSplineInput = document.createElement('span');
			contSplineInput.setAttribute('class', 'splineInput hidden');
			contSplineInput.appendChild(ins1);
			contSplineInput.appendChild(ins2);
			contSplineInput.appendChild(ins3);
			contSplineInput.appendChild(ins4);
		this.add(contSplineInput);
	}
	
	this.addButtonOk('svg.evaluateAddValue('+(isEditing)+', '+closestFrame+');');
	this.addButtonCancel();
	
	this.show(target);
}

popup.prototype.macroAddState = function(target) {
	var animation = svg.selected.shepherd || svg.selected;
	if(!animation || !(animation instanceof animationGroup)) { return; }
	
	this.reset();
	
	animation.getKeyframes();
	
	var relativeTime = animation.getCurrentProgress();
	var prevFrame = animation.getPreviousFrame(true);
	var nextFrame = animation.getNextFrame(true);
	
	if(relativeTime == null || prevFrame == null || nextFrame == null ||
		!animation.getAttribute('anigen:group') || !svg.animationStates) { return; }
	
	var prevItem = animation.keyframes.getItem(prevFrame);
	var nextItem = animation.keyframes.getItem(nextFrame);
	
	var states = svg.animationStates[animation.getAttribute('anigen:group')];
	
	if(!states) { return; }
	
	var progression;
	
	if(nextItem.time == prevItem.time) {
		progression = 0;
	} else {
		progression = (relativeTime-prevItem.time)/(nextItem.time-prevItem.time);
		if(nextItem.spline) {
			progression = nextItem.spline.getValue(progression);
		}
	}
		
	var inbetween = states[prevItem.value].inbetween(states[nextItem.value], progression);
	
	var preview = new imageSVG(inbetween.element, { width: 250, height: 250 });
	
	this.add(preview.container);
	
	this.add(build.input('text', states[prevItem.value].name+'-'+(Math.abs(progression*100)/100)+'-'+states[nextItem.value].name));
	
	this.addButtonOk('svg.evaluateGroupInbetween(null, "'+animation.getAttribute('anigen:group')+'", this.previousElementSibling.value, '+prevItem.value+', '+nextItem.value+', '+progression+');');
	this.addButtonCancel();
	
	this.show(target);
}



popup.prototype.macroMenuFile = function(target) {
	this.reset();
	
	var tArray = [];
	var rAttributes = [];
	
	tArray.push([ build.icon("folder-black"), "Open..." ]);
	tArray.push([ build.icon("floppy-white"), "Save" ]);
	tArray.push([ build.icon("floppy-black"), "Save and download" ]);
	tArray.push([ build.icon("arrow-end-black"), "Export..." ]);
	tArray.push([ "", "" ]);
	tArray.push([ build.icon("edit-black"), "Document properties..." ]);
	tArray.push([ build.icon("gears-black"), "Settings..." ]);
	
	rAttributes.push({ 'onclick': 'popup.hide();overlay.macroOpen();' });
	rAttributes.push({ 'onclick': 'popup.hide();svg.save(true);' });
	rAttributes.push({ 'onclick': 'popup.hide();svg.save();' });
	rAttributes.push({ 'onclick': 'popup.hide();overlay.macroExport();' });
	rAttributes.push({ 'class': 'hr' });
	rAttributes.push({ 'onclick': 'popup.hide();overlay.macroDocument();' });
	rAttributes.push({ 'onclick': 'popup.hide();overlay.macroSettings();' });
	
	this.add(build.table(tArray, null, rAttributes)).setAttribute('class', 'popup-menu');
	
	this.show(target);
}

popup.prototype.macroMenuEdit = function(target) {
	this.reset();
	
	var tArray = [];
	var rAttributes = [];
	
	tArray.push([ build.icon("arrow-undo-black"), "Undo" ]);
	tArray.push([ build.icon("arrow-redo-black"), "Redo" ]);
	tArray.push([ "", "" ]);
	tArray.push([ build.icon("ex-white"), "Cut" ]);
	tArray.push([ build.icon("edit-white"), "Paste" ]);
	tArray.push([ build.icon("copy-white"), "Copy" ]);
	tArray.push([ "", "" ]);
	tArray.push([ build.icon("copy-black"), "Duplicate" ]);
	tArray.push([ build.icon("trash-black"), "Delete" ]);
	
	if(svg.history.index >= 0) {
		rAttributes.push({ 'onclick': 'popup.hide();svg.history.undo();' });
	} else { rAttributes.push({ 'class': 'disabled' }); }
	if(svg.history.index < svg.history.histArray.length-1) {
		rAttributes.push({ 'onclick': 'popup.hide();svg.history.redo();' });
	} else { rAttributes.push({ 'class': 'disabled' }); }
	
	rAttributes.push({ 'class': 'hr' });
	rAttributes.push({ 'onclick': 'popup.hide();svg.cut(svg.selected);' });
	
	if(svg.selected.getAttribute('inkscape:groupmode') == 'layer' || svg.selected == svg.svgElement) {
		rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.paste(null, svg.selected);'});
	} else {
		rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.paste(null, svg.selected.parentNode, svg.selected);'});
	}
	
	rAttributes.push({ 'onclick': 'popup.hide();svg.copy(svg.selected);' });
	rAttributes.push({ 'class': 'hr' });
	rAttributes.push({ 'onclick': 'popup.hide();svg.duplicate(svg.selected);' });
	rAttributes.push({ 'onclick': 'popup.hide();svg.delete(svg.selected);' });

	
	if(svg.selected == svg.svgElement) {
		rAttributes[3] = { 'class': 'disabled' };
		rAttributes[5] = { 'class': 'disabled' };
		rAttributes[7] = { 'class': 'disabled' };
		rAttributes[8] = { 'class': 'disabled' };
	}
	
	if(!svg.elementTemp) {
		rAttributes[4] = { 'class': 'disabled' };
	}
	
	this.add(build.table(tArray, null, rAttributes)).setAttribute('class', 'popup-menu');
	
	this.show(target);
}

popup.prototype.macroMenuObject = function(target) {
	this.reset();
	
	var tArray = [];
	var rAttributes = [];
	
	tArray.push([ build.icon("group-white"), "Group" ]);
	tArray.push([ build.icon("ungroup-white"), "Ungroup" ]);
	tArray.push([ "", "" ]);
	tArray.push([ build.icon("gear-white"), "Object to animation state..." ]);
	tArray.push([ build.icon("gears-white"), "Create animated group..." ]);
	tArray.push([ build.icon("folder-white"), "Manage animation states..." ]);
	
	rAttributes.push({ 'onclick': 'popup.hide();svg.group();' });
	rAttributes.push({ 'onclick': 'popup.hide();svg.ungroup();' });
	rAttributes.push({ 'class': 'hr' });
	rAttributes.push({ 'onclick': 'popup.hide();menu.refresh();popup.macroToAnimationState(document.getElementById("anigenMenu"), svg.selected);' });
	rAttributes.push({ 'onclick': 'popup.hide();menu.refresh();popup.macroNewAnimationGroup(document.getElementById("anigenMenu"));' });
	rAttributes.push({ 'onclick': 'popup.hide();overlay.macroAnimationStatesManager();' });
	
	if(svg.selected == svg.svgElement) {
		rAttributes[0] = { 'class': 'disabled' };
		rAttributes[1] = { 'class': 'disabled' };
	}
	if(svg.selected == svg.svgElement || svg.selected.getAttribute('anigen:type') == 'animationGroup' || svg.selected.hasAnimation()) {
		rAttributes[3] = { 'class': 'disabled' };
	}
	if(!svg.animationStates) {
		rAttributes[4] = { 'class': 'disabled' };
		rAttributes[5] = { 'class': 'disabled' };
	}
	
	this.add(build.table(tArray, null, rAttributes)).setAttribute('class', 'popup-menu');
	
	this.show(target);
}

popup.prototype.macroMenuAnimation = function(target) {
	this.reset();
	
	var tArray = [];
	var rAttributes = [];
	
	if(svg.selected == svg.svgElement) {
		tArray.push([ build.icon("camera-black"), "Camera" ]);
	} else {
		tArray.push([ build.icon("animate-translate-black"), "Translate" ]);
		tArray.push([ build.icon("animate-motion-black"), "Move through path" ]);
		tArray.push([ build.icon("animate-rotate-black"), "Rotate" ]);
		tArray.push([ build.icon("animate-scale-black"), "Scale" ]);
		tArray.push([ build.icon("animate-skewx-black"), "Skew horizontally" ]);
		tArray.push([ build.icon("animate-skewy-black"), "Skew vertically" ]);
		tArray.push([ build.icon("animate-attribute-black"), "Animate attribute..." ]);
	}
	
	tArray.push([ "", "" ]);
	
	tArray.push([ build.icon("arrow-circle-white"), "Loop animation..." ]);
	tArray.push([ build.icon("restart-black"), "Restart all" ]);
	tArray.push([ build.icon("stopwatch-white"), "Pause / unpause" ]);
	
	if(svg.selected == svg.svgElement) {
		if(svg.camera) {
			rAttributes.push({ 'class': 'disabled' });
		} else {
			rAttributes.push({ 'onclick': 'popup.hide();svg.createAnimationViewbox();' });
		}
	} else {
		rAttributes.push({ 'onclick': 'popup.hide();svg.createAnimation(svg.selected, 2, null, { select: true }, null);' });
		rAttributes.push({ 'onclick': 'popup.hide();svg.createAnimation(svg.selected, 1, null, { select: true }, null);' });
		rAttributes.push({ 'onclick': 'popup.hide();svg.createAnimation(svg.selected, 3, null, { select: true }, null);' });
		rAttributes.push({ 'onclick': 'popup.hide();svg.createAnimation(svg.selected, 4, null, { select: true }, null);' });
		rAttributes.push({ 'onclick': 'popup.hide();svg.createAnimation(svg.selected, 5, null, { select: true }, null);' });
		rAttributes.push({ 'onclick': 'popup.hide();svg.createAnimation(svg.selected, 6, null, { select: true }, null);' });
		rAttributes.push({ 'onclick': 'popup.hide();menu.refresh();popup.macroAnimateTypes(document.getElementById("anigenMenu"), svg.selected);' });
	}
	rAttributes.push({ 'class': 'hr' });
	rAttributes.push({ 'onclick': 'popup.hide();menu.refresh();popup.input(document.getElementById("anigenMenu"), "number", infoEditor.clock.maxTime || 0, "value = parseFloat(value);if(value==null || isNaN(value) || value < 0){return;}infoEditor.clock.setMaxTime(value);", null);' });
	rAttributes.push({ 'onclick': 'popup.hide();svg.gotoTime(0);' });
	rAttributes.push({ 'onclick': 'popup.hide();svg.pauseToggle();' });
	
	this.add(build.table(tArray, null, rAttributes)).setAttribute('class', 'popup-menu');
	
	this.show(target);
}

popup.prototype.macroMenuHelp = function(target) {
	this.reset();
	
	var tArray = [];
	var rAttributes = [];
	
	/*
	tArray.push([ build.icon("magnifier-black"), "Manual..." ]);
	tArray.push([ "", "" ]);
	*/
	tArray.push([ build.icon("question-white"), "About..." ]);
	
	/*
	rAttributes.push({ 'onclick': 'popup.hide();window.open("manual.html", "_blank");' });
	rAttributes.push({ 'class': 'hr' });
	*/
	rAttributes.push({ 'onclick': 'popup.hide();overlay.macroAbout();' });
	
	this.add(build.table(tArray, null, rAttributes)).setAttribute('class', 'popup-menu');
	
	this.show(target);
}


popup.prototype.macroLayerNew = function(targetId) {
	this.reset();
	
	var currentLayer;
	if(targetId) {
		currentLayer = document.getElementById(targetId);
	} else {
		currentLayer = svg.getCurrentLayer();
	}
	
	this.add(build.input("text", "New layer"));
	
	var action;
	
	if(currentLayer) {
		this.add(build.select([
			{ 'text': 'Above current', 'value': 'above' },
			{ 'text': 'Below current', 'value': 'below' },
			{ 'text': 'As sublayer of current', 'value': 'sublayer' }
		]));
		action = "svg.addLayer(this.previousElementSibling.previousElementSibling.value, this.previousElementSibling.value);"
	} else {
		action = "svg.addLayer(this.previousElementSibling.value, null);"
	}
	
	this.addButtonOk(action);
	this.addButtonCancel();
	
	this.show();
}

popup.prototype.macroLayerRename = function(target) {
	this.reset();
	
	var target = document.getElementById(target);
	if(!target) { return; }
	
	this.add(build.input('text', target.getAttribute('inkscape:label')));
	
	this.addButtonOk("svg.renameLayer('"+target.id+"', this.previousElementSibling.value);");
	this.addButtonCancel();
	
	this.show(windowLayers.footer.children[0]);
}

popup.prototype.macroAnimateTypes = function(target, element) {
	this.reset();
	
	var animatable = svg.getAnimatableAttributes(element.nodeName);
	
	var options = [ ];
	for(var i = 0; i < animatable.length; i++) {
		options.push({ 'id': i, 'text': animatable[i], 'value': animatable[i], 'title': svg.getAttributeDesription(animatable[i]) });
	}
	
	this.add(build.select(options));
	
	this.addButtonOk('svg.createAnimation("'+element.id+'", 0, null, { select: true }, { attribute: this.previousSibling.value } );');
	this.addButtonCancel();
	
	this.show(target);
}

popup.prototype.macroToAnimationState = function(target, element) {
	this.reset();
	
	var childCount = element.getElementsByTagName('', true, true).length;
	
	var options = [];
	options.push({ 'text': 'New group', 'value': '', 'selected': true });
	
	for(var i in svg.animationStates) {
		if(!svg.animationStates[i] || !svg.animationStates[i][0] || svg.animationStates[i][0].children.length == childCount) {
			options.push({ 'text': i, 'value': i });
		}
	}
	
	this.add(build.input('text', element.id, { 'onfocus': 'if(this.value == "'+element.id+'") { this.value = null; }' } ));
	
	var stateSelect = build.select(options, { 'onchange': 'this.nextSibling.style.display = this.value == "" ? null : "none";' } );
	var groupName = build.input('text', 'New group', { 'onfocus': 'if(this.value == "New group") { this.value = null; }' } );
	
	if(options.length > 1) {
		stateSelect.setSelected(1);
		groupName.style.display = 'none';
	}
	
	this.add(stateSelect);
	this.add(groupName);
	
	this.addButtonOk('svg.newAnimState("'+element.id+'", this.previousElementSibling.previousElementSibling.previousElementSibling.value, this.previousElementSibling.previousElementSibling.value != "" ? this.previousElementSibling.previousElementSibling.value : this.previousElementSibling.value);');
	this.addButtonCancel();
	
	this.show(target);
}

popup.prototype.macroNewAnimationGroup = function(target) {
	this.reset();
	
	var options = [];
	
	for(var i in svg.animationStates) {
		options.push({ 'text': i, 'value': i });
	}
	if(options.length == 0) { return; }
	
	this.add(build.select(options));
	
	this.addButtonOk('svg.newAnimGroup(this.previousElementSibling.value);');
	this.addButtonCancel();
	
	this.show(target);
}

popup.prototype.macroSlider = function(target, value, attributes, actionYes, actionNo, hasNumericInput) {
	this.reset();
	
	// TODO: should use build.slider instead
	
	if(hasNumericInput) {
		if(attributes.onchange) { attributes.onchange = 'this.nextElementSibling.value = this.value;' + attributes.onchange; }
		if(attributes.onmousemove) { attributes.onmousemove = 'if(!event.buttons){return;};this.nextElementSibling.value = this.value;' + attributes.onmousemove; }
	}
			
	this.add(build.input('range', value, attributes));
	
	if(hasNumericInput) {
		var attrInput = { 'onchange': 'this.previousElementSibling.value = this.value;' }
		if(attributes.onchange) { attrInput.onchange += attributes.onchange; }			
		if(attributes && attributes.min) { attrInput.min = attributes.min; }
		if(attributes && attributes.max) { attrInput.max = attributes.max; }
		if(attributes && attributes.step) { attrInput.step = attributes.step; }
		
		this.add(build.input('number', value, attrInput)).focus();
	}
	
	this.addButtonOk(actionYes);
	this.addButtonCancel(actionNo);
	
	this.show(target);
}

popup.prototype.rotate = function(target) {
	this.reset();
	
	var element = document.getElementById(target.id);
	
	var rotation = element.getTransformBase().decompose().rotation || 0;
	
	this.macroSlider(target, rotation, { 'min': '-360', 'max': '360', 'step': '1',
		'onchange': 'var val=parseFloat(this.value);var el=document.getElementById("'+target.id+'");svg.rotateTo(el, val);',
		'onmousemove': 'var val=parseFloat(this.value);var el=document.getElementById("'+target.id+'");svg.rotateTo(el, val);' },
		'svg.select();', 'var el=document.getElementById("'+target.id+'");svg.rotateTo(el, '+rotation+');', true);
	
	this.show(target);
}

popup.prototype.scale = function(target) {
	this.reset();
	
	var element = document.getElementById(target.id);
	
	var scaleX = element.getTransformBase().decompose().scaleX || 1;
	var scaleY = element.getTransformBase().decompose().scaleY || 1;
	
	this.macroSlider(target, scaleX*100, { 'min': 1, 'max': 200, 'step': '1',
		'onchange': 'var val=parseFloat(this.value);var el=document.getElementById("'+target.id+'");svg.scaleTo(el, val/100);',
		'onmousemove': 'var val=parseFloat(this.value);var el=document.getElementById("'+target.id+'");svg.scaleTo(el, val/100);' },
		null, 'var el=document.getElementById("'+target.id+'");svg.scaleTo(el, '+scaleX+', '+scaleY+');', true);
	
	this.show(target);
}
