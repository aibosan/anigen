/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@version	0.7.3
 *	@brief		Main event handling class, also links to the instance of svg class
 */
function anigenActual() {
    this.iconType = 32;
    this.iconHeight = 24;
    this.version = "0.7.3 Almost Editor";
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
	this.firstEvent = null;
	
	this.focused = null;
	
	this.hasClock = false;

    this.history = new history();
}

anigenActual.prototype.confirm = function() {
	setData("anigenDisclaimer", true);
}

anigenActual.prototype.isPaused = function() { return this.paused; }

// hides right pannel if all windows are hidden
anigenActual.prototype.checkWindows = function() {
	var content = w2ui['layout'].content('right');
	var hide = true;
	for(var i = 0; i < content.length; i++) {
		if(!content[i].hasClass('hidden')) { hide = false; break; }
	}
	if(hide) {
		w2ui['layout'].hide('right', true);
	} else {
		w2ui['layout'].show('right', true);
	}
}

// keyboard event handler
anigenActual.prototype.eventKeyDown = function(evt) {
	if(evt.keyCode == 116) {		// F5
		confirm("Refreshing the page will cause the loss of any unsaved data.") ? window.location.reload() : null; 
		evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
		return false;
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
			if(evt.target.nodeName.toLowerCase() == 'input' && !evt.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			svg.selected.moveUp(true);
			tree.seed();
			svg.select();
			break;
		case 'PageDown':		// page down
			if(evt.target.nodeName.toLowerCase() == 'input' && !evt.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			svg.selected.moveDown(true);
			tree.seed();
			svg.select();
			break;
		case 'End':		// end
			if(evt.target.nodeName.toLowerCase() == 'input' && !evt.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			svg.selected.moveBottom(true);
			tree.seed();
			svg.select();
			break;
		case 'Home':		// home
			if(evt.target.nodeName.toLowerCase() == 'input' && !evt.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			svg.selected.moveTop(true);
			tree.seed();
			svg.select();
			break;
		case 'ArrowLeft':		// left arrow key
			if(evt.target.nodeName.toLowerCase() == 'input' && !evt.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			if(evt.ctrlKey && !evt.altKey) {
				svg.gotoPreviousKeyFrame();
				response = false;
			}
			if(evt.altKey && !evt.ctrlKey) {
				svg.select(svg.selected.previousElementSibling);
				response = false;
			}
			break;
		case 'ArrowUp':		// up arrow key
			if(evt.target.nodeName.toLowerCase() == 'input' && !evt.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			if(evt.altKey && svg.selected != svg.svgElement) {
				svg.select(svg.selected.getViableParent());
				response = false;
			}
			break;
		case 'ArrowRight':		// right arrow key
			if(evt.target.nodeName.toLowerCase() == 'input' && !evt.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			if(evt.ctrlKey && !evt.altKey) {
				svg.gotoNextKeyFrame();
				response = false;
			}
			if(evt.altKey && !evt.ctrlKey) {
				svg.select(svg.selected.nextElementSibling);
				response = false;
			}
			break;
		case 'ArrowDown':		// down arrow key
			if(evt.target.nodeName.toLowerCase() == 'input' && !evt.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			if(evt.altKey && svg.selected.children.length > 0) {
				svg.select(svg.selected.children[0]);
				response = false;
			}
			break;
		case 'Delete':		// delete
			if(evt.target.nodeName.toLowerCase() == 'input' && !evt.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			svg.delete(svg.selected);
			response = false;
			break;
		case 'a':		// a
		case 'A':
			break;
		case 'b':    	// b
		case 'B':
			break;
		case 'c':		// c
		case 'C':
			if(evt.target.nodeName.toLowerCase() == 'input' && !evt.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			if(evt.ctrlKey) {
				svg.copy(svg.selected);
				response = false;
			}
			break;
		case 'd':		// d
		case 'D':
			if(evt.ctrlKey) {
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
			if(evt.ctrlKey && evt.shiftKey) {
				w2ui['anigenContext'].click('buttonAnimation');
				response = false;
			}
			break;
		case 'l':		// l
		case 'L':
			if(evt.ctrlKey && evt.shiftKey) {
				w2ui['anigenContext'].click('buttonLayers');
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
		case 's':		// s
		case 'S':
			if(evt.ctrlKey) {
			  svg.save();
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
			if(evt.target.nodeName.toLowerCase() == 'input' && !evt.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			if(evt.ctrlKey) {
				if(!anigenActual.lastEvent) {
					anigenActual.lastEvent = { clientX: window.innerWidth/2, clientY: window.innerHeight/2 }
				}
				var evaluated = svg.evaluateEventPosition(anigenActual.lastEvent);
				svg.paste(evaluated.x, evaluated.y, svg.selected);
				response = false;
			}
			break;
		case 'x':		// x
		case 'X':
			if(evt.target.nodeName.toLowerCase() == 'input' && !evt.target.isChildOf(document.getElementById('layout_layout_panel_left'))) { return; }
			if(evt.ctrlKey && !evt.shiftKey && svg.selected != svg.svgElement) {
				svg.cut(svg.selected);
				response = false;
			}
			if(evt.ctrlKey && evt.shiftKey) {
				w2ui['anigenContext'].click('buttonTree');
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
			w2ui['anigenContext'].click('toolSelect');
			response = false;
			break;
		case 'F2':		// F2
			w2ui['anigenContext'].click('toolPrecise');
			response = false;
			break;
		case 'F3':		// F3
			w2ui['anigenContext'].click('toolMagnifier');
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
			w2ui['anigenContext'].click('toolPicker');
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
			anigenActual.settings.set('treeWidth', w2ui['layout'].get('left').size);
			break;
		case 'right':
			anigenActual.settings.set('windowsWidth', w2ui['layout'].get('right').size);
			break;
		case 'bottom':
			anigenActual.settings.set('timelineHeight', w2ui['layout'].get('bottom').size);
			break;
	}
}

anigenActual.prototype.eventMouseDown = function(event) {
	if(event.target.getAttribute('anigen:lock') == 'anchor') {
		anigenActual.tools[0].target = event.target.parentNode.shepherd;
		anigenActual.tools[0].mouseDown(event);
		return;
	}
	if(!anigenActual.tools[anigenActual.tool]) { return; }
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
	anigenActual.tools[anigenActual.tool].mouseClick(event);
}
anigenActual.prototype.eventDblClick = function(event) {
	if(anigenActual.tools[0].target) { anigenActual.tools[0].mouseDblClick(event); return; }
	if(!anigenActual.tools[anigenActual.tool]) { return; }
	anigenActual.tools[anigenActual.tool].mouseDblClick(event);
}
anigenActual.prototype.eventMouseMove = function(event) {
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
	if(menu) { menu.refresh(); }
	popup.hide();
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
	
	var progressBar = document.getElementById('anigenProgressBar');
	progressBar.shepherd.setMax(total);
	progressBar.shepherd.setValue(done+1, "Rendered: " + (done+1) + "/" + total + ", remaining: " + estimate);
}

anigenActual.prototype.eventRenderDone = function() {
	var progressBar = document.getElementById('anigenProgressBar');
	progressBar.shepherd.setMax(1);
	progressBar.shepherd.setIndefinite(true);
	progressBar.shepherd.setValue(1, "Packing ZIP");
	setTimeout(function() { svg.packRendered(); }, 200);
}

anigenActual.prototype.eventUIRefresh = function(hard) {
	if(hard) {
		infoEditor.refreshZoom();
		infoEditor.refreshPause();
		infoSelection.refresh();
		infoContext.refresh();
		windowLayers.refresh();
		if(!anigenActual.hasClock) {
			window.setInterval(function() { infoEditor.clock.update(); }, 19);
			anigenActual.hasClock = true;
		}
	}
	windowAnimation.refresh();
	tree.seed();
	svg.gotoTime();
	svg.select();
}

anigenActual.prototype.getIconType = function() { return this.iconType; }
anigenActual.prototype.getIconHeight = function() { return this.iconHeight; }
anigenActual.prototype.isConfirmed = function() { return getData('anigenDisclaimer') == null ? false : true; }
