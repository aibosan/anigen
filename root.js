/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Core SVG-handling class. Handles most changes to the SVG document, as well as export/import
 */
function root() {
    this.svgElement = null;
    this.fileName = null;
    this.selected = null;
    this.posX = 0;
    this.posY = 0;
    this.zoom = 1;
	
	this.previewWindow = new windowPreview();
	
	this.viewBox = { x: 0, y: 0, width: 0, height: 0 };

	this.history = new history();
	
	this.animationStates = null;
	
	this.ui = new uiSVG();
	this.uiGroup = null;
	
	this.zip = new JSZip();
	this.svgrender = new SVGRender();
	
	window.svg = this;
}

// creates the interface group in the svg
root.prototype.seedInterface = function() {
	if(this.uiGroup != null && this.uiGroup.parentNode != null) {
		this.uiGroup.parentNode.removeChild(this.uiGroup);
	}
	this.uiGroup = document.createElementNS(svgNS, "g");
	this.uiGroup.setAttributeNS(anigenNS, 'anigen:lock', 'interface');
	this.svgElement.appendChild(this.uiGroup);
	this.ui.setContainer(this.uiGroup);
}

root.prototype.getSVGElement = function() { return this.svgElement; };
root.prototype.getFileName = function() { return this.fileName; };

// returns all layer groups in element given, recursively, from top to bottom (reversed to rendering order)
root.prototype.getLayers = function(element) {
	var response = [];
    var children = element.children;
    for(var i = children.length-1; i >= 0; i--) {
        if(children[i].getAttribute('inkscape:groupmode') == 'layer') {
            response[response.length] = children[i];
        }
        response = response.concat(this.getLayers(children[i]));
    }
    return response;
}

// returns currently selected layer
root.prototype.getCurrentLayer = function() {
	if(this.selected == null) { return null; }
	var obj = this.selected;
	if(!obj) { return null;}
	while(!(obj instanceof SVGSVGElement) && obj.parentNode) {
		if(obj.getAttribute('inkscape:groupmode') == 'layer') { return obj; }
		obj = obj.parentNode;
	}
}

root.prototype.addLayer = function(name, position) {
	if(!name) { return; }
	var currentLayer = this.getCurrentLayer();
	var newLayer = document.createElementNS(svgNS, 'g');
	newLayer.setAttribute('inkscape:groupmode', 'layer');
	newLayer.setAttribute('inkscape:label', name);
	newLayer.generateId();
	
	if(!position || !currentLayer) {
		this.svgElement.appendChild(newLayer);
	} else {
		switch(position) {
			case 'above':
				if(currentLayer.nextElementSibling) {
					currentLayer.parentNode.insertBefore(newLayer, currentLayer.nextElementSibling);
				} else {
					currentLayer.parentNode.appendChild(newLayer);
				}
				log.report('New layer <strong>'+name+'</strong> was created above layer <strong>'+currentLayer.getAttribute('inkscape:label')+'</strong>.');
				break;
			case 'below':
				currentLayer.parentNode.insertBefore(newLayer, currentLayer);
				log.report('New layer <strong>'+name+'</strong> was created below layer <strong>'+currentLayer.getAttribute('inkscape:label')+'</strong>.');
				break;
			case 'sublayer':
				currentLayer.appendChild(newLayer);
				log.report('New layer <strong>'+name+'</strong> was created as a sublayer of <strong>'+currentLayer.getAttribute('inkscape:label')+'</strong>.');
				break;
		}
	}
	
	this.history.add(new historyCreation(newLayer.cloneNode(true), newLayer.parentNode.id, newLayer.nextElementSibling ? newLayer.nextElementSibling.id : null, false));
	
	
	
	anigenManager.classes.tree.seed();
	this.select();
}

root.prototype.renameLayer = function(targetId, newName) {
	target = document.getElementById(targetId);
	if(!target || !targetId || !newName) { return; }
	
	this.history.add(new historyAttribute(targetId,
		{ 'inkscape:label': target.getAttribute('inkscape:label') },
		{ 'inkscape:label': newName },
	true));
	
	log.report('Layer <strong>'+target.getAttribute('inkscape:label')+'</strong> was renamed to <strong>'+newName+'</strong>.');
	
	target.setAttribute('inkscape:label', newName);
	
	anigenManager.classes.tree.seed();
	this.select();
}

root.prototype.evaluateEventPosition = function(event) {
	if(!event) {
		event = { 'clientX': window.innerWidth/2, 'clientY': window.innerHeight/2};
	}
	
	var x = this.viewBox.x + event.clientX/this.zoom;
	var y = this.viewBox.y + event.clientY/this.zoom;
	
	return { 'x': x, 'y': y};
}

// zooms towards given event location (currently towards centre of view)
root.prototype.zoomAround = function(x, y, zoomIn) {
	if(x == null || y == null || isNaN(x) || isNaN(y)) {
		var evaluated = this.evaluateEventPosition();
		x = evaluated.x;
		y = evaluated.y;
	}
	
	var ratio = 1;
	if(zoomIn == null) {
		
	} else if(zoomIn) {
		this.zoom *= Math.sqrt(2);
		ratio = Math.sqrt(2);
	} else {
		this.zoom *= 1/Math.sqrt(2);
		ratio = 1/Math.sqrt(2);
	}
	if(Math.abs(this.zoom - 1) < 0.1) { this.zoom = 1; }
	
	this.posX = x - (x-this.posX)/ratio;
	this.posY = y - (y-this.posY)/ratio;
	
	this.refreshUI(true);
}

root.prototype.moveView = function(byX, byY) {
	if(isNaN(byX) || isNaN(byY)) { return; }
	this.posX += byX;
	this.posY += byY;
	this.adjustSize();
	this.ui.refresh();
};

// returns readable version of the zoom value
root.prototype.getZoomReadable = function() {
	if(this.zoom < 0.0001) {
		return "<1‱";
	}
	if(this.zoom < 0.01) {
		return Math.round(this.zoom * 10000) + "‱";
	}
	if(this.zoom < 0.1) {
		return Math.round(this.zoom * 1000) + "‰";
	}
	if(this.zoom > 20000) {
		return Math.round(this.zoom*0.0001) + "×10⁶ %";
	}
	if(this.zoom > 50) {
		return Math.round(this.zoom*0.1) + "×10³ %";
	}
	return Math.round(this.zoom * 100) + "%";
}

// pauses/unpauses animations
root.prototype.pauseToggle = function(unpause) {
	if(this.svgElement.animationsPaused() && (unpause == true || unpause == null)) {
		if(popup.closeOnSeek) {
			if(popup.buttonOk) { 
				if(popup.noRemoteClick) {
					popup.hide();
				} else {
					popup.buttonOk.click();
				}
			} else {
				popup.hide();
			}
		}
		this.svgElement.unpauseAnimations();
	} else {
		this.svgElement.pauseAnimations();
	}
	anigenManager.classes.editor.refreshPause();
}

root.prototype.elementToCoords = function(target, x, y) {
	if(!target) { return; }
	if(x == null || y == null) {
		var evaluated = this.evaluateEventPosition();
		x = evaluated.x;
		y = evaluated.y;
	}
	
	var center;
	
	if(typeof target.getCenter === 'function') {
		center = target.getCenter(true);
	} else {
		center = this.getCenter(target);
	}
	var CTM = target.getCTM();
	if(!CTM) { return; }
	
	if(center) {
		target.translateBy((x-center.x), (y-center.y));
	}
}

// duplicates the element and places it right above the original
root.prototype.duplicate = function(target) {
	if(target == this.svgNode) { return; }
	var clone = target.cloneNode(true);
	clone.stripId(true);
	clone.generateId(true);
	if(target.nextElementSibling) {
		target.parentNode.insertBefore(clone, target.nextElementSibling);
	} else {
		target.parentNode.appendChild(clone);
	}
	
	log.report('Element <strong>'+target.getAttribute('id')+'</strong> was duplicated. Duplicate id is <strong>'+clone.getAttribute('id')+'</strong>.');
	
	this.history.add(new historyCreation(clone.cloneNode(true), clone.parentNode.id, clone.nextElementSibling ? clone.nextElementSibling.id : null, false));
	
	anigenManager.classes.tree.seed();	// the tree is reconstructed
	
	//timeline.rebuild();
	
	this.select(clone);
}

// copies element in order to paste it later
root.prototype.copy = function(target) {
	if(!target || target == this.svgElement) { return; }
	var additional = '('+target.nodeName+')';
	this.elementTemp = target.cloneNode(true);
	if(target instanceof SVGAnimationElement) {
		additional = '(animation)';
		var CTM = target.parentNode.getCTMBase();
		this.elementTemp.valuesToViewport(CTM);
		this.elementTemp.commit();
	} else {
		this.elementTemp.setAttribute('transform', target.getCTMBase());
	}
	if(target.shepherd) {
		// could lead to double linking to the same object
		// TODO? (does it tho?)
		this.elementTemp.shepherd = target.shepherd;
		
		if(this.elementTemp.shepherd instanceof animationGroup) { additional = '(animation group)'; }
		if(this.elementTemp.shepherd instanceof animatedViewbox) { additional = '(camera)'; }
		
	}
	log.report('Element <strong>'+target.getAttribute('id')+'</strong> '+additional+' was copied to clipboard.');
}

// pastes previously copied element into the target
root.prototype.paste = function(position, target, beforeElement) {
	if(!this.elementTemp) { return; }
	
	// pasting keytimes
	if(target.id != this.elementTemp.id &&
		(typeof target.pasteTiming === 'function' && typeof this.elementTemp.pasteTiming === 'function') ||
		(target.shepherd && typeof target.shepherd.pasteTiming === 'function' && typeof this.elementTemp.pasteTiming === 'function') ||
		(this.elementTemp.shepherd && typeof target.pasteTiming === 'function' && typeof this.elementTemp.shepherd.pasteTiming === 'function') ||
		(target.shepherd && this.elementTemp.shepherd && typeof target.shepherd.pasteTiming === 'function' && typeof this.elementTemp.shepherd.pasteTiming === 'function')
		)
		{

		var fr, to;
		to = target.shepherd || target;
		fr = this.elementTemp.shepherd || this.elementTemp;
		
		to.pasteTiming(fr, true);
		this.select(to.commit());
		
		log.report('Timing of element <strong>'+fr.getAttribute('id')+'</strong> was pasted into element <strong>'+target.getAttribute('id')+'</strong>.');
		
		//this.select(target.pasteTiming(this.elementTemp));
		return;
	}
	
	// target doesn't allow this child - pass to the parent
	if(typeof target.allowsChild === 'function' && !target.allowsChild(this.elementTemp)) {
		this.paste(position, target.parentNode, target);
		return;
	}
	
	// otherwise, the original element is cloned, stripped of all IDs, and inserted into the target and selected
	var newElement = this.elementTemp.cloneNode(true);
	newElement.stripId(true);
	newElement.generateId(true);
	if(newElement.isAnimation()) {
		newElement.setAttribute('begin', this.elementTemp.getAttribute('begin'));
		var CTM = target.getCTMBase();
		newElement.valuesToUserspace(CTM);
		newElement.commit();
	}
	
	if(target == this.svgElement) {	// SVG
		if(newElement.isAnimation()) { return; }
		if(beforeElement != null) {
			target.insertBefore(newElement, beforeElement);
			log.report('<strong>'+newElement.getAttribute('id')+'</strong> was pasted into element <strong>'+target.getAttribute('id')+'; its next sibling is <strong>'+beforeElement.getAttribute('id')+'</strong>.');
		} else {
			target.insertBefore(newElement, this.uiGroup);
			log.report('<strong>'+newElement.getAttribute('id')+'</strong> was pasted into element <strong>'+target.getAttribute('id')+'; its next sibling is <strong>'+this.uiGroup.getAttribute('id')+'</strong>.');
		}
	} else if(typeof target.allowsChild !== 'function' || target.allowsChild(newElement)) {
		// appends if the target allows it
		if(beforeElement != null) {
			target.insertBefore(newElement, beforeElement);
			log.report('<strong>'+newElement.getAttribute('id')+'</strong> was pasted into element <strong>'+target.getAttribute('id')+'; its next sibling is <strong>'+beforeElement.getAttribute('id')+'</strong>.');
		} else {
			target.appendChild(newElement);
			log.report('<strong>'+newElement.getAttribute('id')+'</strong> was pasted into element <strong>'+target.getAttribute('id')+'.');
		}
	} else {
		// otherwise appends it to the parent
		this.paste(position, target.parentNode, target);
		return;
	}
	
	var targetCTM = target.getCTMBase();
	var transformBase = newElement.getTransformBase();
	
	transformBase = targetCTM.inverse().multiply(transformBase);
	newElement.setAttribute('transform', transformBase);
	
	anigenManager.classes.tree.seed();	// the tree is reconstructed
	
	anigenManager.classes.context.refresh();
	
	if(position) {
		this.elementToCoords(newElement, position.x, position.y);
	}
	this.history.add(new historyCreation(newElement.cloneNode(true), newElement.parentNode.id, newElement.nextElementSibling ? newElement.nextElementSibling.id : null, false));
	
	this.select(newElement);	// new element is selected
	return true;
}

// deletes element (unless it is the root SVG element)
root.prototype.delete = function(target) {
	if(!target || target == this.svgElement) { return; }
	var selectParent = null;
	if(target == this.selected || this.selected.isChildOf(target)) { selectParent = target.parentNode; }
	
	this.history.add(new historyCreation(target.cloneNode(true), target.parentNode.id, target.nextElementSibling ? target.nextElementSibling.id : null, true));
	
	log.report('<strong>'+target.getAttribute('id')+'</strong> was deleted from <strong>'+target.parentNode.getAttribute('id')+'</strong>.');
	target.parentNode.removeChild(target);
	
	anigenManager.classes.context.refresh();
	
	if(target.shepherd && target.shepherd instanceof animatedViewbox) {
		this.camera = null;
	}
	
	anigenManager.classes.tree.seed();	// the tree is reconstructed
	if(selectParent != null) {
		this.select(selectParent);
	} else {
		this.select(svg.svgElement);
	}
}

// copies and deletes element (unless it's the root SVG element)
root.prototype.cut = function(target) {
	this.copy(target);
	this.delete(target);
}

// creates use element link to the given element
root.prototype.createLink = function(target) {
	if(!target || target == this.svgElement || !target.id) { return; }
	
	var use = document.createElementNS(svgNS, 'use');
		use.setAttributeNS(xlinkNS, 'href', '#'+target.id);
		use.setAttribute('x', '0');
		use.setAttribute('y', '0');
		use.generateId();
	target.parentNode.insertBefore(use, target);
	target.parentNode.insertBefore(target, use);
	
	log.report('<strong>'+use.getAttribute('id')+'</strong>, a new link of <strong>'+target.getAttribute('id')+'</strong> was created.');
	
	this.history.add(new historyCreation(use.cloneNode(true), use.parentNode.id, target.id, false));
	anigenManager.classes.tree.seed();
	this.select(use);
}

root.prototype.group = function(target) {
	if(!target) { target = this.selected; }
	if(!target || target instanceof SVGSVGElement) { return; }
	
	var newGroup = document.createElementNS(svgNS, 'g');
		newGroup.generateId();
	var targetParent = target.parentNode;
	var nextSibling = target.nextElementSibling;
	
	this.history.add(
		new historyCreation(newGroup.cloneNode(true),
			targetParent.id, target.id, false, true));
			
	this.history.add(
		new historyParentage(target.id,
			[ targetParent.id, newGroup.id ], [ nextSibling ? nextSibling.id : null, null ], true));
			
	targetParent.insertBefore(newGroup, target);
	newGroup.appendChild(target);
	
	log.report('<strong>'+target.getAttribute('id')+'</strong> was put into a new group, <strong>'+newGroup.getAttribute('id')+'</strong>.');
	
	anigenManager.classes.tree.seed();	// the tree is reconstructed
	//timeline.rebuild();
	anigenManager.classes.context.refresh();
	
	this.select(newGroup);
}

root.prototype.ungroup = function(target) {
	if(!target) { target = this.selected; }
	if(!target || !(target instanceof SVGGElement)) { return; }
	
	var par = target.parentNode;
	
	log.report('Group <strong>'+target.getAttribute('id')+'</strong> was dispersed; it had <strong>'+target.children.length+'</strong> children.');
	
	target.ungroup(true);
	
	//anigenManager.classes.tree.seed();
	this.select(par);
	
	
	if(anigenManager.classes.tree.selected) {
		anigenManager.classes.tree.selected.bloom(true);
	} else {
		anigenManager.classes.tree.seed();
		svg.select();
	}
	
}

root.prototype.evaluateEditOverlay = function(tableAttr, tableCSS) {
	
	tableAttr = tableAttr || overlay.content.children[0];
	tableCSS = tableCSS || overlay.content.children[1];
	
	var attrFrom = {};
	var attrTo = {};
	
	for(var i = 0; i < tableAttr.children.length; i++) {
		if(tableAttr.children[i].children[0].nodeName.toLowerCase() == 'th') { continue; }
		
		var aName = tableAttr.children[i].children[0].children[0].value;
		var aValue = tableAttr.children[i].children[2].children[0].value
		var aDelete = tableAttr.children[i].children[4].children[0];
		
		if(aDelete) {
			aDelete = aDelete.checked;
			if(aDelete) {
				attrFrom[aName] = this.selected.getAttribute(aName);
				this.selected.removeAttribute(aName);
				attrTo[aName] = null;
			} else {
				if(aName == 'id') {
					this.changeId(this.selected, aValue, true);
				} else {
					attrFrom[aName] = this.selected.getAttribute(aName);
					this.selected.setAttribute(aName, aValue);
					attrTo[aName] = aValue;
				}
			}
		} else {
			if(aName.length > 0 && aValue.length > 0) {
				attrFrom[aName] = null;
				this.selected.setAttribute(aName, aValue);
				attrTo[aName] = aValue;
			}
		}
	}
	
	var styleOld = this.selected.getAttribute('style');
	
	for(var i = 0; i < tableCSS.children.length; i++) {
		if(tableCSS.children[i].children[0].nodeName.toLowerCase() == 'th') { continue; }
		
		var aName = tableCSS.children[i].children[0].children[0].value;
		var aValue = tableCSS.children[i].children[2].children[0].value
		var aDelete = tableCSS.children[i].children[4].children[0];
		
		if(aDelete) {
			aDelete = aDelete.checked;
			if(aDelete) {
				this.selected.style[aName] = null;
			} else {
				this.selected.style[aName] = aValue;
			}
		} else {
			if(aName.length > 0 && aValue.length > 0) {
				this.selected.style[aName] = aValue;
			}
		}
	}
	
	var styleNew = this.selected.getAttribute('style');
	
	if(styleOld != styleNew) {
		attrFrom['style'] = styleOld;
		attrTo['style'] = styleNew;
	}
	
	this.history.add(new historyAttribute(this.selected.id, attrFrom, attrTo, true));
	
	if(this.selected.shepherd && typeof this.selected.shepherd.rebuild === 'function') {
		this.selected.shepherd.rebuild();
	}
	this.select();
}

root.prototype.evaluateStatesManager = function() {
	var container = overlay.content;
	
	var currentGroup = null;
	
	for(var i = 0; i < container.children.length; i++) {
		if(container.children[i].nodeName.toLowerCase() == 'h2') {
			currentGroup = container.children[i].innerText;
			continue;
		}
		if(container.children[i].nodeName.toLowerCase() == 'table') {
			if(!currentGroup || !svg.animationStates[currentGroup]) { continue; }
			
			var realId = 0;
			
			for(var j = 0; j < container.children[i].children.length; j++) {
				if(container.children[i].children[j].children[0].nodeName.toLowerCase() == 'th') { continue; }
				if(!svg.animationStates[currentGroup][realId]) { break; }
				
				var newName = container.children[i].children[j].children[0].children[0].value;
				var isDelete = container.children[i].children[j].children[3].children[0].checked;
				
				var oldName = svg.animationStates[currentGroup][realId].name;
				if(newName && newName != oldName) { svg.animationStates[currentGroup][realId].setName(newName); }
				
				if(isDelete) {
					svg.animationStates[currentGroup][realId].destroy();
					if(svg.animationStates[currentGroup]) {
						svg.animationStates[currentGroup].splice(realId, 1);
					}
					realId--;
				}
				realId++;
			}
		}
	}
	anigenManager.classes.windowAnimation.refreshKeyframes();
	anigenManager.classes.tree.seed();
	svg.select();
}

root.prototype.evaluateGroupInbetween = function(valueIndex, groupName, name, index1, index2, ratio) {
	if(index1 == null || index2 == null || ratio == null) { return; }
	
	var animation = anigenManager.classes.windowAnimation.animation;
	
	if(groupName) {
		if(!svg.animationStates[groupName]) { return; }
		states = svg.animationStates[groupName];
	} else {
		if(!(anigenManager.classes.windowAnimation.animation instanceof animationGroup) || !anigenManager.classes.windowAnimation.animation.getAttribute('anigen:group') || !svg.animationStates[anigenManager.classes.windowAnimation.animation.getAttribute('anigen:group')]) {
			return;
		}
		states = svg.animationStates[anigenManager.classes.windowAnimation.animation.getAttribute('anigen:group')];
		groupName = anigenManager.classes.windowAnimation.animation.getAttribute('anigen:group');
	}
	var states = svg.animationStates[groupName];
	
	if(!states[index1] || !states[index2]) { return; }
	if(name == null || name.length == 0) { name = states[index1].name+'-'+states[index2].name+'-'+ratio; }
	
	var newState = states[index1].inbetween(states[index2], ratio, name, true);
	
	if(valueIndex != null) {
		// create state and make it an inbetween
		if(!anigenManager.classes.windowAnimation.animation || !(anigenManager.classes.windowAnimation.animation instanceof animationGroup)) { return; }
		anigenManager.classes.windowAnimation.animation.createInbetween(valueIndex, valueIndex+1, newState.number, true);
		anigenManager.classes.windowAnimation.selected = [ valueIndex+1 ];
		anigenManager.classes.windowAnimation.animation.commit();
	}
	anigenManager.classes.windowAnimation.refreshKeyframes();
	anigenManager.classes.tree.seed();
	svg.select();
}

root.prototype.evaluateSetCurrentValue = function() {
	var animation = this.selected.shepherd || this.selected;
	if(!animation || !(animation instanceof SVGAnimationElement)) { return; }
	
	var closest = animation.getClosest(true);
	
	var hasValue = closest.perfect;		// SLACK
	
	var inputVal = document.getElementById('anigenAddValue');
	var inputValX = document.getElementById('anigenAddValueX');
	var inputValY = document.getElementById('anigenAddValueY');
	
	var newValue;
	var intensity = document.getElementById('anigenIntensity') ? document.getElementById('anigenIntensity').children[0].value : null;
	
	if(animation instanceof animatedViewbox) {
		var inputValWidth = document.getElementById('anigenAddValueWidth');
		var inputValHeight = document.getElementById('anigenAddValueHeight');
		
		if(!inputValX || !inputValY || !inputValWidth || !inputValHeight) { return; }
		
		newValue = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect();
		newValue.x = inputValX.value;
		newValue.y = inputValY.value;
		newValue.width = inputValWidth.value;
		newValue.height = inputValHeight.value;
		
	} else if(animation instanceof animationGroup) {
		newValue = inputVal.value;
	} else if(animation instanceof SVGAnimateMotionElement) {
		newValue = parseFloat(inputVal.value)/100;
	} else {
		if(animation instanceof SVGAnimateTransformElement) {
			
			switch(animation.getAttribute('type')) {
				case 'rotate':
					newValue = new angle(
						parseFloat(inputVal.value),
						parseFloat(inputValX.value),
						parseFloat(inputValY.value)
					);
					break;
				case 'translate':
					newValue = new coordinates(
						parseFloat(inputValX.value),
						parseFloat(inputValY.value)
					);
					break;
				case 'scale':
					newValue = new coordinates(
						parseFloat(inputValX.value)/100,
						parseFloat(inputValY.value)/100
					);
					break;
				case 'skewX':
				case 'skewY':
					newValue = new angle(
						parseFloat(inputVal.value)
					);
					break;
			}
		} else {
			newValue = inputVal.value;
			if(inputVal.hasClass('fraction')) {
				newValue *= 0.01;
			}
		}
	}
	
	if(hasValue && !newValue.invalid && closest.closest.index != null) {
		animation.setValue(closest.closest.index, newValue);
		if(intensity != null && typeof animation.setIntensity === 'function') {
			animation.setIntensity(closest.closest.index, intensity);
		}
	}
	
	var newSpline, newSplineType;
	if(animation.getCalcMode() == 'spline') {
		newSplineType = parseInt(popup.content.children[popup.content.children.length-4].value);
		var newSpline;
		if(newSplineType == -1) {
			newSpline = new spline(
				popup.content.children[popup.content.children.length-3].children[0].value,
				popup.content.children[popup.content.children.length-3].children[1].value,
				popup.content.children[popup.content.children.length-3].children[2].value,
				popup.content.children[popup.content.children.length-3].children[3].value
			);
		} else {
			newSpline = new spline(newSplineType);
		}
		
		if(hasValue && !newSpline.invalid && closest.closest.index != null) {
			animation.setSpline(closest.closest.index, newSpline);
		}
		
	}
	
	if(!newValue.invalid && (!hasValue || closest.closest.index == null)) {
		animation.addValue(newValue, closest.progress, newSpline, intensity);	
	}
	
	if(anigenManager.classes.windowAnimation.animation == animation) {
		anigenManager.classes.windowAnimation.animation = animation.commit();
		if(anigenManager.classes.windowAnimation.animation.shepherd) {
			anigenManager.classes.windowAnimation.animation = anigenManager.classes.windowAnimation.animation.shepherd;
		}
		anigenManager.classes.windowAnimation.refreshKeyframes();
	}
	anigenManager.classes.windowAnimation.select(hasValue ? closest.closest.index : closest.closest.index+1, true);
	this.gotoTime();
}

root.prototype.replace = function(replaceFrom, replaceTo, onlySelection, lenient) {
	var target = onlySelection ? this.selected : this.svgElement;
	
	var matching = target.getElementsByAttribute(null, replaceFrom, true, lenient);
	
	for(var i = 0; i < matching.length; i++) {
		var obj = {};
		for(var j in matching[i].attributes) {
			if((matching[i].attributes[j].name && matching[i].attributes[j].value) && ((lenient && matching[i].attributes[j].value.match(replaceFrom)) || matching[i].attributes[j].value == replaceFrom)) {
				obj[matching[i].attributes[j].name] = replaceTo;
				break;
			}
		}
		matching[i].setAttributeHistory(obj);
	}
}


root.prototype.toPath = function(target) {
	if(!target) { target = this.selected; }
	if(typeof target === 'string') { target = document.getElementById(target); }
	if(!target) { return; }
	if(typeof target.toPath !== 'function') { return; }
	
	var originalTree = target.cloneNode(true);
	var newTree = target.toPath(true);
	
	// removes old element
	this.history.add(new historyCreation(originalTree, newTree.parentNode.getAttribute('id'),
		newTree.nextElementSibling ? newTree.nextElementSibling.getAttribute('id') : null, true, true));
	// creates new element
	this.history.add(new historyCreation(newTree.cloneNode(true), newTree.parentNode.getAttribute('id'),
		newTree.nextElementSibling ? newTree.nextElementSibling.getAttribute('id') : null, false, true));
	
	anigenManager.classes.tree.seed();
	svg.select(svg.selected.getAttribute('id'));
}


// toggles target's "display" attribute between "none" and no attribute (default - displayed)
root.prototype.toggleVisibility = function(target) {
	if(!target) { return; }
	if(typeof target === 'string') {
		target = document.getElementById(target);
		if(!target) { return; }
	}
	
	var oldStyle = target.getAttribute('style');
	
	if(target.style.display == 'none') {
		target.style.display = null;
	} else {
		target.style.display = 'none';
	}
	
	var newStyle = target.getAttribute('style');
	this.history.add(new historyAttribute(target.id, { 'style': oldStyle }, { 'style': newStyle }));
}

root.prototype.adjustAnimation = function(targetId, index, type, value) {
	var animation = document.getElementById(targetId);
	if(animation == null) { return; }
	animation = animation.shepherd;
	switch(type) {
		case 0:         // keyTime
			animation.setTime(index, value);
			break;
		case 1:         // keySpline
			animation.setSpline(index, value);
			break;
		case 2:         // value1 (x, value, distance)
			switch(animation.type) {
				case 0:         // animate
					animation.setValue(index, value);
					break;
				case 1:         // motion
					animation.setDistance(index, value);
					break;
				case 2:         // translate
					animation.setPosition(index, value);
					break;
			}
			break;
		case 3:         // value2 (y)
			animation.setPosition(index, null, value);
			break;
		case 4:         // value3 (angle)
			animation.setAngle(index, value);
			break;
	}
	anigenManager.classes.windowAnimation.refresh();
}

root.prototype.createAnimation = function(owner, type, numeric, flags, other) {
	/*
		0 - animate
		1 - motion
		2 - translate
		3 - rotate
		4 - scale
		5 - skewX
		6 - skewY
			*/
			
	if(type == null || type < 0 || type > 6 || !owner) { return; }
			
	if(typeof owner === 'string') {
		owner = document.getElementById(owner);
		
		if(!owner) { return; }
	}
	
	numeric = numeric || { dur: 10, begin: 0, repeatCount: 0 };
	flags = flags || { additive: false, accumulate: false, freeze: false, select: false };
	other = other || {};
	
	numeric.dur = numeric.dur || 10;
	numeric.begin = numeric.begin || 0;
	numeric.repeatCount = numeric.repeatCount || 0;
	if(!flags.additive) { flags.additive = type == 0 ? false : true; }
	flags.accumulate = flags.accumulate || false;
	flags.freeze = flags.freeze == null ? true : flags.freeze;
	
	var animationElement;
	
	var typeText = '';
	
	switch(type) {
		case 0:		// animate
			typeText = 'attribute animation - '+other.attribute;
			if(!other.attribute) { return; }
			var val = owner.style[other.attribute] || owner.getAttribute(other.attribute) || this.getDefaultAttributeValue(other.attribute);
			
			animationElement = document.createElementNS(svgNS, "animate");
			animationElement.setAttribute('attributeType', 'auto');
			animationElement.setAttribute('attributeName', other.attribute);
			if(other.attribute == 'd' && !owner.getAttribute('anigen:original-d')) { owner.setAttribute('anigen:original-d', val); }
			animationElement.setAttribute('values', val+";"+val);
			break;
		case 1:		// motion
			typeText = 'movement through path';
			animationElement = document.createElementNS(svgNS, "animateMotion");
			if(!numeric.rotate) { numeric.rotate = 0; }
			if(!other.path) { other.path = 'M 0 0 L 0 0'; }
			animationElement.setAttribute('rotate', numeric.rotate);
			animationElement.setAttribute('path', other.path);
			animationElement.setAttribute('keyPoints', '0;1');
			break;
		default:
			animationElement = document.createElementNS(svgNS, "animateTransform");
			animationElement.setAttribute('attributeName', 'transform');
			animationElement.setAttribute('attributeType', 'auto');
			
			var cx = parseFloat(owner.getAttribute('inkscape:transform-center-x') || 0);
			var cy = parseFloat(owner.getAttribute('inkscape:transform-center-y') || 0);
			
			if(typeof owner.getBBox === 'function') {
				var box = owner.getBBox();
				
				cx = box.x;
				cy = box.y;
				
				// TODO: make it actually use inkscape's transform center (however that works :<)
			} else {
				cx = 0;
				cy = 0;
			}
			
			
			switch(type) {
				case 2:
					typeText = 'translation';
					animationElement.setAttribute('type', 'translate');
					animationElement.setAttribute('values', "0 0;0 0");
					break;
				case 3:
					typeText = 'rotation';
					animationElement.setAttribute('type', 'rotate');
					animationElement.setAttribute('values', "0 " + cx + " " + cy + ";0 " + cx + " " + cy);
					break;
				case 4:
					typeText = 'scale';
					animationElement.setAttribute('type', 'scale');
					animationElement.setAttribute('values', "1 1;1 1");
					break;
				case 5:
					typeText = 'horizontal skew';
					animationElement.setAttribute('type', 'skewX');
					animationElement.setAttribute('values', "0;0");
					break;
				case 6:
					typeText = 'vertical skew';
					animationElement.setAttribute('type', 'skewY');
					animationElement.setAttribute('values', "0;0");
					break;
			}	
			break;
	}
	
	animationElement.setAttribute('calcMode', "spline");
	animationElement.setAttribute('keyTimes', "0;1");
	animationElement.setAttribute('keySplines', "0 0 1 1");
	
	animationElement.setAttribute('dur', numeric.dur+'s');
	animationElement.setAttribute('begin', numeric.begin+'s');
	animationElement.setAttribute('repeatCount', numeric.repeatCount);
	animationElement.setAttribute('additive', flags.additive ? 'sum' : 'replace');
	animationElement.setAttribute('accumulate', flags.accumulate ? 'sum' : 'none');
	animationElement.setAttribute('fill', flags.freeze ? 'freeze' : 'remove');
	
	animationElement.generateId();
	
	owner.appendChild(animationElement);
	
	log.report('New animation <strong>'+animationElement.getAttribute('id')+'</strong> ('+typeText+') was created and appended to <strong>'+owner.getAttribute('id')+'</strong>.');
	
	this.history.add(new historyCreation(animationElement.cloneNode(true), owner.id, null, false));
	
	// timeline.add(new timelineObject(shepherd));
	
	anigenManager.classes.tree.seed();
	anigenManager.classes.context.refresh();
	this.gotoTime();
	this.select(flags.select ? animationElement : this.selected);
	return animationElement;
}

root.prototype.createAnimationViewbox = function() {
	this.camera = new animatedViewbox(this);
	this.ui.putOnTop();
	anigenManager.classes.tree.seed();
	this.ui.frame.refresh();
	
	log.report('New camera animation <strong>'+this.camera.getAttribute('id')+'</strong> was created.');
	
	this.select(this.camera.element);
}

// returns the selected animation, or the selected element's first animation
root.prototype.getSelectedAnimation = function() {
	if(this.selected.shepherd && this.selected.shepherd instanceof animationGroup) {
		return this.selected.shepherd;
	}
	if(this.selected.isAnimation()) {
		return this.selected;
	}
	if(this.selected.hasAnimation()) {
		return this.selected.getElementsByTagName('animate', false, true)[0];
	}
	return null;
}

// adjusts bounding box of the svgElement so it fits into the layout
root.prototype.adjustSize = function(sizeChanged) {
	if(this.svgElement == null) { return; }
	
	if(sizeChanged) {
		this.viewBox.x = -1 * ((0.5*this.container.offsetWidth/this.zoom)-this.posX);
		this.viewBox.y = -1 * ((0.5*this.container.offsetHeight/this.zoom)-this.posY);
		this.viewBox.width = this.container.offsetWidth/this.zoom;
		this.viewBox.height = this.container.offsetHeight/this.zoom;
	} else {
		this.viewBox.x = this.posX - this.viewBox.width/2;
		this.viewBox.y = this.posY - this.viewBox.height/2;
	}

	this.svgElement.setAttribute("viewBox", 
		this.viewBox.x + " " + this.viewBox.y + " " + this.viewBox.width + " " + this.viewBox.height
	);
	
	anigenManager.classes.rulerV.refresh();
	anigenManager.classes.rulerH.refresh();
}

// refreshes ui elements dependant on zoom level 
root.prototype.refreshUI = function(sizeChanged) {
	this.adjustSize(sizeChanged);
	this.ui.refresh();
	anigenManager.classes.editor.refreshZoom();
	anigenManager.classes.rulerV.refresh();
	anigenManager.classes.rulerH.refresh();
	anigenManager.refresh();
	
	if(anigenManager) {
		if(this.zoom == 1) {
			anigenManager.classes.context.toolButtons.zoom.zoomReset.disable();
		} else {
			anigenManager.classes.context.toolButtons.zoom.zoomReset.enable();
		}
	}
}

// selects the target
root.prototype.select = function(target) {
	if(!target) {
		target = this.selected.getAttribute('id') || this.selected;
	}
	if(typeof target === 'string') {
		target = document.getElementById(target);
	}
	if(target == null || target.isInsensitive()) { return; }
	
	popup.hide();
	overlay.hide();
	
	var clear = target != this.selected;
	this.selected = target;
	this.selected.generateId();
	
	if(!target.shepherd) {
		if(target.getAttribute('anigen:type') == 'animationGroup') { new animationGroup(target); }
		if(target.getAttribute('anigen:type') == 'animatedViewbox') { new animatedViewbox(target); }
	}
	
	if(target instanceof SVGAnimationElement || target.shepherd && target.shepherd instanceof SVGAnimationElement) {
		anigenManager.classes.windowAnimation.refresh(clear);
	}
	
	anigenManager.classes.selection.refresh();
	anigenManager.classes.context.refresh();
	anigenManager.classes.windowLayers.refresh();
	anigenManager.classes.windowColors.refresh();
	anigenManager.classes.menu.refresh();
	anigenManager.classes.tree.select(target);
	this.ui.edit(target);
	this.ui.putOnTop()
}

root.prototype.newAnimState = function(target, name, group, isBatch) {
	if(typeof target === 'string') { target = document.getElementById(target); }
	
	if(!target) { return false; }
	if(name == 'Name') { name = null; }
	if(group == 'New group' || group == null) {
		// generate new group name
		var groups = [];
		for(var i in svg.animationStates) {
			groups.push(i);
		}
		do {
			this.group = "group_" + parseInt(Math.random()*10000);
		} while(groups.indexOf(this.group) != -1)
	
	}
	/*
	if(!this.animationStates) { this.animationStates = {}; }
	*/
	if(!group) {
		// generate new group name
		var groups = [];
		for(var i in svg.animationStates) {
			groups.push(i);
		}
		do {
			group = "group_" + parseInt(Math.random()*10000);
		} while(groups.indexOf(group) != -1)
	}
	/*
	if(!this.animationStates[group]) { this.animationStates[group] = []; }
	*/
	
	if(isBatch) {
		for(var i = 0; i < target.children.length; i++) {
			new animationState(
				target.children[i].getAttribute('inkscape:label') ? target.children[i].children[0] : target.children[i],
				target.children[i].getAttribute('inkscape:label') || target.children[i].getAttribute('id'),
				group);
			
			log.report('New animation state <strong>'+(target.children[i].getAttribute('inkscape:label') || target.children[i].getAttribute('id'))+'</strong> was created. Its group is <strong>'+group+'</strong>.');
		}
	} else {
		new animationState(target, name, group);
		
		log.report('New animation state <strong>'+name+'</strong> was created. Its group is <strong>'+group+'</strong>.');
	}
	/*
	if(newState) {
		this.animationStates[group].push(newState);
		anigenActual.eventUIRefresh();
	}
	*/
	anigenActual.eventUIRefresh();
}

root.prototype.newAnimGroup = function(groupName) {
	var group = this.animationStates[groupName];
	if(!group || !group[0]) { return; }
	
	var animGroup = new animationGroup(group[0], null, null, [ 'd' ]);
	if(!animGroup) { return; }
	
	var insertInto;
	var insertBefore;
	
	if(this.selected instanceof SVGGElement) {
		insertInto = this.selected;
		insertBefore = null;
	} else if(this.selected == this.svgElement) {
		insertInto = this.selected;
		insertBefore = this.ui.container;
	} else if(this.selected.isChildOf(this.defs) || this.selected == this.defs) {
		insertInto = this.getCurrentLayer() || this.svgElement;
		if(insertInto == this.svgElement) {
			insertBefore = this.ui.container;
		} else {
			insertBefore = null;
		}
	} else {
		console.warn('other');
		insertInto = this.selected.getViableParent();
		insertBefore = this.selected;
		while(insertInto.getViableParent() && !(insertInto instanceof SVGGElement && insertInto.getAttribute('anigen:type') != 'animationGroup') && insertInto != this.svgElement) {
			insertBefore = insertInto.nextElementSibling;
			insertInto = insertInto.getViableParent();
		}
	}
	
	// prevent insertion into other animation groups
	var intoNew = insertInto;
	var beforeNew = insertBefore;
	while(intoNew != this.svgElement) {
		beforeNew = intoNew;
		intoNew = intoNew.getViableParent();
		if(beforeNew && beforeNew.getAttribute('anigen:type') == 'animationGroup') {
			insertInto = intoNew;
			insertBefore = beforeNew;
		}
	}
	
	animGroup.element.generateId(true);
	
	if(insertBefore) {
		insertInto.insertBefore(animGroup.element, insertBefore);
		log.report('New animated group <strong>'+animGroup.getAttribute('id')+'</strong> was created in <strong>'+insertInto.getAttribute('id')+'</strong>, placed before <strong>'+insertBefore.getAttribute('id')+'</strong>. Its group name is <strong>'+groupName+'</strong>.');
	} else {
		insertInto.appendChild(animGroup.element);
		log.report('New animated group <strong>'+animGroup.getAttribute('id')+'</strong> was created in <strong>'+insertInto.getAttribute('id')+'</strong>. Its group name is <strong>'+groupName+'</strong>.');
	}
	
	this.elementToCoords(animGroup.element);
	this.history.add(new historyCreation(animGroup.element.cloneNode(true), animGroup.element.parentNode.id, animGroup.element.nextElementSibling ? animGroup.element.nextElementSibling.id : null, false));
	
	anigenActual.eventUIRefresh();
	this.select(animGroup.element);
}

root.prototype.changeId = function(target, toId, selectAfter) {
	if(!toId || toId.length == 0) { return; }
	var old = document.getElementById(toId);
	var oldOld;
	if(old && toId.substring(0, 6) == 'anigen') { return; }
	if(old) {
		old.removeAttribute('id');
		old.generateId();
		oldOld = old.id;
	}
	
	var targetOld = target.id;
	target.setAttribute('id', toId);
	
	if(oldOld) {
		this.history.add(new historyGeneric(null, 'document.getElementById("'+toId+'").id="'+targetOld+'";document.getElementById("'+oldOld+'").id="'+toId+'";',
				'document.getElementById("'+toId+'").id="'+oldOld+'";document.getElementById("'+targetOld+'").id="'+toId+'";' ));
		log.report('<strong>'+targetOld+'</strong> was renamed to <strong>'+toId+'</strong>. Old element <strong>'+toId+'</strong> was renamed to <strong>'+oldOld+'</strong>.');
	} else {
		this.history.add(new historyGeneric(null, 'document.getElementById("'+toId+'").id="'+targetOld+'";', 'document.getElementById("'+targetOld+'").id="'+toId+'";' ));
		log.report('<strong>'+targetOld+'</strong> was renamed to <strong>'+toId+'</strong>.');
	}
	
	
	
	anigenManager.classes.tree.seed();
	if(selectAfter) { this.select(target); }
}

// sets svg time
root.prototype.gotoTime = function(seconds) {
	if(seconds == null) {
		seconds = this.svgElement.getCurrentTime();
	} else if(seconds != this.svgElement.getCurrentTime() && popup.closeOnSeek) {
		if(popup.buttonOk) { 
			if(popup.noRemoteClick) {
				popup.hide();
			} else {
				popup.buttonOk.click();
			}
		} else {
			popup.hide();
		}
	}
	
	this.svgElement.setCurrentTime(seconds);
	anigenManager.classes.editor.clock.update();
	anigenManager.classes.context.refresh();
	this.ui.selectionBox.refresh();
}

// jumps by specific time offset	
root.prototype.seek = function(offset) {
	this.gotoTime(this.svgElement.getCurrentTime() + offset);
}

root.prototype.rebuildAnimationStates = function(target) {
	if(target == this.defs) {
		this.animationStates = null;
	}
	if(target instanceof SVGGElement) {
		if(target.getAttribute('anigen:type') == 'animationState') {
			new animationState(target);
		}
	}
	
	if(target.children) {
		for(var i = 0; i < target.children.length; i++) {
			this.rebuildAnimationStates(target.children[i]);
		}
	}
}

// adjusts the incoming SVG file for the editor to work with
root.prototype.transferIn = function() {
	if(this.svgElement == null) { return; }
	
	if (this.svgElement.getElementsByTagName("sodipodi:namedview", true).length > 0) {
		this.namedView = this.svgElement.getElementsByTagName("sodipodi:namedview", true)[0];
	} else {
		this.namedView = document.createElementNS(sodipodiNS, "sodipodi:namedview");
		this.namedView.setAttribute("id", "base");
		this.svgElement.insertBefore(this.namedView, this.svgElement.children[0]);
	}
	var loop = this.namedView.getAttribute('anigen:loop');
	var loopBegin = this.namedView.getAttribute('anigen:loopbegin');
	if(loopBegin) { anigenManager.classes.editor.clock.setMin(parseFloat(loopBegin), true); }
	if(loop) { anigenManager.classes.editor.clock.setMax(parseFloat(loop), true); }

	if (this.svgElement.getElementsByTagName("defs").length > 0) {
		this.defs = this.svgElement.getElementsByTagName("defs", true)[0];
	} else {
		this.defs = document.createElementNS(svgNS, "defs");
		this.defs.generateId();
		this.svgElement.insertBefore(this.defs, this.svgElement.children[0]);
	}
	this.defs.validate();
	
	this.svgWidth = parseFloat(this.svgElement.getAttribute("width"));
	this.svgHeight = parseFloat(this.svgElement.getAttribute("height"));
	this.svgBox = this.svgElement.getAttribute("viewBox");
	if(!this.svgBox) { this.svgBox = "0 0 " + parseFloat(this.svgWidth) + " " + parseFloat(this.svgHeight); }
	this.svgBox = this.svgBox.split(' ');
	this.svgBox[0] = parseFloat(this.svgBox[0]);
	this.svgBox[1] = parseFloat(this.svgBox[1]);
	this.svgBox[2] = parseFloat(this.svgBox[2]);
	this.svgBox[3] = parseFloat(this.svgBox[3]);
	
	this.svgRatio = this.svgElement.getAttribute("preserveAspectRatio");
	
	if(!this.svgRatio) { this.svgRatio = "xMidYMid"; }
	
	if(!this.svgWidth) { this.svgWidth = this.svgBox[2]; }
	if(!this.svgHeight) { this.svgHeight = this.svgBox[3]; }
	
	if(this.namedView.getAttribute('inkscape:cx') != null) { this.posX = parseFloat(this.namedView.getAttribute('inkscape:cx')); }
	if(this.namedView.getAttribute('inkscape:cy') != null) { this.posY = -1*parseFloat(this.namedView.getAttribute('inkscape:cy')); }
	if(this.namedView.getAttribute('inkscape:zoom') != null) { this.zoom = parseFloat(this.namedView.getAttribute('inkscape:zoom')); }

	this.svgElement.setAttribute("preserveAspectRatio", "xMidYMid");

	this.svgElement.setAttribute("width", "100%");
	this.svgElement.setAttribute("height", "100%");

	for(var i = 0; i < this.svgElement.children.length; i++) {
		if(this.svgElement.children[i] instanceof SVGAnimateElement &&
			this.svgElement.children[i].getAttribute('attributeName') == 'viewBox') {
				this.camera = new animatedViewbox(this);
		}
	}
	
	// references
	// this is actually unused at the moment
	/*
	var children = [this.svgElement].concat(this.svgElement.getChildren(true));
	for(var i = 0; i < children.length; i++) {
		children[i].removeAttribute('anigen:references');
	}
	this.svgElement.getLinkList(true, true);
	*/
	
	this.refreshUI(true);

	this.svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	this.svgElement.setAttribute("xmlns:svg", svgNS);
	this.svgElement.setAttribute("xmlns:xlink", xlinkNS);
	this.svgElement.setAttribute("xmlns:sodipodi", "http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd");
	this.svgElement.setAttribute("xmlns:inkscape", "http://www.inkscape.org/namespaces/inkscape");
	this.svgElement.setAttribute("xmlns:anigen", anigenNS);
	this.svgElement.setAttribute("anigen:version", anigenActual.versionNumeric);
}

// removes UI and other editor-specific elements and restores the original width/height/bounding box of the element, returning a file-ready root svg element
root.prototype.transferOut = function(stripIds, scale, strict) {
	if(scale == null) { scale = { 'x': 1, 'y': 1 }; }
	this.namedView.setAttribute('inkscape:cx', this.posX);
	this.namedView.setAttribute('inkscape:cy', -1*this.posY);
	this.namedView.setAttribute('inkscape:zoom', this.zoom);
	
	var oldPaused = this.svgElement.animationsPaused();
	this.pauseToggle(false);
	var oldTime = this.svgElement.getCurrentTime();
	this.svgElement.setCurrentTime(0);
	
	var par = this.svgElement.parentNode;
	var nex = this.svgElement.nextElementSibling;
	
	var selId = this.selected.getAttribute('id');
	
	par.removeChild(this.svgElement);
	
	this.svgElement.applyAnimations(true);
	
	//this.svgElement.endAnimations();		// actually unnecessary - this gets done equally well by just removing the SVG from document
	
	var clone = this.svgElement.cloneNode(true);
	
	if(nex) {
		par.insertBefore(this.svgElement, nex);
	} else {
		par.appendChild(this.svgElement);
	}
	//this.svgElement.startAnimations();
	
	this.select(selId);
	
	this.svgElement.setCurrentTime(oldTime);
	if(!oldPaused) { this.pauseToggle(true); }
	
	clone.setAttribute("viewBox", this.svgBox.join(' '));
	clone.setAttribute("width", this.svgWidth*scale.x);
	clone.setAttribute("height", this.svgHeight*scale.y);
	
	// removes interface
	var children = clone.getElementsByAttribute('anigen:lock', 'interface');
	
	// turns animatedViewbox into animation
	if(this.camera) {
		clone.appendChild(this.camera.transferOut());
		var cameraChildren = clone.getElementsByAttribute('anigen:type', 'animatedViewbox');
		for(var i = 0; i < cameraChildren.length; i++) {
			cameraChildren[i].parentNode.removeChild(cameraChildren[i]);
		}
	}
	
	for(var i = 0; i < children.length; i++) {
		children[i].parentNode.removeChild(children[i]);
	}
	
	// removes NaN pivots (which really shouldn't happen anymore)
	// removes reference counts
	children = clone.getChildren(true);
	for(var i = 0; i < children.length; i++) {
		if(isNaN(children[i].getAttribute('inkscape:transform-center-x'))) { children[i].removeAttribute('inkscape:transform-center-x'); }
		if(isNaN(children[i].getAttribute('inkscape:transform-center-y'))) { children[i].removeAttribute('inkscape:transform-center-y'); }
		children[i].removeAttribute('anigen:references');
	}
	
	if(strict) {
		var states = clone.getElementsByAttribute('anigen:type', 'animationState', true, false);
		for(var i = 0; i < states.length; i++) {
			if(states[i].parentNode.parentNode) {
				states[i].parentNode.parentNode.removeChild(states[i].parentNode);
			}
		}
	}
	
	if(stripIds) {
		clone.stripId(true);
	}
	
	return clone;
}

root.prototype.setPageSize = function(newWidth, newHeight) {
	newWidth = parseFloat(newWidth);
	newHeight = parseFloat(newHeight);
	if(newWidth == null || isNaN(newWidth) || newHeight == null || isNaN(newHeight)) { return; }
	
	var dH = this.svgBox[3] - newHeight;
	this.svgBox[1] += dH;
	this.svgBox[2] = newWidth;
	this.svgBox[3] = newHeight;
	
	this.svgWidth = newWidth;
	this.svgHeight = newHeight;
	
	this.ui.frame.refresh();
}

// saves and downloads (opens) the svg as an SVG file
root.prototype.save = function(local) {
	var type = "application\/octet-stream";
	var container = document.createElement("div");
	
	var response = this.transferOut();
	
	container.appendChild(response);
	
	var anigenHeader = "<!-- Animated using aniGen version " + anigenActual.version + " - http://anigen.org -->";
	var string = "<?xml version='1.0' encoding='UTF-8' standalone='no'?>\n<!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'>\n"+anigenHeader+"\n"+container.innerHTML;
	
	if(local) {
		try {
			localStorage.setItem('quicksave', string);
			localStorage.setItem('quicksaveFilename', this.fileName);
			
			log.report('<strong>File saved to browser storage.</strong>');
			
		} catch(ex) {
			if(typeof(Storage) !== "undefined" && localStorage.getItem("quicksaveFilename")) {
				popup.confirmation(null, "Not enought memory in browser storage. Previous save exists ("+localStorage.getItem("quicksaveFilename")+") - remove and try again?", "svg.removeLocal();svg.save(true);");
			} else {
				popup.confirmation(null, "Not enought memory in browser storage - save file locally?", "svg.save();");
			}
		}
	} else {
	
		var blob = new Blob(string.split(), { "type" : type });
		var blobURL = URL.createObjectURL(blob);
		
		var linkan = document.createElement("a");
		document.body.appendChild(linkan);
		linkan.setAttribute("href", blobURL);
		linkan.setAttribute("download", this.fileName);
		linkan.click();
		document.body.removeChild(linkan);
		
		log.report('<strong>File saved and downloaded.</strong>');
		
		return blobURL;
	}
}

root.prototype.removeLocal = function() {
	if(typeof(Storage) === "undefined") { return; }
	localStorage.removeItem("quicksaveFilename");
	localStorage.removeItem("quicksave");
}

root.prototype.loadLocal = function() {
	if(typeof(Storage) === "undefined" || !localStorage.getItem("quicksaveFilename")) { return; }
	var container = document.createElement('div');
	container.innerHTML = localStorage.getItem("quicksave");
	var newSVG = container.getElementsByTagName('svg', true)[0];
	log.report('Opening file from browser storage.');
	svg.fileIn(newSVG, localStorage.getItem("quicksaveFilename"), true);
}

// loads a NEW svg file from target
root.prototype.load = function(target) {
	if(!target || !target.files || !target.files[0]) { return; }
	var file = target.files[0];
	this.temp = null;
	var newSVG = svg.upload(file, (svg.svgElement == null || !overlay.hidden));
}

root.prototype.export = function(begin, dur, fps, scale, format, name, downsampling, crispEdges) {
	this.exportName = name || this.fileName;
	format = format || 'png';
	if(begin == null || dur == null || fps == null) { return; }
	if(scale == null) { scale = { 'x': 1, 'y': 1 }; }
	if(!downsampling) { downsampling = 1; }
	downsampling = parseInt(downsampling);
	crispEdges = crispEdges || false;
	begin = parseFloat(begin);
	dur = parseFloat(dur);
	fps = parseFloat(fps);
	if(dur <= 0 || fps <= 0) { return; }
	if(begin < 0) { begin = 0; }
	
	anigenActual.exporting = true;
	
	var clone = this.transferOut(false, scale, true);
	clone.setAttribute('preserveAspectRatio', 'none');
	
	if(crispEdges) {
		clone.setAttribute('shape-rendering', 'crispEdges');
	}
	
	var container = document.getElementById('svgArea');
	container.removeChildren();
	//container.appendChild(clone);
	
	var progress = overlay.macroExportBar();
	progress.setMin(0);
	progress.setMax(1);
	progress.setValue(0, "Rendering...");
	
	this.svgrender.load(clone);
	this.svgrender.render({
		'progressSignal': anigenActual.eventRenderProcess,
		'begin': begin,
		'FPS': fps,
		'time': dur,
		'format': format || 'png',
		'svgArea': document.getElementById('svgArea'),
		'canvas': document.getElementById('renderArea'),
		'downsampling': downsampling,
		'verbose': true
	}, anigenActual.eventRenderDone);
}

root.prototype.packRendered = function(format) {
	this.zip = new JSZip();
	
	if(this.svgrender.images.length == 1) {
		// if only one image is made, saves it without zip
		
		switch(format) {
			case "svg":
				//var type = "application\/octet-stream";
				var type = "image\/svg+xml";
				var blob = new Blob(this.svgrender.images[0].split(), { "type" : type });
				saveAs(blob, this.exportName.replace(/\..{3-4}$/, '.svg'));
				overlay.hide();
				document.getElementById('svgArea').removeChildren();
				if(anigenActual.notify) { anigenActual.bell(); }
				return;
			break;
			default:
				var pngFile = b64toBlob(this.svgrender.images[0], 'image/png');
				saveAs(pngFile, this.exportName.replace(/\..{3-4}$/, '.png'));
				overlay.hide();
				document.getElementById('svgArea').removeChildren();
				if(anigenActual.notify) { anigenActual.bell(); }
				return;
			break;
		}
	}
	
	switch(format) {
		case "svg":
			for(var i = 0; i < this.svgrender.images.length; i++) {
				var digitsNum = Math.ceil(Math.log10(this.svgrender.images.length + 1));
				this.zip.file("out" + ("0000000000000000000" + i).substr(-digitsNum, digitsNum) + ".svg", this.svgrender.images[i], {base64: false, binary: false});
			}
			break;
		default:
			for(var i = 0; i < this.svgrender.images.length; i++) {
				var digitsNum = Math.ceil(Math.log10(this.svgrender.images.length + 1));
				this.zip.file("out" + ("0000000000000000000" + i).substr(-digitsNum, digitsNum) + ".png", this.svgrender.images[i], {base64: true, binary: true});
			}
			break;
	}
	
	var content = this.zip.generate({type: "blob"});
	saveAs(content, this.exportName.replace(/\..{3-4}$/, '.zip'));
	
	document.getElementById('svgArea').removeChildren();
	
	this.forceRefresh();
	
	overlay.hide();
	anigenActual.exporting = false;
	
	if(anigenActual.notify) { anigenActual.bell(); }
}

root.prototype.forceRefresh = function() {
	var par = this.svgElement.parentNode;
	par.removeChild(this.svgElement);
	if(par.children[0]) {
		par.insertBefore(this.svgElement, par.children[0]);
	} else {
		par.appendChild(this.svgElement);
	}
	this.select();
}

root.prototype.fileIn = function(fileElement, filename, isNew) {
	if(!fileElement) {
		return;
	}
	
	if(isNew) {
		this.svgElement = this.selected = fileElement;
		this.container = anigenManager.named.svg.container || document.getElementById('anigenCanvas');
		this.container.removeChildren();
		this.container.appendChild(this.svgElement);
		
		this.container.appendChild(anigenManager.classes.rulerH.container);
		this.container.appendChild(anigenManager.classes.rulerV.container);
		
		this.svgElement.generateId(true);
		
		this.seedInterface();
		
		if(filename) {
			this.fileName = filename;
			anigenActual.resetTitle();
		}
		
		log.report('File <strong>'+filename+'</strong> was opened.');
		
		this.transferIn();
		
		this.svgElement.pauseAnimations();
		this.svgElement.setCurrentTime(0);
		anigenManager.classes.editor.refreshPause();
		
		this.rebuildAnimationStates(this.defs);
		
		this.history.clear();
		
		anigenActual.eventUIRefresh(true);
		this.refreshUI(true);
		
		document.activeElement.blur();
		overlay.hide();
	} else {
		this.mergeWith(fileElement);
	}
}

root.prototype.rasterIn = function(data) {
	var helper = document.getElementById('rasterArea');
	helper.setAttribute('src', data);
	
	var img = document.createElementNS(svgNS, 'image');
	img.setAttributeNS(xlinkNS, 'xlink:href', data);
	img.setAttribute('x', '0');
	img.setAttribute('y', '0');
	img.setAttribute('width', helper.clientWidth+"px");
	img.setAttribute('height', helper.clientHeight+"px");
	
	helper.removeAttribute('src');
	
	var pasteInto = this.getCurrentLayer();
	if(pasteInto) {
		pasteInto.appendChild(img);
	} else {
		svg.svgElement.insertBefore(img, svg.ui.container);
	}
	
	this.elementToCoords(img);
	
	this.history.add(new historyCreation(img.cloneNode(true), img.parentNode.id, img.nextElementSibling ? img.nextElementSibling.id : null, false));
}

root.prototype.mergeWith = function(other) {
	if(!(other instanceof SVGSVGElement)) { return; }
	
	// to get links, element has to be in document
	// it's put in the beginning of body so that the found elements are from other, and not the original document
	// this still has to be checked again, in case the element actually ISN'T in the other SVG but is in the old one
	var tempContainer = document.createElement('div');
		tempContainer.style['display'] = 'none !important';
	document.body.insertBefore(tempContainer, document.body.children[0]);
	tempContainer.appendChild(other);
	var links = other.getLinkList(true);
	other.generateId(true);
	
	for(var i = 0; i < links.length; i++) {
		if(!links[i].owner || !links[i].target || !links[i].owner.isChildOf(tempContainer) || !links[i].target.isChildOf(tempContainer)) { continue; }
		if(links[i].css) {
			links[i].owner.style[links[i].attribute] = links[i].type == 1 ? '#'+links[i].target.getAttribute('id') : 'url("#'+links[i].target.getAttribute('id')+'")';
		} else {
			links[i].owner.setAttribute(links[i].attribute, links[i].type == 1 ? '#'+links[i].target.getAttribute('id') : 'url("#'+links[i].target.getAttribute('id')+'")');
		}
	}
	tempContainer.removeChild(other);
	document.body.removeChild(tempContainer);
	
	var otherDefs;
	if (other.getElementsByTagName("defs").length > 0) {
		otherDefs = other.getElementsByTagName("defs", true)[0];
		for(var i = 0; i < otherDefs.children.length; i++) {
			this.defs.appendChild(otherDefs.children[i].cloneNode(true));
		}
	}
	
	var pasteInto = this.getCurrentLayer();
	
	for(var i = 0; i < other.children.length; i++) {
		if(other.children[i].nodeName 
			&& (other.children[i].nodeName.toLowerCase() == 'defs' ||
				other.children[i].nodeName.toLowerCase() == 'metadata' ||
				other.children[i].nodeName.toLowerCase() == 'sodipodi:namedview')
			) { continue; }
		if(pasteInto) {
			pasteInto.appendChild(other.children[i].cloneNode(true));
		} else {
			svg.svgElement.insertBefore(other.children[i].cloneNode(true), svg.ui.container);
		}
	}
	
	this.rebuildAnimationStates(this.svgElement);
	anigenActual.eventUIRefresh(true);
}

// uploads an SVG file and passes it on
root.prototype.upload = function(file, isNew) {
	if(!file || !(file.type.match('image/svg*') || file.type.match('image/jpeg*') || file.type.match('image/png*'))) {
		console.error('Unsupported image format.');
		return null;
	}
	if((file.type.match('image/jpeg*') || file.type.match('image/png*')) && isNew) { return null; }

	var reader = new FileReader();

	reader.onload = function() {
		if(file.type.match('image/svg*')) {
			var container = document.createElement('div');
			container.innerHTML = this.result;
			var newSVG = container.getElementsByTagName('svg', true)[0];
			svg.fileIn(newSVG, file.name, isNew);
		} else {
			svg.rasterIn(this.result);
		}
	};

	if(file.type.match('image/svg*')) {
		reader.readAsText(file);
	} else {
		reader.readAsDataURL(file);
	}
}

root.prototype.getAttributeValues = function(attribute) {
	
	switch(attribute) {
	// font
		case "font": return [ "<string>" ];
		case "font-family": return [ "<string>" ];
		case "font-size": return [ "<length>" ];
		case "font-size-adjust": return [ "<number>" ];
		case "font-stretch": return [ "normal", "wider", "narrower", "ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded" ];
		case "font-style": return ["normal", "italic", "oblique" ];
		case "font-variant": return ["normal", "small-caps" ];
		case "font-weight": return [ "normal", "bold", "bolder", "lighter", "100", "200", "300", "400", "500", "600", "700", "800", "900" ];
	// text
		case "direction": return [ "ltr", "rtl" ];
		case "letter-spacing": return [ "normal", "<length>" ];
		case "text-decoration": return [ "none", "underline", "overline", "line-through", "blink" ];
		case "unicode-bidi": return [ "normal", "embed", "bidi-override" ];
		case "word-spacing": return [ "normal", "<length>" ];
	// other visuals	
		case "clip": return [ "auto", "<shape>" ];
		case "color": return [ "<color>" ];
		case "cursor": return [ "auto", "crosshair", "default", "pointer", "move", "e-resize", "ne-resize", "nw-resize", "n-resize", "se-resize", "sw-resize", "s-resize", "w-resize| text", "wait", "help", "<iri>" ];
		case "display": return [ "inline", "none" ];
		case "overflow": return [ "visible", "hidden", "scroll", "auto" ];
		case "visibility": return [ "visible", "hidden" ];
	// clipping
		case "clip-path": return [ "none", "<iri>" ];
		case "clip-rule": return [ "nonzero", "evenodd" ];
		case "mask": return [ "none", "<iri>" ];
		case "opacity": return [ "<fraction>" ];
	// filters
		case "enable-background": return [ "accumulate", "<new>" ];
		case "filter": return [ "none", "<iri>" ];
		case "flood-color": return [ "currentColor", "<color>" ];
		case "flood-opacity": return [ "<fraction>" ];
		case "lighting-color": return [ "currentColor", "<color>" ];
	// gradients	
		case "stop-color": return [ "<color>" ];
		case "stop-opacity": return [ "<fraction>" ];
	// interactivity
		case "pointer-events": return [ "visiblePainted", "visibleFill", "visibleStroke", "visible", "painted", "fill", "stroke", "all", "none" ];
	// xlink
		case "requiredMeta": return [ "<string>" ];
		case "requiredFeatures": return [ "<string>" ];
		case "systemLanguage": return [ "<string>" ];
		case "xlink:href": return [ "<iri>" ];
		case "xlink:type": return [ "simple" ];
		case "xlink:role": return [ "<iri>" ];
		case "xlink:arcrole": return [ "<iri>" ];
		case "xlink:title": return [ "<string>" ];
		case "xlink:show": return [ "new", "replace", "embed", "other", "none" ];
		case "xlink:actuate": return [ "onLoad" ];
	// colors
		case "color-interpolation": return [ "sRGB", "auto", "linearRGB" ];
		case "color-interpolation-filters": return [ "linearRGB", "sRGB", "auto" ];
		case "color-profile": return [ "auto", "sRGB", "<iri>" ];
		case "color-rendering": return [ "auto", "optimizeSpeed", "optimizeQuality" ];
		case "fill": return [ "<color>" ];
		case "fill-opacity": return [ "<fraction>" ];
		case "fill-rule": return [ "nonzero", "evenodd" ];
		case "image-rendering": return [ "auto", "optimizeSpeed", "optimizeQuality" ];
	//	"marker": return [ "<string>" ];
		case "marker-end": return [ "none", "<iri>" ];
		case "marker-mid": return [ "none", "<iri>" ];
		case "marker-start": return [ "none", "<iri>" ];
		case "shape-rendering": return [ "auto", "optimizeSpeed", "crispEdges", "geometricPrecision" ];
		case "stroke": return [ "<color>" ];
		case "stroke-dasharray": return [ "none", "<array>" ];
		case "stroke-dashoffset": return [ "<length>" ];
		case "stroke-linecap": return [ "butt", "round", "square" ];
		case "stroke-linejoin": return [ "miter", "round", "bevel" ];
		case "stroke-miterlimit": return [ "<number>" ];
		case "stroke-opacity": return [ "<fraction>" ];
		case "stroke-width": return [ "<length>" ];
	// text
		case "text-rendering": return [ "auto", "optimizeSpeed", "optimizeLegibility", "geometricPrecision" ];
		case "alignment-baseline": return [ "auto", "baseline", "before-edge", "text-before-edge", "middle", "central", "after-edge", "text-after-edge", "ideographic", "alphabetic", "hanging", "mathematical" ];
		case "baseline-shift": return [ "baseline", "sub", "super", "<length or percentage>" ];
		case "dominant-baseline": return [ "auto", "use-script", "no-change", "reset-size", "ideographic", "alphabetic", "hanging", "mathematical", "central", "middle", "text-after-edge", "text-before-edge" ];
		case "glyph-orientation-horizontal": return [ "<angle>" ];
		case "glyph-orientation-vertical": return [ "auto", "<angle>" ];
		case "kerning": return [ "auto", "<length>" ];
		case "text-anchor": return [ "start", "middle", "end" ];
		case "writing-mode": return [ "lr-tb", "rl-tb", "tb-rl", "lr", "rl", "tb" ];
	// other	
		case "d": return [ "<string>" ];
		case "x": return [ "<length>" ];
		case "y": return [ "<length>" ];
		case "x1": return [ "<length>" ];
		case "y1": return [ "<length>" ];
		case "x2": return [ "<length>" ];
		case "y2": return [ "<length>" ];
		case "cx": return [ "<length>" ];
		case "cy": return [ "<length>" ];
		case "fx": return [ "<length>" ];
		case "fy": return [ "<length>" ];
		case "rx": return [ "<length>" ];
		case "ry": return [ "<length>" ];
		case "r": return [ "<length>" ];
		case "width": return [ "<length>" ];
		case "height": return [ "<length>" ];
		case "points": return [ "<string>" ];
		case "rotate": return [ "<string>" ];
	// even other-er
		case "externalResourcesRequired": return [ "false", "true" ];
		case "class": return [ "<string>" ];
		case "style": return [ "<string>" ];
		case "transform": return [ "<string>" ];
		case "viewBox": return [ "<string>" ];
		case "preserveAspectRatio": return [ "none", "xMinYMin", "xMidYMin", "xMaxYMin", "xMinYMid", "xMidYMid", "xMaxYMid", "xMinYMax", "xMidYMax", "xMidYMax" ];
		case "type": return [ "<string>" ];
		case "media": return [ "<string>" ];
		case "title": return [ "<string>" ];
		case "pathLength": return [ "<length>" ];
		case "textLength": return [ "<length>" ];
		case "lengthAdjust": return [ "spacing", "spacingAndGlyphs" ];
	}
	return [ "<string>" ];
}

root.prototype.getAnimatableAttributes = function(nodeName) {	
	var attrsGroup = [ "display", "visibility", "opacity", "clip-path" ];
	var attrsNonGroup = [ "fill", "fill-opacity", "stroke", "stroke-width", "stroke-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "marker", "marker-end", "marker-mid", "marker-start" ];
	
	var response = [];
	
	switch(nodeName.toLowerCase()) {
		case "g":
			response = attrsGroup.concat(attrsNonGroup);
			break;
		case "rect":
			response = [ "x", "y", "width", "height", "rx", "ry" ].concat(attrsGroup).concat(attrsNonGroup);
		case "use":
		case "image":
			response = [ "x", "y", "width", "height" ].concat(attrsGroup).concat(attrsNonGroup);
			break;
		case "circle":
			response = [ "cx", "cy", "r" ].concat(attrsGroup).concat(attrsNonGroup);
			break;
		case "ellipse":
			response = [ "cx", "cy", "rx", "ry" ].concat(attrsGroup).concat(attrsNonGroup);
			break;
		case "path":
			response = [ "d" ].concat(attrsGroup).concat(attrsNonGroup);
			break;
		case "line":
			response = [ "x1", "y1", "x2", "y2" ].concat(attrsGroup).concat(attrsNonGroup);
			break;
		case "polyline":
		case "polygon":
			response = [ "points" ].concat(attrsGroup).concat(attrsNonGroup);
			break;
		case "linearGradient":
			response = [ "x1", "y1", "x2", "y2" ].concat(attrsGroup);
			break;
		case "radialGradient":
			response = [ "cx", "cy", "r", "fx", "fy" ].concat(attrsGroup);
			break;
		case "stop":
			response = [ "stop-color", "stop-opacity", "offset" ].concat(attrsGroup);
			break;
		case "fegaussianblur":
			response = [ 'stdDeviation' ];
			break;
		default:
			response = false;
			break;
	}

	return response;
}

root.prototype.getAttributeDesription = function(attribute) {
	switch(attribute) {
		case "id": return "Element's unique identifier";
		case "transform": return "Geometric transformation applied to this element and its children";
		// font
		case "font": return "Condensed information of font information, like family, size etc";
		case "font-family": return "Font family of the selected font, or a generic family (like 'serif')";
		case "font-size": return "Text size";
		case "font-size-adjust": return "Resizing aspect ratio of letters";
		case "font-stretch": return "Whether the text should be wider or narrower";
		case "font-style": return "Normal, italic or oblique letters";
		case "font-variant": return "Normal letters or small caps";
		case "font-weight": return "How bold the text should be";
		// text
		case "direction": return "Left to right or right to left";
		case "letter-spacing": return "The amount of space between letters";
		case "text-decoration": return "Underlines, overlines, strike-throughs and blinking text (don't do blinking text though, it's not the 90s)";
		case "word-spacing": return "Additional spacing between words, but not between each letter";
		// other visuals
		case "color": return "Color, usually refering to text";
		case "cursor": return "The cursor shape over the element (like a pointer)";
		case "display": return "How (and whether) the element should be displayed";
		case "overflow": return "The treatment of objects that would overflow the element";
		case "visibility": return "Whether the element should or should not be shown";
		// clipping
		case "clip-path": return "A link to a clipping object that hides part of the element";
		case "clip-rule": return "How clipping should be treated";
		case "mask": return "A link to a masking object that hides part of the element";
		case "opacity": return "The inverse of transparency of the element - how NOT see through it is";
		// filters
		case "enable-background": return "How background of the object affected by the filter should be treated (or whether it shouldn't)";
		case "filter": return "A link to specific filter element";
		case "flood-color": return "The color used in the consturction of filter primitive subregion";
		case "flood-opacity": return "The opacity of flood color";
		case "lighting-color": return "The color of source light in filter primitives like feDiffuseLighting and feSpecularLighting";
		// gradients	
		case "stop-color": return "The color of the gradient stop";
		case "stop-opacity": return "The opacity (inverse to transparency) of the gradient stop";
		// interactivity
		case "pointer-events": return "How actions (like clicking) should affect the element if it is no longer visible or displayed";
		// colors
		case "color-interpolation": return "How colors in gradients and the like should be computed";
		case "color-interpolation-filters": return "How colors in filters and the like should be computed";
		case "color-profile": return "A link to an element color profile";
		case "color-rendering": return "Whether the user agent should focus on color quality or the speed of rendering (or try to strike a balance)";
		case "fill": return "The color of the insides of an element";
		case "fill-opacity": return "Inverse to transparency of the element's innards";
		case "fill-rule": return "How the element's overlaps with itself should be treated";
		case "image-rendering": return "Whether the user agent should focus on color quality or the speed (or try to strike a balance) when rendering an image";
		case "marker-end": return "A link to the ending marker of the object";
		case "marker-mid": return "A link to markers between the first and the last one";
		case "marker-start": return "A link to the starting marker of the object";
		case "shape-rendering": return "Whether the user agent should focus on precision, smooth edges or speed (or try to strike a balance) when rendering a shape";
		case "stroke": return "The color of the outlines of given element";
		case "stroke-dasharray": return "A comma-separated array of numbers describing how long dashes and gaps should be";
		case "stroke-dashoffset": return "Specification of the initial offset of the dashed pattern";
		case "stroke-linecap": return "How any stroke should end (and how dashes should)";
		case "stroke-linejoin": return "How corners of the stroke should be shown";
		case "stroke-miterlimit": return "The specification of the longest miter edge";
		case "stroke-opacity": return "The opacity (inverse of transparency) of the element's outline";
		case "stroke-width": return "The width of the element's outline stroke";
		// text
		case "text-rendering": return "Whether the user agent should focus on geometric precision, legibility (or try to strike a balance) when rendering text";
		case "alignment-baseline": return "Specification of the alignment of an object with respect to its parent";
		case "baseline-shift": return "Allows repositioning of the text relative to the dominant baseline";
		case "dominant-baseline": return "How the dominant baseline should be determined";
		case "glyph-orientation-horizontal": return "Horizontal rotation of the letters";
		case "glyph-orientation-vertical": return "Vertical rotation of the letters";
		case "text-anchor": return "Where the text should be anchored, be it middle, start or end";
		case "writing-mode": return "The direction of the text writing";
		// other
		case "d": return "Path information, consisting of various node types that define the path's ultimate shape";
		case "x": return "The horizontal axis of the element's origin";
		case "y": return "The vertical axis of the element's origin";
		case "cx": return "X-axis component of the element's central point";
		case "cy": return "Y-axis component of the element's central point";
		case "fx": return "X-axis component of the gradient's focal point (its origin) - usually the same as cx";
		case "fy": return "Y-axis component of the gradient's focal point (its origin) - usually the same as cy";
		case "rx": return "The length of the element's corner roundness along the horizontal axe";
		case "ry": return "The length of the element's corner roundness along the vertical axe";
		case "r": return "The element's radius - the half of its diameter and the distance from centre to the edge";
		case "width": return "Element's size along the horizontal axe";
		case "height": return "Element's size along the vertical axe";
		case "points": return "A list of points that make up the shape of the element";
	}
	
	return null;
}

root.prototype.translateGeneric = function(value) {
	switch(value) {
		case "<string>": return "";
		case "<length>": return "0px";
		case "<length or percentage>": return "0px";
		case "<number>": return "0";
		case "<shape>": return "auto";
		case "<new>": return "accumulate";
		case "<color>": return "#000000";
		case "<angle>": return "0";
		case "<fraction>": return "1";
		case "<array>": return "1,1";
		case "<iri>": return "";
	}
	
	return null;
}

root.prototype.getDefaultAttributeValue = function(attribute) {
	var values = this.getAttributeValues(attribute);
	if(!values) { return null; }
	var def = values[0];
	if(def[0] == "<") {
		return this.translateGeneric(def);
	} else {
		return def;
	}
}

root.prototype.rotate = function(target, change, aroundCenter, makeHistory) {
	if(typeof target === 'string') {
		target = document.getElementById(target);
	}
	if(!target || ((change.angle == null) && (change.x == null || change.y == null || change.dX == null || change.dY == null))) { return; }
	
	var origin;
	
	if(aroundCenter) {
		origin = target.getPivot(true);
	} else {
		origin = this.ui.selectionBox.origin || target.getPivot(true);
	}
	
	if(!(target.parentNode instanceof SVGElement)) { return; }
	var CTM = target.parentNode.getCTMBase();
	
	var angle;
	if(change.angle != null) { 
		angle = change.angle;
	} else {
		// assume x, y, dX, dY - arrive at x,y by difference of dX,dY
		var fromAngle = 180*Math.atan2(((change.y-change.dY) - origin.y), ((change.x-change.dX) - origin.x))/Math.PI;
		var toAngle = 180*Math.atan2((change.y - origin.y), (change.x - origin.x))/Math.PI;
		var angle = toAngle - fromAngle;
	}
	
	if(CTM.a < 0) { angle *= -1; }
	if(CTM.d < 0) {	angle *= -1; }
	
	origin = CTM.toUserspace(origin.x, origin.y);
	
	var rotationMatrix = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
		rotationMatrix = rotationMatrix.translate(origin.x, origin.y);
		rotationMatrix = rotationMatrix.rotate(angle);
		rotationMatrix = rotationMatrix.translate(-1*origin.x, -1*origin.y);
		
	var matrix = target.getTransformBase();
		matrix = rotationMatrix.multiply(matrix);
		
	var oldTransform = target.getTransformBase();
	
	if(makeHistory) {
		target.setAttributeHistory({'transform': matrix}, true);
	} else {
		target.setAttribute('transform', matrix);
	}
	
	if(!aroundCenter) {
		target.setPivot(this.ui.selectionBox.origin.x, this.ui.selectionBox.origin.y, true, true);
	} else {
		this.ui.selectionBox.origin = null;
	}
	
}

root.prototype.scale = function(target, change, aroundOrigin, makeHistory) {
	if(typeof target === 'string') {
		target = document.getElementById(target);
	}
	
	if(!target || ((change.scaleX == null || change.scaleY == null) && (change.x == null || change.y == null || change.dX == null || change.dY == null))) { return; }
	
	var origin;
	
	if(aroundOrigin) {
		origin = change.origin || target.getPivot(true);
	} else {
		origin = this.ui.selectionBox.origin || target.getPivot(true);
	}
	
	var coordFrom = { 'x': change.x-change.dX, 'y': change.y-change.dY };
	
	var ratio = {};
	
	if(change.scaleX != null && change.scaleY != null) {
		ratio.x = change.scaleX;
		ratio.y = change.scaleY;
	} else {
		ratio.x = (change.x-origin.x)/(coordFrom.x-origin.x);
		ratio.y = (change.y-origin.y)/(coordFrom.y-origin.y);
	}
	
	if(!(target.parentNode instanceof SVGElement)) { return; }
	var CTM = target.parentNode.getCTMBase();
	origin = CTM.toUserspace(origin.x, origin.y);
	
	var matrix = target.getTransformBase();
	
	var scaleMatrix = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
		scaleMatrix = scaleMatrix.translate(origin.x, origin.y);
		scaleMatrix = scaleMatrix.scaleNonUniform(ratio.x, ratio.y);
		scaleMatrix = scaleMatrix.translate(-1*origin.x, -1*origin.y);
	
		matrix = scaleMatrix.multiply(matrix);
	
	var oldTransform = target.getTransformBase();
	
	if(makeHistory) {
		target.setAttributeHistory({'transform': matrix}, true);
	} else {
		target.setAttribute('transform', matrix);
	}
	
	if(!aroundOrigin) {
		target.setPivot(this.ui.selectionBox.origin.x, this.ui.selectionBox.origin.y, true, true);
	} else {
		this.ui.selectionBox.origin = null;
	}
}

root.prototype.skew = function(target, skewX, change, aroundOrigin, makeHistory) {
	if(typeof target === 'string') {
		target = document.getElementById(target);
	}
	
	if(!target || change.x == null || change.y == null || change.dX == null || change.dY == null) { return; }
	
	if(aroundOrigin) {
		origin = change.origin || target.getPivot(true);
	} else {
		origin = this.ui.selectionBox.origin || target.getPivot(true);
	}
	
	if(!(target.parentNode instanceof SVGElement)) { return; }
	var CTM = target.parentNode.getCTMBase();
	origin = CTM.toUserspace(origin.x, origin.y);
	
	if(CTM.a < 0) { change.dX *= -1; }
	if(CTM.d < 0) {	change.dY *= -1; }
	
	var fromAngle, toAngle;
	if(skewX) {
		var fromAngle = 180*Math.atan2((change.y-change.dY-origin.y), (change.x - origin.x))/Math.PI;
		var toAngle = 180*Math.atan2((change.y-change.dY-origin.y), ((change.x-change.dX) - origin.x))/Math.PI;
	} else {
		var fromAngle = 180*Math.atan2((change.y-change.dY-origin.y), (change.x-change.dX-origin.x))/Math.PI;
		var toAngle = 180*Math.atan2((change.y-origin.y), (change.x-change.dX-origin.x))/Math.PI;
	}
	var angle = toAngle - fromAngle;
	
	var matrix = target.getTransformBase();
	
	var skewMatrix = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
		skewMatrix = skewMatrix.translate(origin.x, origin.y);
	if(skewX) {
		skewMatrix = skewMatrix.skewX(angle);
	} else {
		skewMatrix = skewMatrix.skewY(angle);
	}
	
	skewMatrix = skewMatrix.translate(-1*origin.x, -1*origin.y);
	matrix = skewMatrix.multiply(matrix);
	
	var oldTransform = target.getTransformBase();
	
	if(makeHistory) {
		target.setAttributeHistory({'transform': matrix}, true);
	} else {
		target.setAttribute('transform', matrix);
	}
	
	if(!aroundOrigin) {
		target.setPivot(this.ui.selectionBox.origin.x, this.ui.selectionBox.origin.y, true, true);
	} else {
		this.ui.selectionBox.origin = null;
	}
}

root.prototype.cleanse = function() {
	for(var i in this.animationStates) {
		if(!this.animationStates[i][0]) { continue; }
		this.defs.removeChild(this.animationStates[i][0].groupElement);
	}
}


