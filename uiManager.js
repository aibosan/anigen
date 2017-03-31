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
	this.named.svg = new uiSection([0,0,0,0],false,true,{'class': 'section-svg'},this);
	
	// left
	this.named.left = new uiSection([0,109,window.innerWidth/3,35],[false, true, false, false],[true, false, true, true],{'class': 'section-left'},this,'anigenActual.settings.set("treeWidth", this.width);');
	// right
	this.named.right = new uiSection([2*window.innerWidth/3,109,100,35],[false, false, false, true],[true, true, true, false],{'class': 'section-right'},this,'anigenActual.settings.set("windowsWidth", this.width);');
	
	// bottom portion
	var bottomAction = '';
		bottomAction += 'var desired=Math.round((this.height)/24)*24;';
		bottomAction += 'this.setY(window.innerHeight-(desired == 0 ? 6 : desired));';
		bottomAction += 'this.refresh();';
		bottomAction += 'anigenManager.refresh();';
		bottomAction += 'anigenActual.settings.set("bottomHeight", this.height);';
	
	this.named.bottom = new uiSection([0,window.innerHeight-24,100,24],[true, false, false, false],[false, true, true, true],{'class': 'section-bottom'},this,bottomAction);
	
	
	// top portion
	// selection info
	this.named.selection = new uiSection([0,34,100,42],false,[false, true, false, true],{'class': 'section-top-row2'},this);
	// editor info & menu
	this.named.info = new uiSection([0,0,100,36],false,[true, true, false, true],{'class': 'section-top-row1'},this);
	// context menu	
	this.named.context = new uiSection([0,76,100,32],false,[false, true, false, true],{'class': 'section-top-row3'},this);
	
	// timeline
	this.named.timeline = new uiSection([0,74,100,0],false,[false, true, false, true],null,this);
	
	
	this.named.left.setLimits([this.named.context, this.named.right, this.named.bottom, null]);
	this.named.right.setLimits([this.named.context, null, this.named.bottom, this.named.left]);
	
	this.named.left.setSlacks([-1, 64, 0, 0]);
	this.named.right.setSlacks([-1, 0, 0, 64]);
	
	this.named.bottom.setLimits([this.named.context, null, null, null]);
	this.named.bottom.setSlacks([64, 0, 0, 0]);
	
	// listeners
	//window.anigenActual.connectSVG(this.named.svg.content);
	anigenManager.named.svg.container.addEventListener("mousemove", anigenActual.eventMouseMove, false);
    anigenManager.named.svg.container.addEventListener("mousedown", anigenActual.eventMouseDown, false);
    //anigenManager.named.svg.container.addEventListener("mouseup", anigenActual.eventMouseUp, false);
    anigenManager.named.svg.container.addEventListener("wheel", anigenActual.eventScroll, false);
	anigenManager.named.svg.container.addEventListener('mouseover', anigenActual.eventMouseOver, false);
	
	for(var i in this.named) {
		document.body.appendChild(this.named[i].container);
	}
	
	
	this.classes.timeline = new uiTimeline();
	
	this.classes.editor = new infoEditor(this.classes.timeline);
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
	
	
	this.named.timeline.content.appendChild(this.classes.timeline.container);
	this.named.info.content.appendChild(this.classes.editor.container);
	this.named.info.content.appendChild(this.classes.menu.container);
	this.named.selection.content.appendChild(this.classes.selection.container);
	this.named.context.content.appendChild(this.classes.context.container);
	this.named.right.content.appendChild(this.classes.windowAnimation.container);
	this.named.right.content.appendChild(this.classes.windowColors.container);
	this.named.right.content.appendChild(this.classes.windowLayers.container);
	this.named.left.content.appendChild(this.classes.tree.container);
	this.named.bottom.content.appendChild(log.container);
	
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
	anigenActual.resetTitle();
	
	log.report('UI built.');
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
	anigenManager.downEvent = event;
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
	anigenManager.downEvent = null;
	anigenManager.activeSection = null;
	anigenManager.classes.timeline.downEvent = null;
	if(!event.target.isChildOf(anigenManager.classes.windowAnimation.tab1) && 
		!event.target.isChildOf(popup.container)
	) {
		anigenManager.classes.windowAnimation.lastClicked = null;
	}
}

uiManager.prototype.eventMouseMove = function(event) {
	if(anigenManager.classes.timeline.downEvent) {
		anigenManager.classes.timeline.eventMouseMove(event);
	}
	if(popup.lastEvent) {
		popup.moveBy(event.clientX-popup.lastEvent.clientX, event.clientY-popup.lastEvent.clientY);
		popup.lastPosition.x = popup.x;
		popup.lastPosition.y = popup.y;
		popup.lastEvent = event;
	}
	if(window.anigenManager.activeSection) {
		window.anigenManager.activeSection.eventResizerAction(event);
	}
}

uiManager.prototype.refresh = 
uiManager.prototype.eventResize = function(event) {
	window.anigenManager.named['right'].setX(window.innerWidth-window.anigenManager.named['right'].width);
	window.anigenManager.named['bottom'].setY(window.innerHeight-window.anigenManager.named['bottom'].height);
	
	for(var i = 0; i < window.anigenManager.sections.length; i++) {
		window.anigenManager.sections[i].refresh();
	}
}

uiManager.prototype.setCursor = function(cursorName) {
	if(!this.named || !this.named['svg'] || !this.named['svg'].container) { return; }
	
	if(!cursorName) {
		cursorName = 'default';
	} else {
		cursorName += ',default';
	}
	
	this.named['svg'].container.style.cursor = cursorName;
}

