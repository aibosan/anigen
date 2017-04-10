/**
 *  @author		Ondrej Benda
 *  @date		2011-2017
 *  @copyright	GNU GPLv3
 *	@version	0.8.1
 *	@brief		Main event handling class, also links to the instance of svg class
 */
function anigenActual() {
    this.iconType = 32;
    this.iconHeight = 24;
	this.versionNumeric = "0.8.1";
    this.version = this.versionNumeric + " " + "Quality of Life";
	
    this.tool = 1;
	
	this.notify = false;
	
	this.threshold = {
		'position': 2,
		'time': 250,
		'dbl': 500,
		'redraw': 50
	}
	
	this.tools = [
		new toolAnchor(),
		new toolGroup(),
		new toolElement(),
		new toolZoom(),
		new toolPicker(),
		new toolRectangle(),
		new toolEllipse()
	];
	
	this.settings = new settings();
	this.downEvent = null;
	this.lastEvent = null;
	
	this.lastClick = null;
	
	this.nextRedraw = null;
	
	this.focused = null;
	this.exporting = false;
	
	this.hasClock = false;
	
	window.addEventListener("keydown", this.eventKeyDown.bind(this), false);
	window.addEventListener("keyup", this.eventKeyUp.bind(this), false);
	window.addEventListener("mouseup", this.eventMouseUp, false);
	
	window.addEventListener("resize", this.eventResize, false);
	window.addEventListener("wheel", this.eventWheelPreventDefault, false);
	
	
	window.addEventListener("contextmenu", this.eventContextMenu, false);
	window.addEventListener("change", this.eventChange, false);
	window.addEventListener("beforeunload", this.eventNavigation, false);
	window.addEventListener("dragover", this.eventPreventDefault, false);
	window.addEventListener("drop", this.eventFileDrop, false);
	
	window.anigenActual = this;
	
	log.report('Welcome to <strong>aniGen '+this.version.split(' ')[0]+'</strong>!');
}

anigenActual.prototype.confirm = function() {
	setData("anigenDisclaimer", true);
}

anigenActual.prototype.isPaused = function() { return this.paused; }

// hides right pannel if all windows are hidden
anigenActual.prototype.checkWindows = function() {
	var content = anigenManager.named.right.content.children;
	var hide = true;
	for(var i = 0; i < content.length; i++) {
		if(!content[i].hasClass('hidden')) { hide = false; break; }
	}
	if(hide) {
		anigenManager.named.right.hide();
	} else {
		anigenManager.named.right.show();
	}
	anigenManager.refresh();
}

anigenActual.prototype.resetTitle = function() {
	var devel = 
		(window.location.href.match('GitHub') || window.location.href.match('devel')) ? " DEV" : "";
	
	if(!svg || !svg.fileName) {
		document.title = "aniGen " + this.versionNumeric + devel;
	} else {
		document.title = svg.fileName + " - aniGen " + this.versionNumeric + devel;
	}
}

anigenActual.prototype.eventNavigation = function(event) {
	if(!svg || !svg.svgElement) { return true; }
	event.returnValue = "Navigating from this page will cause the loss of any unsaved data.";
	return "Navigating from this page will cause the loss of any unsaved data.";
}

// keyboard event handler
anigenActual.prototype.eventKeyDown = function(event) {
	if(event.key == 'F12') { return true; }		// F12
	
	if(event.key == 'F5' && (event.ctrlKey || event.altKey || event.shiftKey)) {		// F5
		location.reload();
		event.preventDefault ? event.preventDefault() : event.returnValue = false;
		event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
		return;
	}
	
	// prevents keystrokes on exporting
	if(!svg.svgElement || this.exporting) {
		event.preventDefault ? event.preventDefault() : event.returnValue = false;
		event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
		return false;
	}
	
	var skipKeys = [ 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'Pause' ];
	
	// disregards keystrokes when input is selected
	if(document.activeElement instanceof HTMLInputElement ||
		document.activeElement instanceof HTMLTextAreaElement ||
		event.target.isChildOf(log.container)) {
		
		if(((event.key == 's' || event.key == 'S') && event.ctrlKey) || skipKeys.indexOf(event.key) == -1) {
			return;
		}
	}
	
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
	event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
	
	// hides/shows selction box pivot
	if(event.shiftKey && svg.ui.selectionBox.origin) {
		if(svg.ui.selectionBox.showRotation) {
			svg.ui.selectionBox.origin.hide();
		} else {
			svg.ui.selectionBox.origin.show();
		}
	}
	
	// current tool's key handler is fired first
	if(!this.tools[this.tool].keyDown(event)) {
		return false;
	}
	
	// if window is focused (hovered over) and its KeyDown event handler exists, passes event on
	if(this.focused && this.focused.shepherd && typeof this.focused.shepherd.eventKeyDown === 'function') {
		if(this.focused.shepherd.eventKeyDown(event)) {
			return false;
		}
	}
		
	switch(event.key) {
		case 'Enter':		// enter (return) key
			if(svg.svgElement != null) {
				if(!popup.isHidden() && popup.buttonOk) {
					if(popup.noRemoteClick) {
						popup.hide();
					} else {
						popup.buttonOk.click();
					}
				}
			}
			break;
		case 'Pause':		// pause break
			if(event.altKey) {	// alt-pause resets animations to T=0
				svg.gotoTime(anigenManager.classes.editor.clock.minTime || 0);
			} else {
				svg.pauseToggle();
			}
			
			break;
		case ' ':		// spacebar
			if(event.target != document.body) { return; }
			svg.pauseToggle();
			break;
		case 'Escape':		// escape
			if(svg.svgElement != null) {
				if(popup.buttonCancel) {
					popup.buttonCancel.click();
				} else {
					popup.hide();
				}
				overlay.hide();
			}
			break;
		case 'PageUp':		// page up
			if((svg.selected == anigenManager.classes.windowAnimation.animation || svg.selected.shepherd && svg.selected.shepherd == anigenManager.classes.windowAnimation.animation) &&
				anigenManager.classes.windowAnimation.selected.length > 0) {
				anigenManager.classes.windowAnimation.contextMenuEvaluate('up', anigenManager.classes.windowAnimation.selected[0]);
			} else {
				svg.selected.moveUp(true);
				window.dispatchEvent(new Event("treeSeed"));
				svg.select();
			}
			break;
		case 'PageDown':		// page down
			if((svg.selected == anigenManager.classes.windowAnimation.animation || svg.selected.shepherd && svg.selected.shepherd == anigenManager.classes.windowAnimation.animation) &&
				anigenManager.classes.windowAnimation.selected.length > 0) {
				anigenManager.classes.windowAnimation.contextMenuEvaluate('down', anigenManager.classes.windowAnimation.selected[0]);
			} else {
				svg.selected.moveDown(true);
				window.dispatchEvent(new Event("treeSeed"));
				svg.select();
			}
			break;
		case 'End':		// end
			svg.selected.moveBottom(true);
			window.dispatchEvent(new Event("treeSeed"));
			svg.select();
			break;
		case 'Home':		// home
			svg.selected.moveTop(true);
			window.dispatchEvent(new Event("treeSeed"));
			svg.select();
			break;
		case '1':
			if(event.altKey) { 
				svg.gotoTime(anigenManager.classes.editor.clock.minTime || 0);
				anigenManager.classes.windowAnimation.select(null, true);
			}
			var target = svg.selected.shepherd || svg.selected;
			if(typeof target.getClosest === 'function') {
				var closest = target.getClosest();
				if(closest.previous.time == null) { break; }
				svg.gotoTime(closest.previous.time);
				anigenManager.classes.windowAnimation.select(closest.previous.index, true);
			}
			break;
		case '2':
			var target = svg.selected.shepherd || svg.selected;
			if(typeof target.getClosest === 'function') {
				var closest = target.getClosest(true);
				if(closest.closest.time == null) { break; }
				svg.gotoTime(closest.closest.time);
				anigenManager.classes.windowAnimation.select(closest.closest.index, true);
			}
			break;
		case '3':
			var target = svg.selected.shepherd || svg.selected;
			if(typeof target.getClosest === 'function') {
				var closest = target.getClosest();
				if(closest.next.time == null) { break; }
				svg.gotoTime(closest.next.time);
				anigenManager.classes.windowAnimation.select(closest.next.index, true);
			}
			break;
		case 'ArrowLeft':		// left arrow key
			if(event.ctrlKey && !event.altKey) {
				var target = svg.selected.shepherd || svg.selected;
				if(typeof target.getClosest === 'function') {
					var closest = target.getClosest();
					if(closest.previous.time == null) { break; }
					svg.gotoTime(closest.previous.time);
					anigenManager.classes.windowAnimation.select(closest.previous.index, true);
				}
			}
			if(event.altKey && !event.ctrlKey) {
				svg.select(svg.selected.getViablePreviousSibling());
			}
			if(!event.altKey && !event.ctrlKey) {
				if(svg.selected && !(svg.selected instanceof SVGSVGElement)) {
					svg.selected.translateBy(-1, 0, true);
					svg.select();
				}
			}
			break;
		case 'ArrowUp':		// up arrow key
			if(event.altKey) {
				svg.select(svg.selected.getViableParent());
			}
			if(!event.altKey && !event.ctrlKey) {
				if(svg.selected && !(svg.selected instanceof SVGSVGElement)) {
					svg.selected.translateBy(0, -1, true);
					svg.select();
				}
			}
			break;
		case 'ArrowRight':		// right arrow key
			if(event.ctrlKey && !event.altKey) {
				var target = svg.selected.shepherd || svg.selected;
				if(typeof target.getClosest === 'function') {
					var closest = target.getClosest();
					if(closest.next.time == null) { break; }
					svg.gotoTime(closest.next.time);
					anigenManager.classes.windowAnimation.select(closest.next.index, true);
				}
			}
			if(event.altKey && !event.ctrlKey) {
				svg.select(svg.selected.getViableNextSibling());
			}
			if(!event.altKey && !event.ctrlKey) {
				if(svg.selected && !(svg.selected instanceof SVGSVGElement)) {
					svg.selected.translateBy(1, 0, true);
					svg.select();
				}
			}
			break;
		case 'ArrowDown':		// down arrow key
			if(event.ctrlKey && !event.altKey) {
				var target = svg.selected.shepherd || svg.selected;
				if(typeof target.getClosest === 'function') {
					var closest = target.getClosest(true);
					if(closest.closest.time == null) { break; }
					svg.gotoTime(closest.closest.time);
					anigenManager.classes.windowAnimation.select(closest.closest.index, true);
				}
			} else if(event.altKey && svg.selected.getViableChildren().length > 0) {
				svg.select(svg.selected.getViableChildren()[0]);
			} else if(!event.altKey && !event.ctrlKey) {
				if(svg.selected && !(svg.selected instanceof SVGSVGElement)) {
					svg.selected.translateBy(0, 1, true);
					svg.select();
				}
			}
			break;
		case 'Delete':		// delete
			if(!anigenManager.classes.windowAnimation.isHidden() && (svg.selected == anigenManager.classes.windowAnimation.animation || svg.selected.shepherd && svg.selected.shepherd == anigenManager.classes.windowAnimation.animation) &&
				anigenManager.classes.windowAnimation.selected.length > 0) {
				anigenManager.classes.windowAnimation.contextMenuEvaluate('delete', anigenManager.classes.windowAnimation.selected[0]);
			} else {
				svg.delete(svg.selected);
			}
			break;
		case 'a':		// a
		case 'A':
			if(event.shiftKey && svg.selected.getViablePreviousSibling()) {
				svg.select(svg.selected.getViablePreviousSibling());
			} else if(svg.ui.allSelected) {
				svg.ui.clearSelect();
			} else {
				svg.ui.selectAll();
			}
			break;
		case 'b':    	// b
		case 'B':
			break;
		case 'c':		// c
		case 'C':
			if(event.ctrlKey) {
				svg.copy(svg.selected);
			}
			break;
		case 'd':		// d
		case 'D':
			if(event.altKey) {
				svg.createLink(svg.selected);
			} else if(!event.ctrlKey && event.shiftKey && svg.selected.getViableNextSibling()) {
				svg.select(svg.selected.getViableNextSibling());
			} else if(event.ctrlKey && !event.altKey) {
				if((svg.selected == anigenManager.classes.windowAnimation.animation || svg.selected.shepherd && svg.selected.shepherd == anigenManager.classes.windowAnimation.animation) &&
					anigenManager.classes.windowAnimation.selected.length > 0) {
					anigenManager.classes.windowAnimation.contextMenuEvaluate('duplicate', anigenManager.classes.windowAnimation.selected[0]);
				} else {
					svg.duplicate(svg.selected);
				}
			}
			break;
		case 'e':		// e
		case 'E':
			if(event.ctrlKey && event.shiftKey) {
				overlay.macroExport();
			} else {
				var ratio = svg.svgElement.animationsPaused() ? 1 : 10;
				if(event.shiftKey) {
					svg.seek(1*ratio);
				} else if(event.altKey) {
					svg.seek(0.01*ratio);
				} else {
					svg.seek(0.1*ratio);
				}
			}
			break;
		case 'f':		// f
		case 'F':
			if(event.ctrlKey) {
				popup.macroReplace();
			}
			break;
		case 'g':		// g
		case 'G':
			if(event.ctrlKey) {
				svg.group();
			}
			break;
		case 'k':		// k
		case 'K':
			if(event.ctrlKey && event.shiftKey) {
				anigenManager.classes.context.buttons.animate.click();
			}
			break;
		case 'l':		// l
		case 'L':
			if(event.ctrlKey && !event.shiftKey) {
				svg.createLink(svg.selected);
			}
			if(event.ctrlKey && event.shiftKey) {
				anigenManager.classes.context.buttons.layers.click();
			}
			break;
		case 'n':		// n
		case 'N':
			return;
			break;
		case 'o':		// o
		case 'O':
			if(event.ctrlKey) { overlay.macroOpen(); }
			break;
		case 'p':		// p
		case 'P':
			if(event.ctrlKey && event.shiftKey) {
				svg.previewWindow.paused=false;
				svg.previewWindow.seed();
			}
			if(event.ctrlKey && !event.shiftKey) { svg.pauseToggle(); }
			break;
		case 'q':
		case 'Q':
			var ratio = svg.svgElement.animationsPaused() ? 1 : 10;
			if(event.shiftKey) {
				svg.seek(-1*ratio);
			} else if(event.altKey) {
				svg.seek(-0.01*ratio);
			} else {
				svg.seek(-0.1*ratio);
			}
			break;
		case 'r':		// r
		case 'R':
			if(event.ctrlKey && !event.shiftKey) {
				if(svg.selected instanceof SVGAnimationElement || (svg.selected.shepherd && svg.selected.shepherd instanceof animationGroup)) {
					popup.macroSetCurrentValue();
				}
			}
			break;
		case 's':		// s
		case 'S':
			if(!event.ctrlKey && event.shiftKey && svg.selected.getViableChildren().length > 0) {
				svg.select(svg.selected.getViableChildren()[0]);
			} else if(event.ctrlKey) {
				if(typeof(Storage) === "undefined" || event.shiftKey) {
					svg.save();
				} else {
					svg.save(true);
				}
			}
			break;
		case 't':    	// t
		case 'T':
			break;
		case 'u':		// u
		case 'U':
			if(event.ctrlKey) {
				svg.ungroup();
			}
			break;
		case 'v':		// v
		case 'V':
			if((event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) && !event.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			if(event.ctrlKey) {
				if(!this.lastEvent) {
					this.lastEvent = { clientX: window.innerWidth/2, clientY: window.innerHeight/2 }
				}
				var evaluated = svg.evaluateEventPosition(this.lastEvent);
				svg.paste((event.altKey ? null : evaluated), svg.selected);
			}
			break;
		case 'w':
		case 'W':
			if(event.altKey) {
				var targ = svg.selected;
				while(targ) {
					if(targ.isAnimation() || (targ.getAttribute('anigen:type') == 'animationGroup')) { break; }
					targ = targ.getViableParent();
				}
				if(targ) {
					svg.select(targ);
				}
			} else if(event.shiftKey && svg.selected.getViableParent()) {
				svg.select(svg.selected.getViableParent());
			} else {
				var targ = svg.selected.shepherd || svg.selected;
				if(targ instanceof SVGAnimationElement) {
					popup.macroSetCurrentValue();
				} else {
					if(targ instanceof SVGPathElement) {
						svg.pauseToggle(false);
						var animations = targ.getAnimations(true, 'd') || [];
						
						var candidate = null;
						for(var i = 0; i < animations.length; i++) {
							if(animations[i].getProgress().running) {
								candidate = animations[i];
								break;
							}
						}
						if(candidate) {
							var closest = candidate.getClosest();
							if(closest.perfect) {	// edit
								svg.select(candidate);
								anigenManager.classes.windowAnimation.select(closest.closest.index);
							} else {	// create new keyframe
								candidate.inbetween(closest.previous.frame, closest.next.frame, (closest.progress-closest.previous.frame.time)/(closest.next.frame.time-closest.previous.frame.time));
								svg.select(candidate);
								anigenManager.classes.windowAnimation.select(closest.next.index);
							}
						} else {	// create new animation
							candidate = svg.createAnimation(targ, 0,
								{ 'begin': svg.svgElement.getCurrentTime(), 'dur': 1 },
								{ 'freeze': false },
								{ 'attribute': 'd' }
								);
							svg.select(candidate);
							anigenManager.classes.windowAnimation.select(0);
						}
					}
				}
			}
			break;
		case 'x':		// x
		case 'X':
			if((event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) && !event.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			if(event.ctrlKey && !event.shiftKey && svg.selected != svg.svgElement) {
				svg.cut(svg.selected);
			}
			if(event.ctrlKey && event.shiftKey) {
				anigenManager.classes.context.buttons.tree.click();
			}
			break;
		case 'y':		// y (history forward)
		case 'Y':
			if(event.ctrlKey) {
				svg.history.redo();
			}
			break;
		case 'z':		// z (history back, history forward)
		case 'Z':
			if(event.ctrlKey) {
				if(event.shiftKey) {
					svg.history.redo();
				} else {
					svg.history.undo();
				}
			}
			break; 
		case '-':		// minus
			if(event.ctrlKey) {
				var evaluated = svg.evaluateEventPosition();
				svg.zoomAround(evaluated.x, evaluated.y, false);
			} else {
				var ratio = svg.svgElement.animationsPaused() ? 1 : 10;
				if(event.shiftKey) {
					svg.seek(-1*ratio);
				} else if(event.altKey) {
					svg.seek(-0.01*ratio);
				} else {
					svg.seek(-0.1*ratio);
				}
			}
			break;
		case '+':		// plus
			if(event.ctrlKey) {
				var evaluated = svg.evaluateEventPosition();
				svg.zoomAround(evaluated.x, evaluated.y, true);
			} else {
				var ratio = svg.svgElement.animationsPaused() ? 1 : 10;
				if(event.shiftKey) {
					svg.seek(1*ratio);
				} else if(event.altKey) {
					svg.seek(0.01*ratio);
				} else {
					svg.seek(0.1*ratio);
				}
			}
			break;
		case 'F1':		// F1
			this.setTool(1);
			break;
		case 'F2':		// F2
			this.setTool(2);
			break;
		case 'F3':		// F3
			this.setTool(3);
			break;
		case 'F4':		//	F4
			this.setTool(5);
			break;
		case 'F5':		//	F5
			this.setTool(6);
			break;
		case 'F6':		//	F6
			break;
		case 'F7':		//	F7
			this.setTool(4);
			break;
		default:
			break;
	}
	
	return false;
}

anigenActual.prototype.eventKeyUp = function(event) {
	if(svg.ui.selectionBox.origin) {
		if(svg.ui.selectionBox.showRotation) {
			svg.ui.selectionBox.origin.show();
		} else {
			svg.ui.selectionBox.origin.hide();
		}
	}
	// current tool's key handler is fired first
	if(!this.tools[this.tool].keyUp(event)) {
		event.preventDefault ? event.preventDefault() : event.returnValue = false;
		return false;
	}
}


anigenActual.prototype.setTool = function(index, noSet) {
	switch(index) {
		case 1:
			this.tool = 1;	// group selection
			svg.ui.selectionBox.showArrows();
			if(!noSet) { anigenManager.classes.context.buttons.groupTool.setState(1); }
			anigenManager.setCursor('url(_cursors/group.png)');
			break;
		case 2:
			this.tool = 2;	// element selection
			svg.ui.selectionBox.hideArrows();
			if(!noSet) { anigenManager.classes.context.buttons.elementTool.setState(1); }
			anigenManager.setCursor('url(_cursors/element.png)');
			break;
		case 3:
			this.tool = 3;	// zoom
			if(!noSet) { anigenManager.classes.context.buttons.zoomTool.setState(1); }
			anigenManager.setCursor('url(_cursors/zoom_in.png) 7 7');
			break;
		case 4:
			this.tool = 4;	// picker
			if(!noSet) { anigenManager.classes.context.buttons.pickerTool.setState(1); }
			anigenManager.setCursor('url(_cursors/picker.png) 5 5');
			break;
		case 5:
			this.tool = 5;	// rectangle
			if(!noSet) { anigenManager.classes.context.buttons.rectTool.setState(1); }
			anigenManager.setCursor('url(_cursors/rectangle.png) 5 5');
			break;
		case 6:
			this.tool = 6;	// ellipse
			if(!noSet) { anigenManager.classes.context.buttons.ellipseTool.setState(1); }
			anigenManager.setCursor('url(_cursors/ellipse.png) 5 5');
			break;
	}
	svg.select();
}

// resizing event triggering adjustment of svg element
anigenActual.prototype.eventResize = function(event) {
	if(svg.svgElement == null) { return; }
	setTimeout(function() {
		svg.refreshUI(true);
	}, 100);	// because resize events take time
}

anigenActual.prototype.eventResizeDone = function(event) {
	if(svg.svgElement == null) { return; }
	if(event.diff_x == 0 && event.diff_y == 0) { return; }
	switch(event.panel) {
		case 'left':
			anigenActual.settings.set('treeWidth', anigenManager.named.left.width);
			break;
		case 'right':
			anigenActual.settings.set('windowsWidth', anigenManager.named.right.width);
			break;
			/*
		case 'bottom':
			
			break;
			*/
	}
}

anigenActual.prototype.eventMouseDown = function(event) {
	if(event.target.getAttribute('anigen:lock') == 'anchor') {
		anigenActual.tools[0].target = event.target.parentNode.shepherd;
		anigenActual.tools[0].mouseDown(event);
		anigenActual.downEvent = event;
		return;
	}
	if(!anigenActual.tools[anigenActual.tool]) { return; }
	anigenActual.lastEvent = event;
	anigenActual.downEvent = event;
	anigenActual.tools[anigenActual.tool].mouseDown(event);
}
anigenActual.prototype.eventMouseUp = function(event) {
	if(!event.target.isChildOf(svg.svgElement) && event.target != svg.svgElement) {
		anigenActual.tools[0].target = null;
		anigenActual.tools[0].lastEvent = null;
		anigenActual.tools[0].downEvent = null;
		anigenActual.lastEvent = null;
		anigenActual.downEvent = null;
		
		if(!event.target.isChildOf(popup.container) && event.target != popup.container) {
			popup.hide();
		}
		return;
	}
	
	if(anigenActual.tools[0].target) { anigenActual.tools[0].mouseUp(event); }
	anigenActual.tools[anigenActual.tool].mouseUp(event);
	
	if(event.button >= 2) { // not left or middle click
		anigenActual.lastEvent = null;
		anigenActual.downEvent = null;
		if(!event.target.isChildOf(popup.container) && event.target != popup.container) {
			popup.hide();
		}
		return;
	}
	
	// click event
	if(anigenActual.downEvent && anigenActual.downEvent.target && anigenActual.downEvent.target == event.target
		&& Math.abs(anigenActual.downEvent.clientX - event.clientX) < anigenActual.threshold.position 
		&& Math.abs(anigenActual.downEvent.clientY - event.clientY) < anigenActual.threshold.position
		&& Math.abs(anigenActual.downEvent.timeStamp - event.timeStamp) < anigenActual.threshold.time) {
		
		if(anigenActual.lastClick && anigenActual.lastClick.target && anigenActual.lastClick.target == event.target
			&& Math.abs(anigenActual.lastClick.clientX - event.clientX) < anigenActual.threshold.position 
			&& Math.abs(anigenActual.lastClick.clientY - event.clientY) < anigenActual.threshold.position
			&& Math.abs(anigenActual.lastClick.timeStamp - event.timeStamp) < anigenActual.threshold.dbl) {
			// double click!
			if(anigenActual.tools[0].target) {
				anigenActual.tools[0].mouseDblClick(event);
			} else {
				anigenActual.tools[anigenActual.tool].mouseDblClick(event);
			}
			anigenActual.lastClick = null;
		} else {
			if(anigenActual.tools[0].target) {
				anigenActual.tools[0].mouseClick(event);
			} else {
				anigenActual.tools[anigenActual.tool].mouseClick(event);
			}
			anigenActual.lastClick = event;
		}
		
	}
	
	anigenActual.tools[0].target = null;
	
	anigenActual.lastEvent = null;
	anigenActual.downEvent = null;
	if(!(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
		document.activeElement.blur();
	}
	
	if(!event.target.isChildOf(popup.container) && event.target != popup.container) {
		popup.hide();
	}
}
anigenActual.prototype.eventMouseMove = function(event) {
	var evaluated = svg.evaluateEventPosition(event);
	anigenManager.classes.rulerH.setArrow(evaluated.x);
	anigenManager.classes.rulerV.setArrow(evaluated.y);
	
	if((event.button == 1 || event.buttons == 4) && anigenActual.lastEvent) {
		var dX = Math.round((anigenActual.lastEvent.clientX - event.clientX)/svg.zoom);
		var dY = Math.round((anigenActual.lastEvent.clientY - event.clientY)/svg.zoom);
		anigenActual.lastEvent = event;
		svg.moveView(dX, dY);
		return;
	}
	
	anigenActual.lastEvent = event;
	
	if(anigenActual.tools[0].target) {
		anigenActual.tools[0].mouseMove(event);
		return;
	}
	if(!anigenActual.tools[anigenActual.tool]) { return; }
	anigenActual.tools[anigenActual.tool].mouseMove(event);
}
anigenActual.prototype.eventContextMenu = function(event) {
	if(event.target.isChildOf(popup.container) || event.target.isChildOf(overlay.container) || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) { return; }
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
	if(event.target.isChildOf(popup.container)) { return; }
	if(anigenActual.tools[0].target) { anigenActual.tools[0].mouseContextMenu(event); return; }
	if(!anigenActual.tools[anigenActual.tool]) { return; }
	anigenActual.tools[anigenActual.tool].mouseContextMenu(event);
}


anigenActual.prototype.eventChange = function(event) {
	if(event.target instanceof HTMLInputElement) {
		event.target.removeClass("changed");
		void event.target.offsetWidth;
		event.target.addClass("changed");
	}
}

anigenActual.prototype.eventMouseOver = function(event) {
	if(event.target instanceof SVGElement) {
		if(anigenActual.focused == null) { return; }
		anigenActual.focused = null;
		return;
	}
	if(event.target.isChildOf(anigenActual.focused) || event.target == anigenActual.focused) { return; }
	var targ = event.target;
	while(!(targ instanceof HTMLHtmlElement) && targ.parentNode) {
		if(targ.getAttribute('class') == 'window') {
			anigenActual.focused = targ;
			return;
		}
		targ = targ.parentNode;
	}
}

anigenActual.prototype.eventScroll = function(event) {
	if(event.altKey) {	// time seeking
		var ratio = svg.svgElement.animationsPaused() ? 1 : 10;
			ratio *= event.ctrlKey ? 0.1 : 1;
			ratio *= ((event.deltaY || event.deltaX) < 0) ? 1 : -1;
			
			svg.seek(0.01*ratio);
			
	} else if(event.ctrlKey) {
		// ctrl-scrolling zooms
		var evaluated = svg.evaluateEventPosition(event);
		svg.zoomAround(evaluated.x, evaluated.y, (event.deltaY < 0));
	} else {
		var ratio = (event.deltaY < 0 || event.deltaX < 0) ? -1 : 1;		
		svg.moveView(
			(event.shiftKey ? 1 : 0)*ratio*Math.round(30/svg.zoom),
			(event.shiftKey ? 0 : 1)*ratio*Math.round(30/svg.zoom)
		);	
	}
}

anigenActual.prototype.eventPreventDefault = function(event) {
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
}

anigenActual.prototype.eventFileDrop = function(event) {
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
	if(!event.dataTransfer || !event.dataTransfer.files) { return; }
	svg.load(event.dataTransfer);
	document.body.focus();
}

anigenActual.prototype.eventFileStart = function(event) {
	event.target.setAttribute('class', 'dragover');
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
}

anigenActual.prototype.eventFileDragend = function(event) {
	event.target.removeAttribute('class');
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
}

anigenActual.prototype.eventRenderProcess = function(done, total, beginTime) {
	var estimateDate = new Date((total-(done+1))*((+ new Date()) - beginTime.getTime())/(done+1));
	
	var estimate = estimateDate.toUTCString().split(' ')[4];
	if(!estimate) { estimate = '(not enough data)'; }
	
	document.title = parseInt(100*(done+1)/total) + "% rendering - aniGen";
	
	var progressBar = document.getElementById('anigenProgressBar');
	progressBar.shepherd.setMax(total);
	progressBar.shepherd.setValue(done+1, "Rendered: " + (done+1) + "/" + total + ", remaining: " + estimate);
}

anigenActual.prototype.eventRenderDone = function(format) {
	var progressBar = document.getElementById('anigenProgressBar');
	progressBar.shepherd.setMax(1);
	progressBar.shepherd.setIndefinite(true);
	progressBar.shepherd.setValue(1, "Packing ZIP");
	
	document.title = svg.fileName + " - aniGen";
	
	setTimeout(function() { svg.packRendered(format); }, 200);
}

anigenActual.prototype.eventWheelPreventDefault = function(event) {
	if(event.ctrlKey || event.altKey || (event.shiftKey && event.target.isChildOf(svg.svgElement)) ) {
        event.preventDefault ? event.preventDefault() : event.returnValue = false;
    }
}

anigenActual.prototype.eventUIRefresh = function(hard) {
	if(hard) {
		anigenManager.classes.editor.refreshZoom();
		anigenManager.classes.editor.refreshPause();
		anigenManager.classes.selection.refresh();
		anigenManager.classes.context.refresh();
		anigenManager.classes.windowLayers.refresh();
		if(!this.hasClock) {
			window.setInterval(function() { 
				if(!svg || !svg.svgElement || svg.svgElement.animationsPaused()) { return; }
				
				var curTime = + new Date();
				if(this.nextRedraw && this.nextRedraw > curTime) { return; }
				
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
				anigenManager.classes.editor.clock.update();
				anigenManager.classes.context.refreshKeyframeButtons();
				if(svg && svg.ui && svg.ui.selectionBox &&
					this.settings.get('selectionboxAutorefresh')) {
					svg.ui.selectionBox.refresh();
				}
				
				var endTime = (+ new Date());
				this.nextRedraw = endTime+((endTime-curTime) > this.threshold.redraw ? (endTime-curTime) : this.threshold.redraw);
				
			}.bind(this), 19);
			this.hasClock = true;
		}
	}
	
	anigenManager.classes.windowAnimation.refresh();
	window.dispatchEvent(new Event("treeSeed"));
	svg.gotoTime();
	// already a part of tree.seed();
	//svg.select();
}

anigenActual.prototype.getIconType = function() { return this.iconType; }
anigenActual.prototype.getIconHeight = function() { return this.iconHeight; }
anigenActual.prototype.isConfirmed = function() { return getData('anigenDisclaimer') == null ? false : true; }

anigenActual.prototype.getNodeIcon = function(element) {
	var validChildren = false;
	for(var i = 0; i < element.children.length; i++) {
		if(element.children[i].getAttribute('anigen:lock')) {
			continue;
		} else {
			validChildren = true;
			break;
		}
	}
	
	var icon = "label";
	switch(element.nodeName.toLowerCase()) {
		case "animate":
		case "animatemotion":
		case "animatetransform":
		case "animatecolor":
			if(validChildren) {
				icon = "settings_applications";
			} else {
				icon = "settings";
			}
			break;
		case "svg":
		case "g":
			if(validChildren) {
				icon = "folder_open";
			} else {
				icon = "folder"
			}
			if(element.getAttribute("inkscape:groupmode") == "layer") {
				icon = "layers";
				name = element.getAttribute("inkscape:label")+'#'+name;
			}
			if(element.getAttribute("anigen:name")) {
				icon = "folder_special";
				name = element.getAttribute("anigen:name")+'#'+name;
			}
			if(element.getAttribute("anigen:type") == "animationState") {
				icon = "fingerprint";
			}
			if(element.getAttribute("anigen:type") == "animationGroup") {
				icon = "settings_applications";
			}
			break;
		case "inkscape:path-effect":
			icon = "gesture";
			break;
		case "lineargradient":
		case "radialgradient":
			icon = "gradient";
			break;
		case "clippath":
			icon = "flip";
			break;
		case "filter":
			icon = "blur_on";
			break;
		case "use":
			icon = "link";
			break;
		case "defs":
			if(validChildren) {
				icon = "star_border";
			} else {
				icon = "star";
			}
			
			break;
		default:
			if(validChildren) {
				icon = "label_outline";
			} else {
				icon = "label";
			}
			if(element.getAttribute("anigen:type") == "animatedViewbox") {
				icon = "videocam";
			}
			break;
	}
	
	return icon;
}

anigenActual.prototype.getNodeDescription = function(element, omitAnigen) {
	switch(element.nodeName.toLowerCase()) {
		case 'svg':
			return "Root containing element of an SVG document.";
		case 'g':
			if(omitAnigen || !element.getAttribute('anigen:type')) {
				return "Group container element - holds other elements.";
			} else {
				switch(element.getAttribute('anigen:type')) {
					case 'animatedState':
						return "AniGen pseudo-element describing an animation state, used to animate animated groups.";
					case 'animatedGroup':
						return "AniGen pseudo-element describing an animated group. Acts much like any other animation, but governs multiple animations of different kinds, allowing complex animations of groupped objects.";
					case 'animatedViewbox':
						return "AniGen pseudo-element describing animation of viewbox, i.e. the image's \"camera\".";
				}
			}
		case 'defs':
			return "Definitions. Container element holding filters, clip-paths, and other elements not meant to be rendered by themselves, but necessary for the image's function."
		case 'desc':
		case 'title':
			return "Text-only description of the image.";
		case 'symbol':
			return "Non-rendered container element, only shown when refered to by a <use> element.";
		case 'use':
			return "Linking element, used to create clone of an existing (linked) object.";
		case 'image':
			return "Image file; raster (e.g. JPEG or PNG) or vector (e.g. SVG) image, holding data directly, or as a reference.";
		case 'mpath':
			return "Motion path. Reference to a <path> element.";
		case 'switch':
			return "Logic element, rendering first of its children to match given system requirements. Used for cross-device compatibility, language switching, and extension checking.";
		case 'style':
			return "Stylesheet (usually CSS), embeded directly into SVG and accessed via linking.";
		case 'path':
			return "Bézier path; curve described by its path data (control points).";
		case 'rect':
			return "Rectangle; one of basic shapes with witdth and height.";
		case 'circle':
			return "Circle defined by its origin and radius.";
		case 'ellipse':
			return "Ellipse defined by its center and radii.";
		case 'line':
			return "Line from one point to another.";
		case 'polyline':
			return "Line following several points in sequence.";
		case 'polygon':
			return "Polygon; angular, closed shape defined by its corner points.";
		case 'text':
			return "Text container element, holding raw text and other textual elements.";
		case 'tspan':
			return "Adjusts text and font properties, as well as position within a <text> element.";
		case 'tref':
			return "Text reference element.";
		case 'textpath':
			return "Text path. Allows for placement of text along a given <path>.";
		case 'marker':
			return "Container element describing markers drawn on <path>, <line>, <polyline> and <polygon> elements.";
		case 'color-profile':
			return "Color profile, used to define color rules via linking from other elements.";
		case 'clippath':
			return "Container element; its children describe a clipping area.";
		case 'filter':
			return "Filter container element; linked by other elements. Manipulates rendered graphical data according to its child elements and attributes.";
		case 'fedistantlight':
			return "Distant light, casting light from certain azimuth and elevation (like the sun).";
		case 'fepointlight':
			return "Point light source.";
		case 'fespotlight':
			return "Directional light source.";
		case 'feblend':
			return "Composites two sets of pixel data together with common blending models (e.g. multiply, screen, darken).";
		case 'fecolormatrix':
			return "Applies matrix transformation to input RGBA to produce different colors.";
		case 'fecomponenttransfer':
			return "Changes components (color channels and alpha channel) individually according to given functions.";
		case 'fecomposite':
			return "Combines two sets of pixel data using Porter-Duff operations (e.g. over, in, atop), and arithmetic operations.";
		case 'feconvolvematrix':
			return "Combines neighbouring pixels as specified by a convolution matrix.";
		case 'fediffuselighting':
			return "Creates diffuse lighting using an alpha channel bump map.";
		case 'fedisplacementmap':
			return "Physically displaces pixels from the first data set according the corresponding colors in the second one.";
		case 'feflood':
			return "Creates a single-color rectangle used by other filters.";
		case 'fegaussianblur':
			return "Performs a Gaussian blur on input image, defined by its separate standard X and Y deviations.";
		case 'feimage':
			return "Refers to external graphics.";
		case 'femerge':
			return "Merges given input according to its child <feMergeNode> elements.";
		case 'femorphology':
			return "Performs \"thinning\" or \"fattening\" of artwork (dilation or erosion).";
		case 'feoffset':
			return "Offsets input image.";
		case 'fespecularlighting':
			return "Creates specular lighting using an alpha channel bump map.";
		case 'fetile':
			return "Fills target rectangle with repeated tiled pattern of an input image.";
		case 'feturbulence':
			return "Creates image using the Perlin turbulence function.";
		case 'cursor':
			return "Container element; defines platform-independent custom cursor.";
		case 'a':
			return "Hyperlink anchor element.";
		case 'view':
			return "Predefined view data; aggregation of viewBox, aspect ratio, zoom and pan, and viewingTraget data.";
		case 'script':
			return "Script, external or otherwise, in given language (e.g. javaScript, ECMAScript).";
		case 'animate':
			return "Generic attribute animation. Changes values of attributes using various timing and interpolation models.";
		case 'set':
			return "Sets the value of given attribute for certain duration. Simplified version of <animate> element.";
		case 'animatemotion':
			return "Movement along a given <path>.";
		case 'animatecolor':
			return "Color animation; made obsolete by <animate>.";
		case 'animatetransform':
			return "Transformation; animates transformation matrix of the given element, allowing for tranlation, rotation, scaling or X/Y skewing.";
		case 'font':
			return "Container element; defines an SVG font.";
		case 'glyph':
			return "Defines graphics for given glyph. Used within a <font>.";
		case 'missing-glyph':
			return "Defines graphics used for a glyph with no explicit data.";
		case 'hkern':
			return "Defines kerning pairs for horizontally-oriented pairs of glyphs.";
		case 'vkern':
			return "Defines kerning pairs for vertically-oriented pairs of glyphs.";
		case 'font-face':
			return "Describes font characteristings according to font-face CSS facitiliy (e.g. family, weight, variant).";
		
		case 'metadata':
			return "Holds other XML data describing the SVG document.";
		
		/* other (inkscape) */
		
		case 'inkscape:path-effect':
			return "Governs Inkscape's path effects, such as varying stroke thickness.";
		
	}
	
	return null;
}

anigenActual.prototype.bell = function() {
	var audio = new Audio('_sounds/alarm.wav');
		audio.play();
}

