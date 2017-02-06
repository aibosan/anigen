/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@version	0.8.0
 *	@brief		Main event handling class, also links to the instance of svg class
 */
function anigenActual() {
    this.iconType = 32;
    this.iconHeight = 24;
    this.version = "0.8.0 UI Rewrite";
    this.tool = 1;
	
	this.tools = [
		new toolAnchor(),
		new toolGroup(),
		new toolElement(),
		new toolZoom(),
		new toolPicker()
	];
	
	this.settings = new settings();
	this.lastEvent = null;
	
	this.focused = null;
	
	this.hasClock = false;
	
	window.addEventListener("keydown", this.eventKeyDown, false);
	window.addEventListener("resize", this.eventResize, false);
	window.addEventListener("mousewheel", this.eventWheelPreventDefault, false);
	window.addEventListener("wheel", this.eventWheelPreventDefault, false);

	window.addEventListener("contextmenu", this.eventContextMenu, false);
	window.addEventListener("click", this.eventClickWindow, false);
	window.addEventListener("change", this.eventChange, false);
	window.addEventListener("beforeunload", this.eventNavigation, false);
	window.addEventListener("dragover", this.eventPreventDefault, false);
	window.addEventListener("drop", this.eventFileDrop, false);

	window.addEventListener('resize', this.eventResize, false);
	
	window.anigenActual = this;
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

anigenActual.prototype.eventNavigation = function(evt) {
	/*
	if(anigenActual.autosave) { svg.save(true); }
	evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
	anigenActual.autosave = true;
	*/
	evt.returnValue = "Navigating from this page will cause the loss of any unsaved data.";
	return "Navigating from this page will cause the loss of any unsaved data.";
}

// keyboard event handler
anigenActual.prototype.eventKeyDown = function(evt) {
	if(evt.keyCode == 116) {		// F5
		//evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
		return;
	}
	
	if(evt.keyCode == 123) { return true; }		// F12
	
	if(!svg.svgElement) {
		evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
		return false;
	}
	
	// if window is focused (hovered over) and its KeyDown event handler exists, passes event on
	if(anigenActual.focused && anigenActual.focused.shepherd && typeof anigenActual.focused.shepherd.eventKeyDown === 'function') {
		if(anigenActual.focused.shepherd.eventKeyDown(evt)) {
			evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
			return;
		}
	}
	
	var response = true;		// the event should be passed to the browser
	
	switch(evt.key) {
		case 'Enter':		// enter (return) key
			break;
		case 'Pause':		// pause break
			if(evt.altKey) {	// alt-pause resets animations to T=0
				svg.gotoTime(0);
			} else {
				svg.pauseToggle();
			}
			
			break;
		case ' ':		// spacebar
			if(evt.target != document.body) { return; }
			svg.pauseToggle();
			response = false;
			break;
		case 'Escape':		// escape
			if(svg.svgElement != null) {
				popup.hide();
				overlay.hide();
			}
			response = false;
			break;
		case 'PageUp':		// page up
			if((evt.target instanceof HTMLInputElement || evt.target instanceof HTMLTextAreaElement) && !evt.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			svg.selected.moveUp(true);
			anigenManager.classes.tree.seed();
			svg.select();
			break;
		case 'PageDown':		// page down
			if((evt.target instanceof HTMLInputElement || evt.target instanceof HTMLTextAreaElement) && !evt.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			svg.selected.moveDown(true);
			anigenManager.classes.tree.seed();
			svg.select();
			break;
		case 'End':		// end
			if((evt.target instanceof HTMLInputElement || evt.target instanceof HTMLTextAreaElement) && !evt.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			svg.selected.moveBottom(true);
			anigenManager.classes.tree.seed();
			svg.select();
			break;
		case 'Home':		// home
			if((evt.target instanceof HTMLInputElement || evt.target instanceof HTMLTextAreaElement) && !evt.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			svg.selected.moveTop(true);
			anigenManager.classes.tree.seed();
			svg.select();
			break;
		case 'ArrowLeft':		// left arrow key
			if((evt.target instanceof HTMLInputElement || evt.target instanceof HTMLTextAreaElement) && !evt.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			if(evt.ctrlKey && !evt.altKey) {
				svg.gotoPreviousKeyFrame();
				response = false;
			}
			if(evt.altKey && !evt.ctrlKey) {
				svg.select(svg.selected.previousElementSibling);
				response = false;
			}
			if(!evt.altKey && !evt.ctrlKey) {
				if(svg.selected && !(svg.selected instanceof SVGSVGElement)) {
					svg.selected.translateBy(-1, 0, true);
					svg.select();
				}
			}
			break;
		case 'ArrowUp':		// up arrow key
			if((evt.target instanceof HTMLInputElement || evt.target instanceof HTMLTextAreaElement) && !evt.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			if(evt.altKey && svg.selected != svg.svgElement) {
				svg.select(svg.selected.getViableParent());
				response = false;
			}
			if(!evt.altKey && !evt.ctrlKey) {
				if(svg.selected && !(svg.selected instanceof SVGSVGElement)) {
					svg.selected.translateBy(0, -1, true);
					svg.select();
				}
			}
			break;
		case 'ArrowRight':		// right arrow key
			if((evt.target instanceof HTMLInputElement || evt.target instanceof HTMLTextAreaElement) && !evt.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			if(evt.ctrlKey && !evt.altKey) {
				svg.gotoNextKeyFrame();
				response = false;
			}
			if(evt.altKey && !evt.ctrlKey) {
				svg.select(svg.selected.nextElementSibling);
				response = false;
			}
			if(!evt.altKey && !evt.ctrlKey) {
				if(svg.selected && !(svg.selected instanceof SVGSVGElement)) {
					svg.selected.translateBy(1, 0, true);
					svg.select();
				}
			}
			break;
		case 'ArrowDown':		// down arrow key
			if((evt.target instanceof HTMLInputElement || evt.target instanceof HTMLTextAreaElement) && !evt.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			if(evt.altKey && svg.selected.children.length > 0) {
				svg.select(svg.selected.children[0]);
				response = false;
			}
			if(!evt.altKey && !evt.ctrlKey) {
				if(svg.selected && !(svg.selected instanceof SVGSVGElement)) {
					svg.selected.translateBy(0, 1, true);
					svg.select();
				}
			}
			break;
		case 'Delete':		// delete
			if((evt.target instanceof HTMLInputElement || evt.target instanceof HTMLTextAreaElement) && !evt.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			svg.delete(svg.selected);
			response = false;
			break;
		case 'a':		// a
		case 'A':
			if((evt.target instanceof HTMLInputElement || evt.target instanceof HTMLTextAreaElement) && !evt.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			if(svg.ui.allSelected) {
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
			if((evt.target instanceof HTMLInputElement || evt.target instanceof HTMLTextAreaElement) && !evt.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			if(evt.ctrlKey) {
				svg.copy(svg.selected);
				response = false;
			}
			break;
		case 'd':		// d
		case 'D':
			if(evt.ctrlKey && !evt.altKey) {
				svg.duplicate(svg.selected);
				response = false;
			}
			break;
		case 'e':		// e
		case 'E':
			if(evt.ctrlKey && evt.shiftKey) {
				overlay.macroExport();
				response = false;
			}
			break;
		case 'f':		// f
		case 'F':
			break;
		case 'g':		// g
		case 'G':
			if(evt.ctrlKey) {
				if(evt.altKey) {
					// ungroup
					svg.ungroup();
				} else {
					// group
					svg.group();
				}
				response = false;
			}
			break;
		case 'k':		// k
		case 'K':
			if(evt.ctrlKey && !evt.shiftKey) {
				if(svg.selected instanceof SVGAnimationElement || (svg.selected.shepherd && svg.selected.shepherd instanceof animationGroup)) {
					popup.macroAddValue();
				}
				response = false;
			}
			if(evt.ctrlKey && evt.shiftKey) {
				anigenManager.classes.context.buttons.animate.click();
				response = false;
			}
			break;
		case 'l':		// l
		case 'L':
			if(!evt.ctrlKey && evt.altKey) {
				svg.createLink(svg.selected);
				response = false;
			}
			if(evt.ctrlKey && evt.shiftKey) {
				anigenManager.classes.context.buttons.laers.click();
				response = false;
			}
			break;
		case 'n':		// n
		case 'N':
			return;
			break;
		case 'o':		// o
		case 'O':
			if(evt.ctrlKey) { overlay.macroOpen(); }
			break;
		case 'p':		// p
		case 'P':
			if(evt.ctrlKey) { svg.pauseToggle(); }
			break;
		case 'r':		// r
		case 'R':
			if(evt.ctrlKey && !evt.shiftKey) {
				if(svg.selected instanceof SVGAnimationElement || (svg.selected.shepherd && svg.selected.shepherd instanceof animationGroup)) {
					popup.macroAddValue();
				}
				response = false;
			}
			break;
		case 's':		// s
		case 'S':
			if(evt.ctrlKey) {
				if(typeof(Storage) === "undefined" || evt.shiftKey) {
					svg.save();
				} else {
					svg.save(true);
				}
				response = false;
			}
			break;
		case 't':    	// t
		case 'T':
			break;
		case 'u':		// u
		case 'U':
			break;
		case 'v':		// v
		case 'V':
			if((evt.target instanceof HTMLInputElement || evt.target instanceof HTMLTextAreaElement) && !evt.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			if(evt.ctrlKey) {
				if(!anigenActual.lastEvent) {
					anigenActual.lastEvent = { clientX: window.innerWidth/2, clientY: window.innerHeight/2 }
				}
				var evaluated = svg.evaluateEventPosition(anigenActual.lastEvent);
				svg.paste((evt.altKey ? null : evaluated), svg.selected);
				response = false;
			}
			break;
		case 'x':		// x
		case 'X':
			if((evt.target instanceof HTMLInputElement || evt.target instanceof HTMLTextAreaElement) && !evt.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			if(evt.ctrlKey && !evt.shiftKey && svg.selected != svg.svgElement) {
				svg.cut(svg.selected);
				response = false;
			}
			if(evt.ctrlKey && evt.shiftKey) 
				anigenManager.classes.context.buttons.tree.click();{
				response = false;
			}
			break;
		case 'y':		// y (history forward)
		case 'Y':
			if(evt.ctrlKey) {
				svg.history.redo();
				response = false;
			}
			break;
		case 'z':		// z (history back, history forward)
		case 'Z':
			if(evt.ctrlKey) {
				if(evt.shiftKey) {
					svg.history.redo();
				} else {
					svg.history.undo();
				}
				response = false;
			}
			break; 
		case '+':		// plus
			if(document.activeElement instanceof HTMLInputElement) { break; }
			if(evt.ctrlKey) {
				var evaluated = svg.evaluateEventPosition();
				svg.zoomAround(evaluated.x, evaluated.y, true);
				response = false;
			} else {
				var ratio = svg.svgElement.animationsPaused() ? 1 : 10;
				if(evt.shiftKey) {
					svg.seek(1*ratio);
				} else if(evt.altKey) {
					svg.seek(0.01*ratio);
				} else {
					svg.seek(0.1*ratio);
				}
			}
			break;
		case '-':		// minus
			if(document.activeElement instanceof HTMLInputElement) { break; }
			if(evt.ctrlKey) {
				var evaluated = svg.evaluateEventPosition();
				svg.zoomAround(evaluated.x, evaluated.y, false);
				response = false;
			} else {
				var ratio = svg.svgElement.animationsPaused() ? 1 : 10;
				if(evt.shiftKey) {
					svg.seek(-1*ratio);
				} else if(evt.altKey) {
					svg.seek(-0.01*ratio);
				} else {
					svg.seek(-0.1*ratio);
				}
			}
			break;
		case 'F1':		// F1
			anigenManager.classes.context.buttons.groupTool.click();
			response = false;
			break;
		case 'F2':		// F2
			anigenManager.classes.context.buttons.elementTool.click();
			response = false;
			break;
		case 'F3':		// F3
			anigenManager.classes.context.buttons.zoomTool.click();
			response = false;
			break;		
		case 'F5':		// F5
			response = false;
			break;
		case 'F6':		//	F6
			response = false;
			break;
		case 'F4':		//	F4
		case 'F7':		//	F7
			anigenManager.classes.context.buttons.pickerTool.click();
			response = false;
			break;
		default:
			response = true;
			break;
	}
	
	if(!response) {
		evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
		evt.stopPropagation ? evt.stopPropagation() : window.event.cancelBubble = true;
		return false;
	}
	return true;
}

// resizing event triggering adjustment of svg element
anigenActual.prototype.eventResize = function(evt) {
	if(svg.svgElement == null) { return; }
	svg.refreshUI(true);
}

anigenActual.prototype.eventResizeDone = function(evt) {
	if(svg.svgElement == null) { return; }
	if(evt.diff_x == 0 && evt.diff_y == 0) { return; }
	switch(evt.panel) {
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
		return;
	}
	if(!anigenActual.tools[anigenActual.tool]) { return; }
	anigenActual.lastEvent = event;
	anigenActual.tools[anigenActual.tool].mouseDown(event);
}
anigenActual.prototype.eventMouseUp = function(event) {
	if(anigenActual.tools[0].target) { anigenActual.tools[0].mouseUp(event); return; }
	if(!anigenActual.tools[anigenActual.tool]) { return; }
	anigenActual.tools[anigenActual.tool].mouseUp(event);
}
anigenActual.prototype.eventClick = function(event) {
	if(event.target.getAttribute('anigen:lock') == 'anchor') {
		anigenActual.tools[0].mouseClick(event);
		return;
	}
	if(!anigenActual.tools[anigenActual.tool]) { return; }
	if(anigenActual.lastEvent && Math.abs(anigenActual.lastEvent.clientX - event.clientX) < 5 
		&& Math.abs(anigenActual.lastEvent.clientY - event.clientY) < 5
		&& Math.abs(anigenActual.lastEvent.timeStamp - event.timeStamp) < 250) {
		anigenActual.tools[anigenActual.tool].mouseClick(event);
	}
	anigenActual.lastEvent = null;
	if(!(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
		document.body.focus();
	}
}
anigenActual.prototype.eventDblClick = function(event) {
	if(anigenActual.tools[0].target) { anigenActual.tools[0].mouseDblClick(event); return; }
	if(!anigenActual.tools[anigenActual.tool]) { return; }
	anigenActual.tools[anigenActual.tool].mouseDblClick(event);
}
anigenActual.prototype.eventMouseMove = function(event) {
	anigenActual.lastEvent = event;
	if(anigenActual.tools[0].target) {
		anigenActual.tools[0].mouseMove(event);
		return;
	}
	if(!anigenActual.tools[anigenActual.tool]) { return; }
	anigenActual.tools[anigenActual.tool].mouseMove(event);
}
anigenActual.prototype.eventContextMenu = function(event) {
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
	if(event.target.isChildOf(popup.container)) { return; }
	if(anigenActual.tools[0].target) { anigenActual.tools[0].mouseContextMenu(event); return; }
	if(!anigenActual.tools[anigenActual.tool]) { return; }
	anigenActual.tools[anigenActual.tool].mouseContextMenu(event);
}
anigenActual.prototype.eventClickWindow = function(event) {
	
	if(anigenManager.classes.menu) { anigenManager.classes.menu.refresh(); }
	if(event != popup.event) {
		popup.hide();
	}
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

anigenActual.prototype.eventScroll = function(evt) {
	if(evt.shiftKey && !evt.ctrlKey) {
		// shift-scrolling moves view left or right
		if((evt.deltaY || evt.deltaX) < 0) {
			svg.moveView(Math.round(-30/svg.zoom), 0);
		} else {
			svg.moveView(Math.round(30/svg.zoom), 0);
		}
		
	} else if(evt.ctrlKey) {
		// ctrl-scrolling zooms
		var evaluated = svg.evaluateEventPosition(evt);
		svg.zoomAround(evaluated.x, evaluated.y, (evt.deltaY < 0));
	} else {
		// otherwise, move up or down
		if(evt.deltaY < 0) {
			svg.moveView(0, Math.round(-30/svg.zoom));
		} else {
			svg.moveView(0, Math.round(30/svg.zoom));
		}
	}
}

anigenActual.prototype.eventPreventDefault = function(evt) {
	evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
}

anigenActual.prototype.eventFileDrop = function(evt) {
	evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
	if(!evt.dataTransfer || !evt.dataTransfer.files) { return; }
	svg.load(evt.dataTransfer);
}

anigenActual.prototype.eventFileStart = function(evt) {
	evt.target.setAttribute('class', 'dragover');
	evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
}

anigenActual.prototype.eventFileDragend = function(evt) {
	evt.target.removeAttribute('class');
	evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
}

anigenActual.prototype.eventRenderProcess = function(done, total, beginTime) {
	var now = new Date();
	var estimateDate = new Date((total-(done+1))*(now.getTime() - beginTime.getTime())/(done+1));
	
	var estimate = estimateDate.toUTCString().split(' ')[4];
	if(!estimate) { estimate = '(not enough data)'; }
	
	document.title = parseInt(100*(done+1)/total) + "% rendering - aniGen";
	
	var progressBar = document.getElementById('anigenProgressBar');
	progressBar.shepherd.setMax(total);
	progressBar.shepherd.setValue(done+1, "Rendered: " + (done+1) + "/" + total + ", remaining: " + estimate);
}

anigenActual.prototype.eventRenderDone = function() {
	var progressBar = document.getElementById('anigenProgressBar');
	progressBar.shepherd.setMax(1);
	progressBar.shepherd.setIndefinite(true);
	progressBar.shepherd.setValue(1, "Packing ZIP");
	
	document.title = svg.fileName + " - aniGen";
	
	setTimeout(function() { svg.packRendered(); }, 200);
}

anigenActual.prototype.eventWheelPreventDefault = function(event) {
    if(event.ctrlKey || event.altKey || event.shiftKey) {
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
		if(!anigenActual.hasClock) {
			window.setInterval(function() { 
				anigenManager.classes.editor.clock.update();
			}, 19);
			anigenActual.hasClock = true;
		}
	}
	anigenManager.classes.windowAnimation.refresh();
	anigenManager.classes.tree.seed();
	svg.gotoTime();
	svg.select();
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
			icon = "signal_cellular_null";
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

