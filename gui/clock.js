/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		HTML inline clock element
 */
function clock(timeline) {
	this.maxTime = null;
	this.minTime = null;
	
	this.h = 0;
	this.m = 0;
	this.s = 0;
	this.ms = 0;
	
    this.time = 0;
	
	this.timeline = timeline;

    this.container = document.createElement('span');
	this.container.setAttribute('onclick', 'popup.macroClock(anigenManager.classes.editor.clock.container);event.stopPropagation();');
}

clock.prototype.toggle = function() {
	if(this.container.style.display != 'none') {
		this.container.style.display = 'none';
	} else {
		this.container.style.display = null;
	}
}

clock.prototype.set = function(time) {
	this.time = Math.round(time*1000)/1000;
}

clock.prototype.lead = function(value) {
	if(value < 10) { return "0"+value; }
	return value;
}

clock.prototype.leadMS = function(value) {
	if(value < 10) { return "00"+value; }
	if(value < 100) { return "0"+value; }
	return value;
}

clock.prototype.display = function() {
	this.h = this.lead(parseInt(this.time/3600));
	this.m = this.lead(parseInt(this.time/60)%60);
	this.s = this.lead(parseInt(this.time)%60);
	this.ms = this.leadMS(parseInt((this.time - parseInt(this.time))*1000));
	
	if(this.h == 0) {
		this.container.innerHTML = this.m + ":" + this.s + "." + this.ms;
	} else {
		this.container.innerHTML = this.h + ":" + this.m + ":" + this.s + "." + this.ms;
	}
}

clock.prototype.setMax = function(value, force) {
	if(!force && value < this.minTime) { return; }
	if(value <= 0) {
		this.maxTime = null;
		svg.namedView.removeAttribute('anigen:loop', this.maxTime);
		if(this.timeline) { this.timeline.setMax(this.maxTime); }
		return;
	}
	this.maxTime = value;
	svg.namedView.setAttribute('anigen:loop', this.maxTime);
	if(this.timeline) { this.timeline.setMax(this.maxTime); }
}

clock.prototype.setMin = function(value, force) {
	if(!force && value > this.maxTime) { return; }
	if(value <= 0) {
		this.minTime = null;
		svg.namedView.removeAttribute('anigen:loopbegin', this.minTime);
		if(this.timeline) { this.timeline.setMin(this.minTime); }
		return;
	}
	this.minTime = value;
	svg.namedView.setAttribute('anigen:loopbegin', this.minTime);
	if(this.timeline) { this.timeline.setMin(this.minTime); }
}

clock.prototype.update = function() {
	if(this.minTime && svg.svgElement.getCurrentTime() < this.minTime) {
		svg.gotoTime(this.minTime);
	}
	
	if(this.maxTime && svg.svgElement.getCurrentTime() > this.maxTime) {
		svg.gotoTime(this.minTime || 0);
	}
	
	this.time = Math.round(svg.svgElement.getCurrentTime()*1000)/1000;
	
	if(this.timeline) { this.timeline.refresh(); }
	this.display();
}