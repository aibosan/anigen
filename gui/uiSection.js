/**
 *  @author		Ondrej Benda
 *  @date		2017
 *  @copyright	GNU GPLv3
 *	@brief		Resizable UI section.
 */
function uiSection(dimensions, resizable, fills, attributes, manager, actionResize) {
	if(resizable == true) {
		resizable = [ true, true, true, true ];
	}
	
	this.actionResize = actionResize;
	
	if(!resizable) {
		resizable = [ false, false, false, false ];
	}
	
	if(fills == true) {
		fills = [ true, true, true, true ];
	}
	if(!fills) {
		fills = [ false, false, false, false ];
	}
	dimensions = dimensions || [ 0, 0, 0, 0 ];
	
	this.x = dimensions[0] || 0;
	this.y = dimensions[1] || 0;
	this.width = dimensions[2] || 0;
	this.height = dimensions[3] || 0;
	
	this.fills = fills;
	
	this.limits = [];
	this.slacks = [ 0, 0, 0, 0 ];
	
	this.beingResized = null;
	this.lastEvent = null;
	
	this.container = document.createElement('div');
	this.container.addClass('uiSection');
	
	for(var i in attributes) {
		if(i == 'class') { 
			this.container.addClass(attributes[i]);
			continue;
		}
		this.container.setAttribute(i, attributes[i]);
	}
	
	this.container.style.left = this.x+'px';
	this.container.style.top = this.y+'px';
	this.container.style.width = this.width+'px';
	this.container.style.height = this.height+'px';
	
	
	this.content = document.createElement('div');
	this.container.appendChild(this.content);
	
	// resizers
	this.resizers = {
		'top': document.createElement('div'),
		'right': document.createElement('div'),
		'bottom': document.createElement('div'),
		'left': document.createElement('div')
	};
	this.resizers.top.setAttribute('class', 'resizer top');
	this.resizers.right.setAttribute('class', 'resizer right');
	this.resizers.bottom.setAttribute('class', 'resizer bottom');
	this.resizers.left.setAttribute('class', 'resizer left');
	
	if(!resizable[0]) { this.resizers.top.addClass('disabled'); }
	if(!resizable[1]) { this.resizers.right.addClass('disabled'); }
	if(!resizable[2]) { this.resizers.bottom.addClass('disabled'); }
	if(!resizable[3]) { this.resizers.left.addClass('disabled'); }
	
	this.container.appendChild(this.resizers.top);
	this.container.appendChild(this.resizers.right);
	this.container.appendChild(this.resizers.bottom);
	this.container.appendChild(this.resizers.left);
	
	if(manager && typeof manager.register === 'function') {
		manager.register(this);
	} else {
		this.resizers.top.addClass('disabled');
		this.resizers.right.addClass('disabled');
		this.resizers.bottom.addClass('disabled');
		this.resizers.left.addClass('disabled');
	}
	
	this.refresh();
	
	this.container.shepherd = this;
	return this;
}

uiSection.prototype.refresh = function() {
	if(this.fills[0]) {	// stretch up
		var min = 0;
		if(this.limits[0] instanceof uiSection && !this.limits[0].isHidden()) { 
			min = this.limits[0].container.offsetTop + this.limits[0].container.offsetHeight + this.slacks[0];
		}
		if(typeof this.limits[0] === 'number') { min = this.limits[0] + this.slacks[0]; }
		
		this.setHeight(this.height+this.y-min);
		this.setY(min);
	}
	if(this.fills[1]) { // stretch right
		var max = window.innerWidth;
		if(this.limits[1] instanceof uiSection && !this.limits[1].isHidden()) {
			max = this.limits[1].container.offsetLeft - this.slacks[1];
		}
		if(typeof this.limits[1] === 'number') { max = this.limits[1] - this.slacks[1]; }
		
		this.setWidth(max-this.x);
	}
	if(this.fills[2]) { // stretch down
		var max = window.innerHeight;
		if(this.limits[2] instanceof uiSection && !this.limits[2].isHidden()) {
			max = this.limits[2].container.offsetTop - this.slacks[2];
		}
		if(typeof this.limits[2] === 'number') { max = this.limits[2] - this.slacks[2]; }
		
		
		this.setHeight(max-this.y);
	}
	if(this.fills[3]) {	// stretch left
		var min = 0;
		if(this.limits[3] instanceof uiSection && !this.limits[3].isHidden()) {
			min = this.limits[3].container.offsetLeft + this.limits[3].container.offsetWidth + this.slacks[3];
		}
		if(typeof this.limits[3] === 'number') { min = this.limits[3] + this.slacks[3]; }
		
		this.setWidth(this.width+this.x-min);
		this.setX(min);
	}
	
	if(this.height + this.y > window.innerHeight) { this.setHeight(window.innerHeight-this.y); }
	if(this.width + this.x > window.innerWidth) { this.setWidth(window.innerWidth-this.x); }
	
}

uiSection.prototype.eventResizerAction = function(event) {
	switch(this.beingResized) {
		case 1:	// resizing up
			var desired = (event.clientY - 2);
			var available = desired;
			if(this.limits[0] instanceof uiSection && !this.limits[0].isHidden()) {
				available = this.limits[0].container.offsetTop+this.limits[0].container.offsetHeight+this.slacks[0];
			}
			if(typeof this.limits[0] === 'number') { available = this.limits[0]+this.slacks[0]; }
			desired = available > desired ? available : desired;
			if(desired < 6) { desired = 6; }
			if(desired > window.innerHeight-6) { desired = window.innerHeight-6; }
			var delta = this.y - desired;
			if(this.height + delta <= 0) { return; }
			this.setY(desired);
			this.setHeight(this.width + delta);
			
			break;
		case 2:	// resizing right
			var desired = event.clientX - this.x + 2;
			var available = desired;
			if(this.limits[1] instanceof uiSection && !this.limits[1].isHidden()) {
				available = this.limits[1].container.offsetLeft-this.slacks[1];
			}
			if(typeof this.limits[1] === 'number') { available = this.limits[1]-this.slacks[1]; }
			desired = available < desired ? available : desired;
			if(desired < 6) { desired = 6; }
			if(desired-this.x > window.innerWidth-6) { desired = window.innerWidth-6; }
			this.setWidth(desired);
			break;
		case 3:	// resizing down
			var desired = event.clientY - this.y + 2;
			var available = desired;
			if(this.limits[2] instanceof uiSection && !this.limits[2].isHidden()) {
				available = this.limits[2].container.offsetTop-this.slacks[2];
			}
			if(typeof this.limits[2] === 'number') { available = this.limits[2]-this.slacks[2]; }
			desired = available < desired ? available : desired;
			this.setHeight(desired);
			break;
		case 4:	// resizing left
			var desired = (event.clientX - 2);
			var available = desired;
			if(this.limits[3] instanceof uiSection && !this.limits[3].isHidden()) {
				available = this.limits[3].container.offsetLeft+this.limits[3].container.offsetWidth+this.slacks[3];
			}
			if(typeof this.limits[3] === 'number') { available = this.limits[3]+this.slacks[3]; }
			desired = available > desired ? available : desired;
			if(desired < 6) { desired = 6; }
			if(desired > window.innerWidth-6) { desired = window.innerWidth-6; }
			
			var delta = this.x - desired;
			if(this.width + delta <= 0) { return; }
			this.setX(desired);
			this.setWidth(this.width + delta);
			break;
	}
	if(anigenManager && anigenManager.classes && anigenManager.classes.rulerV) { anigenManager.classes.rulerV.refresh(); }
	this.refresh();
	if(this.actionResize) { eval(this.actionResize); }
}

uiSection.prototype.setLimits = function(array) {
	if(array == null) {
		this.limits = [];
		return;
	}
	if(!Array.isArray(array) || array.length != 4) { return; }
	
	for(var i = 0; i < array.length; i++) {
		if(array[i] != null) { this.limits[i] = array[i]; }
	}
}

uiSection.prototype.setSlacks = function(array) {
	if(array == null) {
		this.slacks = [ 0, 0, 0, 0];
		return;
	}
	if(!Array.isArray(array) || array.length != 4) { return; }
	
	for(var i = 0; i < array.length; i++) {
		if(array[i] != null) { this.slacks[i] = array[i]; }
	}
}

uiSection.prototype.setX = function(value) {
	if(value == null) { return; }
	this.x = value;
	this.container.style.left = this.x+'px';
}

uiSection.prototype.setY = function(value) {
	if(value == null) { return; }
	this.y = value;
	this.container.style.top = this.y+'px';
}

uiSection.prototype.setWidth = function(value) {
	if(value == null) { return; }
	
	this.width = value;
	this.container.style.width = this.width+'px';
}

uiSection.prototype.setHeight = function(value) {
	if(value == null) { return; }
	this.height = value;
	this.container.style.height = this.height+'px';
}

uiSection.prototype.push = function(element) {
	this.content.appendChild(element);
}

uiSection.prototype.clear = function() {
	this.content.removeChildren();
}

uiSection.prototype.hide = function() {
	this.container.addClass('hidden');
}

uiSection.prototype.show = function() {
	this.container.removeClass('hidden');
}

uiSection.prototype.toggle = function() {
	if(this.container.hasClass('hidden')) {
		this.show();
	} else {
		this.hide();
	}
}

uiSection.prototype.isHidden = function() {
	return this.container.hasClass('hidden');
}



