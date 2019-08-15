/**
 *  @author		Ondrej Benda
 *  @date		2017
 *  @copyright	GNU GPLv3
 *	@brief		UI ruler
 */
function uiTimeline() {
	this.container = document.createElement('div');
	this.container.setAttribute('class', 'timeline');
	
	this.container.shepherd = this;
	this.container.addEventListener("click", this.eventMouseClick, false);
	
	this.vFrom = document.createElement('div');
	this.vFrom.addClass('boundary left');
	this.vFrom.setAttribute('onclick', 'popup.macroLoop();' );
	this.vTo = document.createElement('div');
	this.vTo.addClass('boundary right');
	this.vTo.setAttribute('onclick', 'popup.macroLoop();' );
	
	
	this.container.appendChild(this.vFrom);
	this.container.appendChild(this.vTo);
	
	this.slider = document.createElement('div');
	this.slider.setAttribute('class', 'slider');
	this.slider.addEventListener("mousedown", this.eventMouseDown, false);
	
	this.container.appendChild(this.slider);
	
	this.tFrom = 0;
	this.tTo = null;
}

uiTimeline.prototype.setMin = function(value) {
	this.tFrom = value || 0;
	this.refresh();
}

uiTimeline.prototype.setMax = function(value) {
	this.tTo = value;
	this.refresh();
}

uiTimeline.prototype.hide = function() {
	this.container.addClass('hidden');
}

uiTimeline.prototype.show = function() {
	this.container.removeClass('hidden');
}

uiTimeline.prototype.toggle = function() {
	if(this.container.hasClass('hidden')) {
		this.show();
	} else {
		this.hide();
	}
}

uiTimeline.prototype.refresh = function() {
	if(!this.tTo) {
		this.container.style.display = 'none';
		return;
	} else {
		this.container.style.display = null;
	}
	this.vFrom.innerHTML = (parseInt(this.tFrom*100)/100 != this.tFrom ? '~' : '') + parseInt(this.tFrom*100)/100+'s';
	this.vTo.innerHTML = (parseInt(this.tTo*100)/100 != this.tTo ? '~' : '') + parseInt(this.tTo*100)/100+'s';
	
	if(!svg || !svg.svgElement) { return; }
	var currentTime = svg.svgElement.getCurrentTime();
	
	var pos;
	if(this.tFrom == this.tTo) {
		pos = 1;
	} else {
		pos = (currentTime-this.tFrom)/(this.tTo-this.tFrom);
	}
	
	this.slider.style.left = pos*100+"%";
}

uiTimeline.prototype.eventMouseDown = function(event) {
	anigenManager.classes.timeline.downEvent = event;
}

uiTimeline.prototype.eventMouseClick = function(event) {
	if(!event.target.hasClass('timeline')) { return; }
	var ratio = (event.clientX/window.innerWidth);
	var time = event.target.shepherd.tFrom+(event.target.shepherd.tTo-event.target.shepherd.tFrom)*ratio;
	svg.gotoTime(time);
}

uiTimeline.prototype.eventMouseMove = function(event) {
	if(!this.downEvent) { return; }
	
	var ratio = (event.clientX/window.innerWidth);
	if(ratio > 1) { ratio = 1; }
	
	var time = this.tFrom+(this.tTo-this.tFrom)*ratio;
	
	svg.gotoTime(time);
}









