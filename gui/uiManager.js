/**
 *  @author		Ondrej Benda
 *  @date		2017
 *  @copyright	GNU GPLv3
 *	@brief		Manager for UI layout, keeps track of sections and windows.
 */
function uiManager() {
	if(window.anigenManager) { return; }
	
	this.sections = [];
	this.activeSection = null;
	
	this.named = {};
	this.classes = {};
	
	window.addEventListener("mousedown", this.eventMouseDown, false);
	window.addEventListener("mouseup", this.eventMouseUp, false);
	window.addEventListener("mousemove", this.eventMouseMove, false);
	
	window.addEventListener("resize", this.eventResize, false);
	window.addEventListener("resizing", this.eventResize, false);
	
	window.anigenManager = this;
}

uiManager.prototype.seedAnigen = function() {
	// wipes body
	document.body.removeChildren();
	
	// creates svg area for exporting
	var svgArea = document.createElement('div');
		svgArea.setAttribute('id', 'svgArea');
	document.body.appendChild(svgArea);
	
	// svg
	document.body.appendChild(new uiSection([0,0,0,0],false,true,{'class': 'section-svg'},this).container);
	this.named.svg = this.sections[this.sections.length-1];
	
	// listeners
	//window.anigenActual.connectSVG(this.named.svg.content);
	anigenManager.named.svg.container.addEventListener("mousemove", anigenActual.eventMouseMove, false);
    anigenManager.named.svg.container.addEventListener("mousedown", anigenActual.eventMouseDown, false);
    anigenManager.named.svg.container.addEventListener("mouseup", anigenActual.eventMouseUp, false);
    anigenManager.named.svg.container.addEventListener("click", anigenActual.eventClick, false);
    anigenManager.named.svg.container.addEventListener("dblclick", anigenActual.eventDblClick, false);
    anigenManager.named.svg.container.addEventListener("mousewheel", anigenActual.eventScroll, false);
    anigenManager.named.svg.container.addEventListener("wheel", anigenActual.eventScroll, false);
	anigenManager.named.svg.container.addEventListener('mouseover', anigenActual.eventMouseOver, false);
	
	// left
	document.body.appendChild(new uiSection([0,109,window.innerWidth/3,35],[false, true, false, false],[false, false, true, true],{'class': 'section-left'},this).container);
	this.named.left = this.sections[this.sections.length-1];
	// right
	document.body.appendChild(new uiSection([2*window.innerWidth/3,109,100,35],[false, false, false, true],[false, true, true, false],{'class': 'section-right'},this).container);
	this.named.right = this.sections[this.sections.length-1];
	
	
	// selection info
	document.body.appendChild(new uiSection([0,34,100,42],false,[false, true, false, true],{'class': 'section-top-row2'},this).container);
	this.named.selection = this.sections[this.sections.length-1];
	// editor info & menu
	document.body.appendChild(new uiSection([0,0,100,36],false,[true, true, false, true],{'class': 'section-top-row1'},this).container);
	this.named.info = this.sections[this.sections.length-1];
	// context menu	
	document.body.appendChild(new uiSection([0,76,100,32],false,[false, true, false, true],{'class': 'section-top-row3'},this).container);
	this.named.context = this.sections[this.sections.length-1];
	
	
	this.classes.editor = new infoEditor();
	this.classes.menu = new menu();
	this.classes.selection = new infoSelection();
	this.classes.context = new infoContext();
	this.classes.windowAnimation = new windowAnimation();
	this.classes.windowLayers = new windowLayers();
	this.classes.windowColors = new windowColors();
	this.classes.tree = new tree();
	
	
	this.classes.rulerH = new uiRuler(false, this.named.context);
	this.classes.rulerV = new uiRuler(true, this.named.left);
	
	this.named.svg.container.appendChild(this.classes.rulerV.container);
	this.named.svg.container.appendChild(this.classes.rulerH.container);
	
	
	this.named.info.content.appendChild(this.classes.editor.container);
	this.named.info.content.appendChild(this.classes.menu.container);
	this.named.selection.content.appendChild(this.classes.selection.container);
	this.named.context.content.appendChild(this.classes.context.container);
	this.named.right.content.appendChild(this.classes.windowAnimation.container);
	this.named.right.content.appendChild(this.classes.windowColors.container);
	this.named.right.content.appendChild(this.classes.windowLayers.container);
	this.named.left.content.appendChild(this.classes.tree.container);
	
	// overlay and popup
	window.popup = new popup();
	window.popup.hide();
	
	window.overlay = new overlay();
	
	// confirmation dialogue
	if(anigenActual.isConfirmed()) {
		overlay.macroOpen();
	} else {
		overlay.macroDisclaimer();
	}
	overlay.animate = true;
	
	
	// load settings
	anigenActual.settings.loadData();
	anigenActual.settings.apply();
}

uiManager.prototype.init = function() {
	
	return this;
}

uiManager.prototype.register = function(target) {
	if(target instanceof uiSection) {
		if(this.sections.indexOf(target) != -1) { return; }
		
		this.sections.push(target);
		
		target.container.removeEventListener("mousedown", target.eventResizerDown, false);
		target.container.removeEventListener("mouseup", target.eventResizerUp, false);
		target.container.removeEventListener("mousemove", target.eventResizerMove, false);
		target.container.removeEventListener("mouseleave", target.eventResizerUp, false);
		
		
		
	}
}

uiManager.prototype.unregister = function(target) {
	if(target instanceof uiSection) {
		if(this.sections.indexOf(target) == -1) { return; }
		this.sections.splice(this.sections.indexOf(target), 1);
	}
}

uiManager.prototype.eventMouseDown = function(event) {
	if(event.target.hasClass('resizer') && !event.target.hasClass('disabled')) {
		var owner = event.target.parentNode.shepherd;
		if(!owner) { return; }
		if(window.anigenManager.sections.indexOf(owner) == -1) {
			window.anigenManager.activeSection = null;
		}
		window.anigenManager.activeSection = owner;
		
		if(event.target.hasClass('top')) { owner.beingResized = 1; }
		if(event.target.hasClass('right')) { owner.beingResized = 2; }
		if(event.target.hasClass('bottom')) { owner.beingResized = 3; }
		if(event.target.hasClass('left')) { owner.beingResized = 4; }
	}
}

uiManager.prototype.eventMouseUp = function(event) {
	window.anigenManager.activeSection = null;
}

uiManager.prototype.eventMouseMove = function(event) {
	if(window.anigenManager.activeSection) {
		window.anigenManager.activeSection.eventResizerAction(event);
	}
}

uiManager.prototype.refresh = 
uiManager.prototype.eventResize = function(event) {
	for(var i = 0; i < window.anigenManager.sections.length; i++) {
		window.anigenManager.sections[i].refresh();
	}
}
