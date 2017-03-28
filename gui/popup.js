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
	
	this.buttonOk = null;
	this.buttonCancel = null;
	this.draggable = false;
	
	this.closeOnSeek = false;
	
	document.body.appendChild(this.container);
	
	this.container.addEventListener("click", function(event) { 
		event.preventDefault ? event.preventDefault() : event.returnValue = false;
		event.stopPropagation ? event.stopPropagation() : window.event.cancelBubble = true;
	}, false);
	
	this.container.addEventListener("mousedown", this.eventMouseDown, false);
	this.container.addEventListener("mouseup", this.eventMouseUp, false);
	
	this.hidden = true;
	this.event = null;
	
	this.lastPosition = { 'x': null, 'y': null };
	
	this.lastEvent = null;
	
	document.activeElement.blur();
}

popup.prototype.eventMouseDown = function(event) {
	if(!popup.draggable) {
		popup.lastEvent = null;
		return;
	}
	if(event.target != popup.container && event.target != popup.content) { return; }
	
	popup.lastEvent = event;
}

popup.prototype.eventMouseUp = function(event) {
	popup.lastEvent = null;
	
}



popup.prototype.hide = function() {
	if(anigenManager.classes.context && anigenManager.classes.context.buttons) {
		anigenManager.classes.context.buttons.children.setState(0);
		anigenManager.classes.context.buttons.animate.setState(0);
	}
	
	this.buttonOk = null;
	this.buttonCancel = null;
	
	this.container.style.display = 'none';
	this.container.style.opacity = '0';
	this.hidden = true;
	
	this.event = null;
	this.lastEvent = null;
	
	this.closeOnSeek = false;
	
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
		this.draggable = false;
		this.container.removeClass('draggable');
		
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
		this.draggable = true;
		this.container.addClass('draggable');
		
		toX = this.lastPosition.x != null ? this.lastPosition.x : window.innerWidth/2 - width/2;
		try {
			toY = this.lastPosition.y != null ? this.lastPosition.y : anigenManager.named.context.y+anigenManager.named.context.height - height/2;
		} catch(e) {
			toY = this.lastPosition.y != null ? this.lastPosition.y : window.innerHeight/2 - height/2;
		}
	}
	
	this.moveTo(toX2 != null && (toX + width) > window.innerWidth ? toX2 : toX, toY);
	
	this.container.style.opacity = '1';
	this.hidden = false;
}

popup.prototype.moveTo = function(toX, toY) {
	var size = this.container.getBoundingClientRect();
	var width = (size.right-size.left);
	var height = (size.bottom-size.top);
	
	if((toX + width + 2) > window.innerWidth) {
		toX = window.innerWidth - width - 2;
	}
	
	if((toY + height + 2) > window.innerHeight) {
		toY = window.innerHeight - height - 2;
	}
	
	if(toX < 2) { toX = 2; }
	if(toY < 2) { toY = 2; }
	
	toX = Math.round(toX);
	toY = Math.round(toY);
	
	this.container.style.top = toY + 'px';
	this.container.style.left = toX + 'px';
	
	this.x = toX;
	this.y = toY;
}

popup.prototype.moveBy = function(dX, dY) {
	this.moveTo(this.x+dX, this.y+dY);
}



popup.prototype.isHidden = function() {
	return this.hidden;
}

popup.prototype.reset = function() {
	this.hide();
	this.buttonOk = null;
	this.buttonCancel = null;
	this.content.removeChildren();
}

popup.prototype.add = function(element) {
	this.content.appendChild(element);
	return element;
}

popup.prototype.addButton = function(button) {
	this.content.appendChild(button);
}
popup.prototype.addButtonOk = function(action) {
	if(!action) { action = ""; }
	var button = document.createElement("button");
	button.setAttribute("class", "black");
	button.setAttribute("onclick", "popup.hide();"+action);
	button.appendChild(document.createTextNode("Ok"));
	this.buttonOk = button;
	this.content.appendChild(button);
}
popup.prototype.addButtonCancel = function(action) {
	if(!action) { action = ""; }
	var button = document.createElement("button");
	button.setAttribute("onclick", "popup.hide();"+action);
	button.appendChild(document.createTextNode("Cancel"));
	this.buttonCancel = button;
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
	
	var value = anigenManager.classes.editor.clock.container.innerHTML;
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
	
	var attribute = svg.selected.getAttribute('attributeName');
	
	var canInbetween = false;
	for(var i = 0; i < anigenManager.classes.windowAnimation.selected.length-1; i++) {
		if(anigenManager.classes.windowAnimation.selected[i] == anigenManager.classes.windowAnimation.selected[i+1]-1) {
			canInbetween = true;
			break;
		}
	}
	
	var hasSelection = anigenManager.classes.windowAnimation.selected.length > 1;
	
	tArray.push([ build.icon("arrow_upward"), "Move up" ]);
	tArray.push([ build.icon("add"), "Duplicate" ]);
	tArray.push([ build.icon("arrow_downward"), "Move down" ]);
	tArray.push([ "", "" ]);
	tArray.push([ build.icon("add_circle_outline"), "Create inbetween" ]);
	tArray.push([ build.icon("timer"), "Balance " + (canInbetween ? 'selected' : 'all') ]);
	tArray.push([ build.icon("replay"), "Reverse "+ (canInbetween ? 'selected' : 'all') ]);
	if(attribute == 'display' || attribute == 'visibility') {
		tArray.push([ build.icon("flip"), "Invert " + (anigenManager.classes.windowAnimation.selected.length > 1 ? 'selected' : 'keyframe') ]);
	} else {
		tArray.push([ build.icon("zoom_out_map"), "Scale " + (anigenManager.classes.windowAnimation.selected.length > 1 ? 'selected...' : 'all...') ]);
	}
	tArray.push([ build.icon("delete"), "Remove " + (anigenManager.classes.windowAnimation.selected.length > 1 ? 'selected' : 'this keyframe') ]);
	
	if(!canInbetween && index == 0) {
		rAttributes.push({ 'class': 'disabled' });
	} else {
		rAttributes.push({ 'onclick': 'popup.hide();anigenManager.classes.windowAnimation.contextMenuEvaluate("up", '+index+');',
			'title': 'Moves ' + (canInbetween ? 'selected keyframes' : 'this keyframe') + ' up, moving values and splines.'
		});
	}
	rAttributes.push({ 'onclick': 'popup.hide();anigenManager.classes.windowAnimation.contextMenuEvaluate("duplicate", '+index+');',
		'title': 'Duplicates ' + (canInbetween ? 'selected keyframes' : 'this keyframe') + ', creating an identical copy ' + (canInbetween ? 'for every selected keyframe' : 'of it') + '.'
	});
	if(!canInbetween && index == anigenManager.classes.windowAnimation.animation.keyframes.length-1) {
		rAttributes.push({ 'class': 'disabled' });
	} else {
		rAttributes.push({ 'onclick': 'popup.hide();anigenManager.classes.windowAnimation.contextMenuEvaluate("down", '+index+');',
			'title': 'Moves ' + (canInbetween ? 'selected keyframes' : 'this keyframe') + ' down, moving values and splines.'
		});
	}
	rAttributes.push({ 'class': 'hr' });

	if(canInbetween) {
		rAttributes.push({ 'onclick': 'popup.hide();anigenManager.classes.windowAnimation.contextMenuEvaluate("inbetween", '+index+');',
			'title': 'Creates new keyframes between all neighbouring selected keyframes; the new value half way between that of the original keyframes.'
		});
	} else {
		rAttributes.push({ 'class': 'disabled' });
	}
	
	if(canInbetween || anigenManager.classes.windowAnimation.selected.length == 0) {
		rAttributes.push({ 'onclick': 'popup.hide();anigenManager.classes.windowAnimation.contextMenuEvaluate("balance", '+index+');',
			'title': 'Sets the times of ' + (canInbetween ? 'selected' : 'all') + ' keyframes to be spread evenly across ' + (canInbetween ? 'selected intervals' : 'the animation') + '.'
		});
		rAttributes.push({ 'onclick': 'popup.hide();anigenManager.classes.windowAnimation.contextMenuEvaluate("reverse", '+index+');',
			'title': 'Reverses animation ' + (canInbetween ? 'for selected keyframes' : '') + ' by flipping values around ' + (canInbetween ? 'for each selected intervals' : '') + '.'
		});
	} else {
		rAttributes.push({ 'class': 'disabled' });
		rAttributes.push({ 'class': 'disabled' });
	}
	
	if(attribute == 'display' || attribute == 'visibility') {
		rAttributes.push({ 'onclick': 'popup.hide();anigenManager.classes.windowAnimation.contextMenuEvaluate("invert", '+index+');',
			'title': 'Inverts values of ' + (canInbetween ? 'selected keyframes' : 'this keyframe') + '.'
		});
	} else {
		if(anigenManager.classes.windowAnimation.animation.isScalable()) {
			rAttributes.push({ 'onclick': 'popup.macroScaleKeyframe(null, '+index+');',
				'title': 'Scales values of ' + (canInbetween ? 'selected' : 'all') + ' keyframes by given factor.'
			});
		} else {
			rAttributes.push({ 'class': 'disabled' });
		}
	}
	rAttributes.push({ 'onclick': 'popup.hide();anigenManager.classes.windowAnimation.contextMenuEvaluate("delete", '+index+');',
		'title': 'Removes  ' + (canInbetween ? 'selected keyframes' : 'this keyframe') + '.'
	});
	
	this.add(build.table(tArray, null, rAttributes)).setAttribute('class', 'popup-menu');
	
	this.show({'x': event.clientX, 'y': event.clientY });
}

popup.prototype.macroLayerContextMenu = function(event, targetId) {
	this.reset();
	
	var tArray = [];
	var rAttributes = [];
	
	var selText = anigenManager.classes.windowAnimation.selected.length > 0 ? "selected" : "keyframes";
	
	tArray.push([ build.icon("add"), "Add layer..." ]);
	tArray.push([ build.icon("edit"), "Rename layer..." ]);
	tArray.push([ "", "" ]);
	tArray.push([ build.icon("arrow_upward"), "Raise layer" ]);
	tArray.push([ build.icon("arrow_downward"), "Lower layer" ]);
	tArray.push([ "", "" ]);
	tArray.push([ build.icon("storage"), "Duplicate layer" ]);
	tArray.push([ build.icon("delete"), "Delete layer" ]);
	
	rAttributes.push({ 'onclick': 'popup.hide();anigenManager.classes.windowLayers.contextMenuEvaluate("add", "'+targetId+'");' });
	rAttributes.push({ 'onclick': 'popup.hide();anigenManager.classes.windowLayers.contextMenuEvaluate("rename", "'+targetId+'");' });
	rAttributes.push({ 'class': 'hr' });
	rAttributes.push({ 'onclick': 'popup.hide();anigenManager.classes.windowLayers.contextMenuEvaluate("raise", "'+targetId+'");' });
	rAttributes.push({ 'onclick': 'popup.hide();anigenManager.classes.windowLayers.contextMenuEvaluate("lower", "'+targetId+'");' });
	rAttributes.push({ 'class': 'hr' });
	rAttributes.push({ 'onclick': 'popup.hide();anigenManager.classes.windowLayers.contextMenuEvaluate("duplicate", "'+targetId+'");' });
	rAttributes.push({ 'onclick': 'popup.hide();anigenManager.classes.windowLayers.contextMenuEvaluate("delete", "'+targetId+'");' });
	
	
	this.add(build.table(tArray, null, rAttributes)).setAttribute('class', 'popup-menu');
	
	this.show({'x': event.clientX, 'y': event.clientY });
}

popup.prototype.macroContextMenu = function(target) {
	this.reset();
	var evaluated = svg.evaluateEventPosition( { 'clientX': target.x, 'clientY': target.y } );
	
	var tArray = [];
	var rAttributes = [];
	
	var selText = anigenManager.classes.windowAnimation.selected.length > 0 ? "selected" : "keyframes";
	
	tArray.push([ build.icon("undo"), "Undo", "Ctrl+Z" ]);
		if(svg.history.index >= 0) {
			rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.history.undo();' });
		} else {
			rAttributes.push({ 'class': 'disabled' });
		}
	
	tArray.push([ build.icon("redo"), "Redo", "Ctrl+Y" ]);
		if(svg.history.index < svg.history.histArray.length-1) {
			rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.history.redo();' });
		} else {
			rAttributes.push({ 'class': 'disabled' });
		}
	
	if(svg.selected instanceof SVGAnimationElement || (svg.selected.shepherd && svg.selected.shepherd instanceof animationGroup)) {
		tArray.push([ "", "", "" ]);
			rAttributes.push({ 'class': 'hr' });
		tArray.push([ build.icon("tune"), "Set value...", "Ctrl+R" ]);
			rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();popup.macroSetCurrentValue();' });
			
		if(svg.selected.shepherd && svg.selected.shepherd instanceof animationGroup) {
			tArray.push([ build.icon("settings"), "Create new state...", "" ]);
				rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();popup.macroAddState();' });
		}
	} else if(svg.selected.getAttribute('anigen:type') != 'animationGroup' && !svg.selected.hasAnimation()) {
		if(svg.selected instanceof SVGSVGElement) {
			tArray.push([ "", "", "" ]);
				rAttributes.push({ 'class': 'hr' });
		} else {
			tArray.push([ "", "", "" ]);
				rAttributes.push({ 'class': 'hr' });
			tArray.push([ build.icon("fingerprint"), "To animation state...", "" ]);
				rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();popup.macroToAnimationState(null, svg.selected);' });
		}
		tArray.push([ build.icon("power_settings_new", "turn-90"), "Create animated group...", "" ]);
			rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();popup.macroNewAnimationGroup();' });
	}
	
	tArray.push([ "", "", "" ]);
		rAttributes.push({ 'class': 'hr' });
		
		
	tArray.push([ build.icon("content_cut"), "Cut", "Ctrl+X" ]);
		if(svg.selected != svg.svgElement) {
			rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.cut(svg.selected);' });
		} else {
			rAttributes.push({ 'class': 'disabled' });
		}
		
	tArray.push([ build.icon("content_paste"), "Paste", "Ctrl+V" ]);
		if(svg.elementTemp) {
			if(svg.selected.getAttribute('inkscape:groupmode') == 'layer' || svg.selected == svg.svgElement || svg.elementTemp.isAnimation()) {
				rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.paste({ "x": '+evaluated.x+', "y": '+evaluated.y+' }, svg.selected);'});
			} else {
				rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.paste({ "x": '+evaluated.x+', "y": '+evaluated.y+' }, svg.selected.parentNode, svg.selected);'});
			}
		} else {
			rAttributes.push({ 'class': 'disabled' });
		}
	
	tArray.push([ build.icon("content_copy"), "Copy", "Ctrl+C" ]);
	tArray.push([ "", "", "" ]);
	tArray.push([ build.icon("storage"), "Duplicate", "Ctrl+D" ]);
	tArray.push([ build.icon("link"), "Create link", "Alt+L" ]);
	tArray.push([ build.icon("delete"), "Delete", "Delete" ]);
		if(svg.selected != svg.svgElement) {
			rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.copy(svg.selected);' });
			rAttributes.push({ 'class': 'hr' });
			rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.duplicate(svg.selected);'});
			rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.createLink(svg.selected);'});
			rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.delete(svg.selected);'});
		} else {
			rAttributes.push({ 'class': 'disabled' });
			rAttributes.push({ 'class': 'hr' });
			rAttributes.push({ 'class': 'disabled' });
			rAttributes.push({ 'class': 'disabled' });
			rAttributes.push({ 'class': 'disabled' });
		}
		
	tArray.push([ "", "", "" ]);
		rAttributes.push({ 'class': 'hr' });
		
	tArray.push([ build.icon("change_history"), "Select parent", "Alt+Up" ]);
		if(svg.selected != svg.svgElement) {
			rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.select(svg.selected.getViableParent());' });
		} else {
			rAttributes.push({ 'class': 'disabled' });
		}
	
	tArray.push([ build.icon("details"), "Select first child", "Alt+Down" ]);
		if(svg.selected.children.length > 0) {
			rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.select(svg.selected.children[0]);' });
		} else {
			rAttributes.push({ 'class': 'disabled' });
		}
	
	
	if(anigenActual.tool == 4 && svg.selected != svg.svgElement) {	// picker
		tArray.push([ "", "", "" ]);
			rAttributes.push({ 'class': 'hr' });
		
		if(!(svg.selected instanceof SVGAnimationElement) && !(svg.selected.shepherd instanceof SVGAnimationElement) &&
			svg.selected.isVisualElement() && !svg.selected.isChildOf(svg.defs)) {
			// regular element selected
			tArray.push([ build.icon("format_paint"), "Target fill → Selection fill", "" ]);
				rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();var trg=document.getElementById("'+target.target.getAttribute('id')+'");svg.selected.setAttributeHistory({"fill": trg.style.fill, "fillOpacity": trg.style.fillOpacity || 1});'});
				
			tArray.push([ "", "Target stroke → Selection fill", "" ]);
				rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();var trg=document.getElementById("'+target.target.getAttribute('id')+'");svg.selected.setAttributeHistory({"fill": trg.style.stroke, "fillOpacity": trg.style.strokeOpacity || 1});'});
			
			tArray.push([ build.icon("brush"), "Target fill → Selection stroke", "" ]);
				rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();var trg=document.getElementById("'+target.target.getAttribute('id')+'");svg.selected.setAttributeHistory({"stroke": trg.style.fill, "strokeOpacity": trg.style.fillOpacity || 1});'});
				
			tArray.push([ "", "Target stroke → Selection stroke", "" ]);
				rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();var trg=document.getElementById("'+target.target.getAttribute('id')+'");svg.selected.setAttributeHistory({"stroke": trg.style.stroke, "strokeOpacity": trg.style.strokeOpacity || 1});'});
				
		} else {
			// animation selected
			var isContent = false;
			
			if(svg.selected instanceof SVGAnimateMotionElement) {
				isContent = true;
				
				if(target.target instanceof SVGPathElement) {
					
					tArray.push([ build.icon("swap_calls"), "Copy path to animation (absolute)", "" ]);
					rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();var trg=document.getElementById("'+target.target.getAttribute('id')+'");svg.selected.setPath(trg, true);svg.selected.commit();svg.select();'});
				
					tArray.push([ "", "Copy path to animation (relative)", "" ]);
					rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();var trg=document.getElementById("'+target.target.getAttribute('id')+'");svg.selected.setPath(trg, false);svg.selected.commit();svg.select();'});
				
				} else {
					tArray.push([ build.icon("swap_calls"), "Copy path to animation", "" ]);
					rAttributes.push({ 'class': 'disabled', 'title': 'Target is not a path.' });
				}
			}
			
			if(svg.selected instanceof SVGAnimateElement && anigenManager.classes.windowAnimation.selected.length > 0) {
				isContent = true;
				
				tArray.push([ build.icon("format_color_text"), "Copy attribute to animation", "" ]);
					var val = event.target.style[svg.selected.getAttribute('attributeName')] || event.target.getAttribute(svg.selected.getAttribute('attributeName'));
					
					if(val) {
						rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();for(var i = 0; i < anigenManager.classes.windowAnimation.selected.length; i++) { svg.selected.setValue(anigenManager.classes.windowAnimation.selected[i], "'+val+'", true); } svg.selected.commit();svg.select();',
							'title': 'Value: '+val});
					} else {
						rAttributes.push({ 'class': 'disabled', 'title': 'No corresponding attribute in target.' });
					}
			}
			
			var anim = typeof target.target.getAnimations === 'function' ? target.target.getAnimations() : null;
			
			if(anim && isContent) {
				tArray.push([ "", "", "" ]);
				rAttributes.push({ 'class': 'hr' });
			}
				
			if(anim) {
				
				for(var i = 0; i < anim.length; i++) {
					var animIcon = "";
					var descr = "Copy timing from "+anim[i].getAttribute('id');
					
					if(anim[i] instanceof SVGAnimateMotionElement) {
						animIcon = build.icon("swap_calls");
					} else if(anim[i] instanceof SVGAnimateTransformElement) {
						switch(anim[i].getAttribute('type')) {
							case 'translate': animIcon = build.icon("trending_up"); break;
							case 'rotate': animIcon = build.icon("refresh"); break;
							case 'scale': animIcon = build.icon("zoom_out_map"); break;
							case 'skewX': animIcon = build.icon("swap_horiz"); break;
							case 'skewY': animIcon = build.icon("swap_vert"); break;
						}
					} else if(anim[i].shepherd) {
						if(anim[i].shepherd instanceof animationGroup) {
							animIcon = build.icon("power_settings_new", "turn-90");
							if(anim[i].getAttribute('anigen:group')) {
								descr += " ("+anim[i].getAttribute('anigen:group')+")";
							}
						} else if(anim[i].shepherd instanceof animatedViewport) {
							animIcon = build.icon("videocam");
						}
					} else {
						animIcon = build.icon("text_format");
						descr += " ("+anim[i].getAttribute('attributeName')+")";
					}
					
					tArray.push([ animIcon, descr, "" ]);
						if(svg.selected.shepherd instanceof animationGroup) {
							rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();var trg=document.getElementById("'+anim[i].getAttribute('id')+'");svg.selected.shepherd.pasteTiming(trg.shepherd || trg, true);svg.select(svg.selected.shepherd.commit());'});
						} else {
							rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();var trg=document.getElementById("'+anim[i].getAttribute('id')+'");svg.selected.pasteTiming(trg.shepherd || trg, true);svg.select(svg.selected.commit());'});
						}
				}
			} else {
				tArray.push([ build.icon("hourglass_empty"), "Copy animation timing", "" ]);
					rAttributes.push({ 'class': 'disabled', 'title': 'Target has no animations.' });
			}
		}
		
	}
	
	
	
	this.add(build.table(tArray, null, rAttributes)).setAttribute('class', 'popup-menu');
	
	this.show(target);
}

popup.prototype.macroScaleKeyframe = function(target, index) {
	this.reset();
	
	var okAction = '';
	
	if(anigenManager.classes.windowAnimation.animation instanceof animationGroup ||
		anigenManager.classes.windowAnimation.animation instanceof SVGAnimateElement) {
		this.add(build.input('number', '1', { 'id': 'anigenScale', 'step': 0.05, 'title': 'Scale factor' }));
		
		okAction += 'var scale=document.getElementById("anigenScale");';
		okAction += 'anigenManager.classes.windowAnimation.contextMenuEvaluate("scale", '+index+', scale.value);';
		
	} else if(anigenManager.classes.windowAnimation.animation.getAttribute('type') == 'rotate') {
		this.add(build.icon('refresh', 'md-24'));
		this.add(build.input('number', '1', { 'id': 'anigenScaleAngle', 'step': 0.05, 'title': 'Angle scale factor' }));
		this.add(build.icon('zoom_out_map', 'md-24 turn-45'));
		this.add(build.input('number', '1', { 'id': 'anigenScaleX', 'step': 0.05, 'title': 'X axe scale factor' }));
		this.add(build.input('number', '1', { 'id': 'anigenScaleY', 'step': 0.05, 'title': 'Y axe scale factor' }));
		
		okAction += 'var scaleAngle=document.getElementById("anigenScaleAngle");';
		okAction += 'var scaleX=document.getElementById("anigenScaleX");';
		okAction += 'var scaleY=document.getElementById("anigenScaleY");';
		okAction += 'anigenManager.classes.windowAnimation.contextMenuEvaluate("scale", '+index+', {"angle":scaleAngle.value,"x":scaleX.value,"y":scaleY.value});';

	} else {
		this.add(build.icon('zoom_out_map', 'md-24 turn-45'));
		this.add(build.input('number', '1', { 'id': 'anigenScaleX', 'step': 0.05, 'title': 'X axe scale factor' }));
		this.add(build.input('number', '1', { 'id': 'anigenScaleY', 'step': 0.05, 'title': 'Y axe scale factor' }));
		
		okAction += 'var scaleX=document.getElementById("anigenScaleX");';
		okAction += 'var scaleY=document.getElementById("anigenScaleY");';
		okAction += 'anigenManager.classes.windowAnimation.contextMenuEvaluate("scale", '+index+', {"x":scaleX.value,"y":scaleY.value});';
		
	}
	
	this.addButtonOk(okAction);
	this.addButtonCancel();
	
	this.show(target);
}

popup.prototype.macroLoop = function(target) {
	this.reset();
	
	var okAction = '';
		okAction += 'var min=parseFloat(document.getElementById("anigenMinTime").value);';
		okAction += 'var max=parseFloat(document.getElementById("anigenMaxTime").value);';
		okAction += 'if(isNaN(min)){min=null;}';
		okAction += 'if(isNaN(max)){max=null;}';
		okAction += 'anigenManager.classes.editor.clock.setMin(min, true);';
		okAction += 'anigenManager.classes.editor.clock.setMax(max, true);';
		okAction += 'anigenManager.classes.editor.clock.update();';
		
	var cancelAction = '';
		cancelAction += 'anigenManager.classes.editor.clock.setMin();';
		cancelAction += 'anigenManager.classes.editor.clock.setMax();';
		cancelAction += 'anigenManager.classes.editor.clock.update();';
	
	var clock = anigenManager.classes.editor.clock;
	
	this.add(build.input('number', clock.minTime || 0, { 'id': 'anigenMinTime', 'min': 0,
		'onchange': 'var max=parseFloat(document.getElementById("anigenMaxTime").value);if(isNaN(max)){return;}if(this.value>max){this.value=max;}'
	}));
	this.add(build.input('number', clock.maxTime || 0, { 'id': 'anigenMaxTime', 'min': 0,
		'onchange': 'var min=parseFloat(document.getElementById("anigenMinTime").value);if(isNaN(min)){return;}if(this.value<min){this.value=min;}'
	}));
	
	
	this.addButtonOk(okAction);
	
	var button = document.createElement("button");
	button.setAttribute("class", "middle");
	button.setAttribute("onclick", "popup.hide();"+cancelAction);
	button.appendChild(document.createTextNode("Remove"));
	
	this.addButton(button);
	
	this.addButtonCancel();
	
	this.show(target);
}


popup.prototype.macroSetCurrentValue = function(target) {
	var animation = svg.selected.shepherd || svg.selected;
	if(!animation || !(animation instanceof SVGAnimationElement)) { return; }
	
	animation.getKeyframes();
	
	this.reset();
	
	svg.pauseToggle(false);
	anigenManager.classes.editor.refreshPause();
	
	var currentHistoryIndex = svg.history.index;	// revert point
	
	var closest = animation.getClosest(true);
	
	if(closest.progress > 1 || closest.progress < 0) {		// needs stretching
		var closestFrame = animation.stretchTo();
		if(!closestFrame) { return; }	// can't for some reason
		
		anigenManager.classes.windowAnimation.animation = animation.commit();
		anigenManager.classes.windowAnimation.refresh();
		animation = anigenManager.classes.windowAnimation.animation;
		
		closest.progress = closest.progress < 0 ? 0 : 1;
		
		closest = animation.getClosest(true);
	}
	
	var closestExclusive = animation.getClosest();
	
	var isEdit = Math.abs(closest.progress-closest.closest.frame.time) < 0.00001;
	
	var cancelAction = 'svg.history.toIndex('+currentHistoryIndex+');';	// rolls back history on cancel
	
	this.noRemoteClick = true;
	
	// this prevents remote ok action (and creation of new keyframe) when no value was changed
	var okAction = 'popup.noRemoteClick=null;svg.evaluateSetCurrentValue();';
	
	if(animation instanceof animatedViewbox) {
		this.add(build.icon('zoom_out_map', 'md-24 turn-45'));
		this.add(build.input('number', closest.previous.frame.value.x, { 'style': 'width:5em', 'step': 1, 'id': 'anigenAddValueX', 'title': 'Axis X', 'onchange': okAction }));
		this.add(build.input('number', closest.previous.frame.value.y, { 'style': 'width:5em','step': 1, 'id': 'anigenAddValueY', 'title': 'Axis Y', 'onchange': okAction }));
		
		this.add(build.icon('zoom_out_map', 'md-24'));
		this.add(build.input('number', closest.previous.frame.value.width, { 'style': 'width:5em','step': 1, 'min': 0, 'id': 'anigenAddValueWidth', 'title': 'Width', 'onchange': okAction }));
		this.add(build.input('number', closest.previous.frame.value.height, { 'style': 'width:5em','step': 1, 'min': 0, 'id': 'anigenAddValueHeight', 'title': 'Height', 'onchange': okAction }));
		
	} else if(animation instanceof animationGroup) {
		var chil = svg.animationStates[animation.groupName];
		var opt = [];
		
		for(var i = 0; i < chil.length; i++) {
			opt.push({'value': String(i), 'text': String(chil[i].name)});
			if(closest.previous.frame.value == i) { opt[opt.length-1].selected = 'selected'; }
		}
		
		var stateSelect = build.select(opt);
			stateSelect.setAttribute('onchange', okAction);
			stateSelect.setAttribute('id', 'anigenAddValue');
		
		var intensity;
		if(!closestExclusive.previous.frame) {
			intensity = build.slider(isEdit ? closest.previous.frame.intensity : 1, { 'min': 0, 'max': 1, 'step': 0.01, 'disabled': 'disabled'}, true, true);
		} else {
			intensity = build.slider(isEdit ? closest.previous.frame.intensity : 1, { 'min': 0, 'max': 1, 'step': 0.01, 'onchange': okAction, 'title': 'Intensity'}, true, true);
		}
		intensity.setAttribute('id', 'anigenIntensity');
		intensity.style.display = 'inline-block';
		
		this.add(build.icon('fingerprint', 'md-24'));
		this.add(stateSelect);
		
		this.add(build.icon('star_half', 'md-24'));
		this.add(intensity);
		
		
	} else if(animation instanceof SVGAnimateMotionElement) {
		this.add(build.icon('swap_calls', 'md-24'));
		this.add(build.input('number', closest.previous.frame.value*100, { 'id': 'anigenAddValue', 'min': 0, 'max': 100, 'step': 0.1, 'title': 'Distance as percentage', 'onchange': okAction }));
	} else {
		if(animation instanceof SVGAnimateTransformElement) {
			switch(animation.getAttribute('type')) {
				case 'rotate':
					this.add(build.icon('refresh', 'md-24'));
					this.add(build.input('number', closest.previous.frame.value.angle, { 'id': 'anigenAddValue', 'title': 'Angle', 'onchange': okAction }));
				case 'translate':
					this.add(build.icon('zoom_out_map', 'md-24 turn-45'));
					this.add(build.input('number', closest.previous.frame.value.x, { 'id': 'anigenAddValueX', 'title': 'Axis X', 'onchange': okAction }));
					this.add(build.input('number', closest.previous.frame.value.y, { 'id': 'anigenAddValueY', 'title': 'Axis Y', 'onchange': okAction }));
					break;
				case 'scale':
					this.add(build.icon('zoom_out_map', 'md-24'));
					this.add(build.input('number', closest.previous.frame.value.x*100, { 'id': 'anigenAddValueX', 'title': 'Scale X', 'onchange': okAction }));
					this.add(build.input('number', closest.previous.frame.value.y*100, { 'id': 'anigenAddValueY', 'title': 'Scale Y', 'onchange': okAction }));
					break;
				case 'skewX':
					this.add(build.icon('swap_horiz', 'md-24'));
					this.add(build.input('number', closest.previous.frame.value.angle, { 'id': 'anigenAddValue', 'title': 'Angle', 'onchange': okAction }));
					break;
				case 'skewY':
					this.add(build.icon('swap_vert', 'md-24'));
					this.add(build.input('number', closest.previous.frame.value.angle, { 'id': 'anigenAddValue', 'title': 'Angle', 'onchange': okAction }));
					break;
			}
		} else {
			var attrValues = svg.getAttributeValues(animation.getAttribute('attributeName'));
			var count = 0;
			var lastType = null;
			
			var opt = [];
			var eve = {};
			
			for(var i = 0; i < attrValues.length; i++) {
				if(attrValues[i][0] == '<') {
					count++;
					if(lastType != null && lastType != attrValues[i].substring(1, attrValues[i].length-1)) { return; }
					lastType = attrValues[i].substring(1, attrValues[i].length-1);
				} else {
					opt.push({'value': attrValues[i], 'selected': closest.previous.frame.value == attrValues[i] ? 'selected' : null});
				}
			}
			
			if(count == 0) {
				var sel = build.select(opt);
					sel.setAttribute('id', 'anigenAddValue');
				if(isEdit) {
					sel.setAttribute('onchange', okAction);
				}
				this.add(sel);
			} else {
				if(count == attrValues.length) {
					switch(lastType) {
						case "string":
						case "iri":
							this.add(build.icon('text_fields', 'md-24'));
							this.add(build.input('text', closest.previous.frame.value, { 'title': 'Type: '+lastType, 'id': 'anigenAddValue', 'onchange': okAction }));
							break;
						case "number":
						case "length":
						case "angle":
							this.add(build.icon('settings_ethernet', 'md-24'));
							this.add(build.input('number', closest.previous.frame.value, { 'title': 'Type: '+lastType, 'id': 'anigenAddValue', 'onchange': okAction }));
							break;
						case "fraction":
							this.add(build.icon('timelapse', 'md-24'));
							this.add(build.input('number', closest.previous.frame.value*100, { 'title': 'Type: '+lastType, 'id': 'anigenAddValue', 'min': 0, 'max': 100, 'step': 0.1, 'class': 'fraction', 'onchange': okAction }));
							break;
						case "color":
							this.add(build.icon('format_paint', 'md-24'));
							this.add(build.input('color', new color(closest.previous.frame.value), { 'title': 'Type: '+lastType, 'id': 'anigenAddValue', 'onchange': okAction }));
							break;
					}
				} else {
					return;
				}
			}
		}
	}
	
	if(animation.getCalcMode() == 'spline') {
		var temp = new spline();
		var splineSelect = temp.getSelect();
		var optCustom = document.createElement('option');
			optCustom.setAttribute('value', -1);
			optCustom.appendChild(document.createTextNode('custom'));
		splineSelect.appendChild(optCustom);
		
		var splineChangeAction = '';
			splineChangeAction += 'if(this.value == "-1") {';
				splineChangeAction += 'this.addClass("small");';
				splineChangeAction += 'this.nextElementSibling.removeClass("hidden");';
			splineChangeAction += '} else {';
				splineChangeAction += 'this.removeClass("small");';
				splineChangeAction += 'this.nextElementSibling.addClass("hidden");';
			splineChangeAction += '}';
		
		splineChangeAction += okAction;
		
		splineSelect.setAttribute('onchange', splineChangeAction);
		splineSelect.setAttribute('id', 'anigenAddSpline');
		
		if(!closestExclusive.previous.frame) {
			splineSelect.setAttribute('disabled', 'disabled');
		}
		
		var closestSpline;
		if(closest.closest.frame != null) {
			closestSpline = closest.closest.frame.spline || (animation.keyframes.getItem(1) ? animation.keyframes.getItem(1).spline : null) || new spline();
			closestSpline = closestSpline.type;
		} else {
			closestSpline = 0;
		}
		splineSelect.setSelected(closestSpline);
		
		this.add(build.icon('timer', 'md-24'));
		
		this.add(splineSelect);
	
		var ins1 = build.input('number', '0', { 'min': 0, 'max': 1, 'step': 0.05, 'pattern': '[0-9]*', 'onchange': okAction });
		var ins2 = build.input('number', '0', { 'min': 0, 'max': 1, 'step': 0.05, 'pattern': '[0-9]*', 'onchange': okAction });
		var ins3 = build.input('number', '1', { 'min': 0, 'max': 1, 'step': 0.05, 'pattern': '[0-9]*', 'onchange': okAction });
		var ins4 = build.input('number', '1', { 'min': 0, 'max': 1, 'step': 0.05, 'pattern': '[0-9]*', 'onchange': okAction });
	
		
		var contSplineInput = document.createElement('span');
			contSplineInput.setAttribute('class', 'splineInput hidden');
			contSplineInput.appendChild(ins1);
			contSplineInput.appendChild(ins2);
			contSplineInput.appendChild(ins3);
			contSplineInput.appendChild(ins4);
		this.add(contSplineInput);
	}
	
	this.addButtonOk(okAction);
	this.addButtonCancel(cancelAction);
	
	this.show(target);
	this.closeOnSeek = true;
}

popup.prototype.macroAddState = function(target) {
	var animation = svg.selected.shepherd || svg.selected;
	if(!animation || !(animation instanceof animationGroup)) { return; }
	
	this.reset();
	
	animation.getKeyframes();
	
	var closest = animation.getClosest(true);
	
	if(!animation.getAttribute('anigen:group') || !svg.animationStates) { return; }
	var states = svg.animationStates[animation.getAttribute('anigen:group')];
	if(!states) { return; }
	
	var inbetween;
	var ratio;
	
	if(!closest.running) {
		if(!closest.previous.frame && !closest.next.frame) { return; }
		if(!closest.previous.frame) {		// hasn't started
			ratio = 1;
			inbetween = new animationState(states[closest.previous.frame.value].element.cloneNode(true), states[closest.previous.frame.value].name+'-clone');
		} else {	// ended already
			ratio = 0;
			inbetween = new animationState(states[closest.next.frame.value].element.cloneNode(true), states[closest.next.frame.value].name+'-clone');
		}
	} else {
		ratio = (closest.progress-closest.previous.frame.time)/(closest.next.frame.time-closest.previous.frame.time);
		var inbetween = states[closest.previous.frame.value].inbetween(states[closest.next.frame.value], ratio);
	}
	
	var preview = new imageSVG(inbetween.element, { width: 250, height: 250 });
	
	this.add(preview.container);
	
	this.add(build.input('text', inbetween.name));
	
	this.addButtonOk('svg.evaluateGroupInbetween(null, "'+animation.getAttribute('anigen:group')+'", this.previousElementSibling.value, '+closest.previous.frame.value+', '+closest.next.frame.value+', '+ratio+');');
	this.addButtonCancel();
	
	this.show(target);
}

popup.prototype.macroChildren = function(target, object) {
	target = target || anigenManager.classes.context.buttons.children.container;
	object = object || svg.selected;
	
	this.reset();
	
	var tArray = [];
	var rAttributes = [];
	
	var children = object.getChildren();
	
	for(var i = 0; i < children.length; i++) {
		if(children[i].getAttribute('anigen:lock')) { continue; }
		
		var nodeName = document.createElement('span');
			nodeName.appendChild(document.createTextNode('<'+children[i].nodeName.toLowerCase()+'> '));
			nodeName.style.opacity = "0.5";
			nodeName.style.paddingRight = "0.5ex";
		
		var info = anigenActual.getNodeDescription(children[i]);
		if(info) { nodeName.setAttribute('title', info); }
			
		var nodeId = document.createElement('span');
			nodeId.appendChild(document.createTextNode(children[i].id));
		var nodeAlias = document.createElement('span');
			if(children[i].getAttribute('inkscape:label')) {
				nodeAlias.appendChild(document.createTextNode(children[i].getAttribute('inkscape:label')));
				nodeAlias.style.opacity = "0.5";
				nodeAlias.style.fontStyle = "italic";
				nodeAlias.style.paddingLeft = "0.5ex";
			}
			
		
		tArray.push([[ nodeName, nodeId, nodeAlias ]]);
		rAttributes.push({ 'onclick': 'popup.hide();svg.select("'+children[i].id+'");' });
	}
	
	this.add(build.table(tArray, null, rAttributes)).setAttribute('class', 'popup-menu');
	
	this.show(target);
}

popup.prototype.macroAnimateMenu = function(target) {
	target = target || anigenManager.classes.context.buttons.animate.container;
	
	this.reset();
	
	var tArray = [];
	var rAttributes = [];
	
	if(svg.selected == svg.svgElement) {
		tArray.push([ build.icon("videocam"), "Camera" ]);
	} else {
		tArray.push([ build.icon("trending_up"), "Translate" ]);
		tArray.push([ build.icon("swap_calls"), "Move through path" ]);
		tArray.push([ build.icon("refresh"), "Rotate" ]);
		tArray.push([ build.icon("zoom_out_map"), "Scale" ]);
		tArray.push([ build.icon("swap_horiz"), "Skew horizontally" ]);
		tArray.push([ build.icon("swap_vert"), "Skew vertically" ]);
		tArray.push([ build.icon("text_format"), "Animate attribute..." ]);
	}
	
	if(svg.selected == svg.svgElement) {
		if(svg.camera) {
			//rAttributes.push({ 'class': 'disabled' });
			rAttributes.push({ 'onclick': 'popup.hide();svg.select(svg.camera.element);' });
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
		rAttributes.push({ 'onclick': 'popup.hide();anigenManager.classes.menu.refresh();popup.macroAnimateTypes(anigenManager.classes.context.buttons.animate.container, svg.selected);' });
	}
	
	this.add(build.table(tArray, null, rAttributes)).setAttribute('class', 'popup-menu');
	
	this.show(target);
}

popup.prototype.macroSpline = function(target, index) {
	this.reset();
	
	var animation = anigenManager.classes.windowAnimation.animation;
	if(!animation) { return; }
	
	var spline = animation.getKeyframes().getItem(index).spline;
	if(!spline) { return; }
	
	var edAction = '';
		edAction += 'this.container.nextElementSibling.value = this.value.x1;';
		edAction += 'this.container.nextElementSibling.nextElementSibling.value = this.value.y1;';
		edAction += 'this.container.nextElementSibling.nextElementSibling.nextElementSibling.value = this.value.x2;';
		edAction += 'this.container.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.value = this.value.y2;';
		
		edAction += 'anigenManager.classes.windowAnimation.batchSet("spline", '+index+', this.value.toString());';
	
	this.add(new splineEditor(200, spline, { 
		'move': edAction
	})).style.margin = '0 auto';
	
	this.add(build.input('number', spline.x1, { 'min': 0, 'max': 1, 'step': 0.01,
		'onchange': 'var ed = this.previousElementSibling.shepherd;ed.value.x1 = this.value;ed.refresh();ed.evaluate();'
	}));
	this.add(build.input('number', spline.y1, { 'min': 0, 'max': 1, 'step': 0.01,
		'onchange': 'var ed = this.previousElementSibling.previousElementSibling.shepherd;ed.value.y1 = this.value;ed.refresh();ed.evaluate();'
	}));
	this.add(build.input('number', spline.x2, { 'min': 0, 'max': 1, 'step': 0.01,
		'onchange': 'var ed = this.previousElementSibling.previousElementSibling.previousElementSibling.shepherd;ed.value.x2 = this.value;ed.refresh();ed.evaluate();'
	}));
	this.add(build.input('number', spline.y2, { 'min': 0, 'max': 1, 'step': 0.01,
		'onchange': 'var ed = this.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.shepherd;ed.value.y2 = this.value;ed.refresh();ed.evaluate();'
	}));
	
	this.show(target);
}

popup.prototype.macroReplace = function(target) {
	this.reset();
	
	this.add(build.input('text', 'Find', {
		'onfocus': 'if(this.style.opacity == "0.5") { this.value = ""; this.style.opacity = "1"; }',
		'onblur': 'if(this.value == "") { this.value = "Find"; this.style.opacity = "0.5"; }',
		'title': 'Attribute value to find',
		'style': 'opacity:0.5;'
	}));
	this.add(build.input('text', 'Replace by', {
		'onfocus': 'if(this.style.opacity == "0.5") { this.value = ""; this.style.opacity = "1"; }',
		'onblur': 'if(this.value == "") { this.value = "Replace by"; this.style.opacity = "0.5"; }',
		'title': 'Value to replace with',
		'style': 'opacity:0.5;'
	}));
	this.add(build.select([
		{ 'text': 'In selection', 'value': 'selection' },
		{ 'text': 'Entire document', 'value': 'document' },
	]));
	
	var action = '';
		action += 'if(this.previousElementSibling.previousElementSibling.style.opacity != "0.5" && this.previousElementSibling.previousElementSibling.previousElementSibling.style.opacity != "0.5") { svg.replace(this.previousElementSibling.previousElementSibling.previousElementSibling.value, this.previousElementSibling.previousElementSibling.value, this.previousElementSibling.value == "selection"); }';
	
	this.addButtonOk(action);
	this.addButtonCancel();
	
	this.show(target);
}


popup.prototype.macroMenuFile = function(target) {
	this.reset();
	
	var tArray = [];
	var rAttributes = [];
	
	tArray.push([ build.icon("folder_open"), "Open...", "Ctrl+O" ]);
	tArray.push([ build.icon("save"), "Save", "Ctrl+S" ]);
	tArray.push([ build.icon("file_download"), "Save and download", "Ctrl+Shift+S" ]);
	tArray.push([ build.icon("archive"), "Export...", "Ctrl+Shift+E" ]);
	tArray.push([ build.icon("launch"), "Show preview", "Ctrl+Shift+P" ]);
	tArray.push([ "", "", "" ]);
	tArray.push([ build.icon("description"), "Document properties...", "" ]);
	tArray.push([ build.icon("settings"), "Settings...", "" ]);
	
	rAttributes.push({ 'onclick': 'popup.hide();overlay.macroOpen();' });
	rAttributes.push({ 'onclick': 'popup.hide();svg.save(true);' });
	rAttributes.push({ 'onclick': 'popup.hide();svg.save();' });
	rAttributes.push({ 'onclick': 'popup.hide();overlay.macroExport();' });
	rAttributes.push({ 'onclick': 'popup.hide();svg.previewWindow.paused=false;svg.previewWindow.seed();' });
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
	
	tArray.push([ build.icon("undo"), "Undo", "Ctrl+Z" ]);
	tArray.push([ build.icon("redo"), "Redo", "Ctrl+Y" ]);
	tArray.push([ "", "", "" ]);
	tArray.push([ build.icon("search"), "Find and replace", "Ctrl+F" ]);
	tArray.push([ "", "", "" ]);
	tArray.push([ build.icon("content_cut"), "Cut", "Ctrl+X" ]);
	tArray.push([ build.icon("content_paste"), "Paste", "Ctrl+V" ]);
	tArray.push([ build.icon("content_copy"), "Copy", "Ctrl+C" ]);
	tArray.push([ "", "", "" ]);
	tArray.push([ build.icon("storage"), "Duplicate", "Ctrl+D" ]);
	if(svg.selected != svg.svgElement) {
		tArray.push([ build.icon("link"), "Create link", "Ctrl+L/Alt+D" ]);
	}
	tArray.push([ build.icon("delete"), "Delete", "Delete" ]);
	
	if(svg.history.index >= 0) {
		rAttributes.push({ 'onclick': 'popup.hide();svg.history.undo();' });
	} else { rAttributes.push({ 'class': 'disabled' }); }
	if(svg.history.index < svg.history.histArray.length-1) {
		rAttributes.push({ 'onclick': 'popup.hide();svg.history.redo();' });
	} else { rAttributes.push({ 'class': 'disabled' }); }
	
	rAttributes.push({ 'class': 'hr' });
	rAttributes.push({ 'onclick': 'popup.hide();popup.macroReplace();' });
	
	rAttributes.push({ 'class': 'hr' });
	if(svg.selected == svg.svgElement) {
		rAttributes.push({ 'class': 'disabled' });
	} else {
		rAttributes.push({ 'onclick': 'popup.hide();svg.cut(svg.selected);' });
	}
	
	if(!svg.elementTemp) {
		rAttributes.push({ 'class': 'disabled' });
	} else {
		if(svg.selected.getAttribute('inkscape:groupmode') == 'layer' || svg.selected == svg.svgElement) {
			rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.paste(null, svg.selected);'});
		} else {
			rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.paste(null, svg.selected.parentNode, svg.selected);'});
		}
	}
	
	if(svg.selected == svg.svgElement) {
		rAttributes.push({ 'class': 'disabled' });
	} else {
		rAttributes.push({ 'onclick': 'popup.hide();svg.copy(svg.selected);' });
	}
	rAttributes.push({ 'class': 'hr' });
	if(svg.selected == svg.svgElement) {
		rAttributes.push({ 'class': 'disabled' });
		rAttributes.push({ 'class': 'disabled' });
	} else {
		rAttributes.push({ 'onclick': 'popup.hide();svg.duplicate(svg.selected);' });
		rAttributes.push({ 'onclick': 'popup.hide();svg.createLink(svg.selected);' });
	}
	
	rAttributes.push({ 'onclick': 'popup.hide();svg.delete(svg.selected);' });
	
	this.add(build.table(tArray, null, rAttributes)).setAttribute('class', 'popup-menu');
	
	this.show(target);
}

popup.prototype.macroMenuObject = function(target) {
	this.reset();
	
	var tArray = [];
	var rAttributes = [];
	
	tArray.push([ build.icon("crop_din"), "Group", "Ctrl+G" ]);
	tArray.push([ build.icon("crop_free"), "Ungroup", "Ctrl+U" ]);
	tArray.push([ "", "", "" ]);
	tArray.push([ build.icon("fingerprint"), "Object to animation state...", "" ]);
	tArray.push([ build.icon("power_settings_new", "turn-90"), "Create animated group...", "" ]);
	tArray.push([ build.icon("settings_applications"), "Manage animation states...", "" ]);
	
	rAttributes.push({ 'onclick': 'popup.hide();svg.group();' });
	if(svg.selected instanceof SVGGElement) {
		rAttributes.push({ 'onclick': 'popup.hide();svg.ungroup();' });
	} else {
		rAttributes.push({ 'class': 'disabled' });
	}
	rAttributes.push({ 'class': 'hr' });
	rAttributes.push({ 'onclick': 'popup.hide();anigenManager.classes.menu.refresh();popup.macroToAnimationState(document.getElementById("anigenMenu"), svg.selected);' });
	rAttributes.push({ 'onclick': 'popup.hide();anigenManager.classes.menu.refresh();popup.macroNewAnimationGroup(document.getElementById("anigenMenu"));' });
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
		tArray.push([ build.icon("videocam"), "Camera", "" ]);
	} else {
		tArray.push([ build.icon("trending_up"), "Translate", "" ]);
		tArray.push([ build.icon("swap_calls"), "Move through path", "" ]);
		tArray.push([ build.icon("refresh"), "Rotate", "" ]);
		tArray.push([ build.icon("zoom_out_map"), "Scale", "" ]);
		tArray.push([ build.icon("swap_horiz"), "Skew horizontally", "" ]);
		tArray.push([ build.icon("swap_vert"), "Skew vertically", "" ]);
		tArray.push([ build.icon("text_format"), "Animate attribute...", "" ]);
	}
	
	tArray.push([ "", "", "" ]);
	
	if(svg.svgElement.animationsPaused()) {
		tArray.push([ build.icon("fast_rewind"), "Seek back (100ms)", "-" ]);
		tArray.push([ build.icon("fast_forward"), "Seek forward (100ms)", "+" ]);
	} else {
		tArray.push([ build.icon("fast_rewind"), "Seek back (1s)", "-" ]);
		tArray.push([ build.icon("fast_forward"), "Seek forward (1s)", "+" ]);
	}
	
	tArray.push([ "", "", "" ]);
	
	tArray.push([ build.icon("loop"), "Set animation loop...", "" ]);
	tArray.push([ build.icon("restore"), "Restart animations", "" ]);
	
	if(svg.svgElement.animationsPaused()) {
		tArray.push([ build.icon("play_arrow"), "Unpause animations", "" ]);
	} else {
		tArray.push([ build.icon("pause"), "Pause animations", "" ]);
	}
	
	
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
		rAttributes.push({ 'onclick': 'popup.hide();anigenManager.classes.menu.refresh();popup.macroAnimateTypes(document.getElementById("anigenMenu"), svg.selected);' });
	}
	
	rAttributes.push({ 'class': 'hr' });
	
	if(svg.svgElement.animationsPaused()) {
		rAttributes.push({ 'onclick': 'svg.seek(-0.1);' });
		rAttributes.push({ 'onclick': 'svg.seek(0.1);' });
	} else {
		rAttributes.push({ 'onclick': 'svg.seek(-1);' });
		rAttributes.push({ 'onclick': 'svg.seek(1);' });
	}
	
	rAttributes.push({ 'class': 'hr' });
	rAttributes.push({ 'onclick': 'popup.hide();anigenManager.classes.menu.refresh();popup.macroLoop();' });
	rAttributes.push({ 'onclick': 'popup.hide();anigenManager.classes.menu.refresh();svg.gotoTime(anigenManager.classes.editor.clock.minTime || 0);' });
	rAttributes.push({ 'onclick': 'popup.hide();anigenManager.classes.menu.refresh();svg.pauseToggle();' });
	
	this.add(build.table(tArray, null, rAttributes)).setAttribute('class', 'popup-menu');
	
	this.show(target);
}

popup.prototype.macroMenuHelp = function(target) {
	this.reset();
	
	var tArray = [];
	var rAttributes = [];
	
	tArray.push([ build.icon("import_contacts"), "Manual..." ]);
	tArray.push([ build.icon("call_split", 'turn-90'), "Versions..." ]);
	tArray.push([ "", "" ]);
	tArray.push([ build.icon("info_outline"), "About..." ]);
	
	rAttributes.push({ 'onclick': 'popup.hide();window.open("manual.html", "_blank");' });
	rAttributes.push({ 'onclick': 'popup.hide();window.open("../../versions.html", "_blank");' });
	rAttributes.push({ 'class': 'hr' });
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
	
	this.show(anigenManager.classes.windowLayers.footer.children[0]);
}

popup.prototype.macroAnimateTypes = function(target, element) {
	this.reset();
	
	if(!element) { element = svg.selected; }
	
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
	
	
	var stateNameText;
	var groupNameText;
	
	var labelOne, labelTwo;
	labelOne = element.parentNode && !(element.parentNode instanceof SVGSVGElement) ? element.parentNode : null;
	while(labelOne && labelOne.parentNode && !(labelOne.parentNode instanceof SVGSVGElement)) {
		if(labelOne.getAttribute('inkscape:label')) { break; }
		labelOne = labelOne.parentNode;
	}
	
	labelTwo = labelOne && labelOne.parentNode && !(labelOne.parentNode instanceof SVGSVGElement) ? labelOne.parentNode : null;
	while(labelTwo && labelTwo.parentNode && !(labelTwo.parentNode instanceof SVGSVGElement)) {
		if(labelTwo.getAttribute('inkscape:label')) { break; }
		labelTwo = labelTwo.parentNode;
	}
	
	labelOne = labelOne && labelOne.getAttribute('inkscape:label') ? labelOne : null;
	labelTwo = labelTwo && labelTwo.getAttribute('inkscape:label') ? labelTwo : null;
	
	if(element.getAttribute('inkscape:label')) {
		stateNameText = element.getAttribute('inkscape:label');
		groupNameText = labelOne ? labelOne.getAttribute('inkscape:label') : "New group";
	} else {
		if(element.parentNode.children.length == 1) {
			stateNameText = labelOne ? labelOne.getAttribute('inkscape:label') : element.id;
			groupNameText = labelTwo ? labelTwo.getAttribute('inkscape:label') : "New group";
		} else {
			stateNameText = element.id;
			groupNameText = labelOne ? labelOne.getAttribute('inkscape:label') : "New group";
		}
	}
	
	var isSelected = false;
	
	for(var i in svg.animationStates) {
		if(!svg.animationStates[i] || !svg.animationStates[i][0] || svg.animationStates[i][0].children.length == childCount) {
			options.push({ 'text': i, 'value': i });
			if(i == groupNameText) {
				options[options.length-1].selected = 'selected';
				isSelected = true;
			}
		}
	}
	
	var isBatchable = true;
	var baseCount = null;
	// if(!element.getAttribute('inkscape:label')) { isBatchable = false; }
	for(var i = 0; i < element.children.length; i++) {
		if(baseCount == null) {
			baseCount = element.children[i].getElementsByTagName('', true, true).length;
		} else {
			if(element.children[i].getElementsByTagName('', true, true).length != baseCount) {
				isBatchable = false;
				break;
			}
		}
	}
	
	if(isBatchable) {
		var batchAction = "";
			batchAction += "if(this.value=='batch'){";
			batchAction += "this.nextElementSibling.addClass('hidden');";
			batchAction += "this.nextElementSibling.nextElementSibling.addClass('hidden');";
			batchAction += "var inp=this.parentNode.children[this.parentNode.children.length-3];";
			batchAction += "if(inp.value=='"+groupNameText+"'){inp.value='"+stateNameText+"';}";
			batchAction += "}else{";
			batchAction += "this.nextElementSibling.removeClass('hidden');";
			batchAction += "this.nextElementSibling.nextElementSibling.removeClass('hidden');";
			batchAction += "var inp=this.parentNode.children[this.parentNode.children.length-3];";
			batchAction += "if(inp.value=='"+stateNameText+"'){inp.value='"+groupNameText+"';}";
			batchAction += "}";
		
		this.add(build.select([
			{ 'text': 'Single', 'value': 'single', 'title': 'Make this element an animation state.' },
			{ 'text': 'Batch', 'value': 'batch', 'title': 'Make every child element an animation state. (EXPERIMENTAL)' }
		],
			{	'id': 'anigenBatchSelect',
				'onchange': batchAction }
		));
	}
	
	this.add(build.icon('fingerprint'));
	
	this.add(build.input('text', stateNameText, { 'title': 'State name', 'id': 'anigenStateName', 'onfocus': 'if(this.value == "'+stateNameText+'") { this.value = null; }' } ));
	
	this.add(build.icon('folder_open'));
	
	var stateSelect = build.select(options, { 'title': 'Group', 'id': 'anigenGroupSelect', 'onchange': 'this.nextSibling.style.display = this.value == "" ? null : "none";' } );
	var groupName = build.input('text', groupNameText, { 'title': 'New group name', 'id': 'anigenGroupName', 'onfocus': 'if(this.value == "'+groupNameText+'") { this.value = null; }' } );
	if(isSelected) { groupName.style.display = 'none'; }
	
	if(options.length > 1 && !isSelected) {
		stateSelect.setSelected(options.length-1);
		groupName.style.display = 'none';
	}
	
	this.add(stateSelect);
	this.add(groupName);
	
	var okAction = '';
		okAction += 'var name=document.getElementById("anigenStateName").value;';
		okAction += 'var group=document.getElementById("anigenGroupSelect");';
		okAction += 'if(group.value == "") {';
			okAction += 'group=document.getElementById("anigenGroupName").value;';
			okAction += '}else{';
			okAction += 'group=group.value;}';
		okAction += 'var batch=document.getElementById("anigenBatchSelect");';
		okAction += 'if(batch&&batch.value=="batch"){batch=true;}else{batch=false;}';
		okAction += 'svg.newAnimState("'+element.id+'",name,group,batch);';
	
	this.addButtonOk(okAction);
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

