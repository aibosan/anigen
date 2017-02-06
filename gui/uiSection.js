/**
 *  @author		Ondrej Benda
 *  @date		2017
 *  @copyright	GNU GPLv3
 *	@brief		Resizable UI section.
 */
function uiSection(dimensions, resizable, fills, attributes, manager) {
	if(resizable == true) {
		resizable = [ true, true, true, true ];
	}
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
	if(this.fills[0]) {	// top
		this.setHeight(this.height+this.y);
		this.setY(0);
	}
	if(this.fills[1]) { // right
		this.setWidth(window.innerWidth-this.x);
	}
	if(this.fills[2]) { // bottom
		this.setHeight(window.innerHeight-this.y);
	}
	if(this.fills[3]) {
		this.setWidth(this.width+this.x);
		this.setX(0);
	}
	
	if(this.height + this.y > window.innerHeight) { this.setHeight(window.innerHeight-this.y); }
	if(this.width + this.x > window.innerWidth) { this.setWidth(window.innerWidth-this.x); }
	
}

uiSection.prototype.eventResizerAction = function(event) {
	switch(this.beingResized) {
		case 1:	// top
			var delta = this.y - (event.clientY - 2);
			if(this.height + delta <= 0) { return; }
			this.setY(event.clientY - 2);
			this.setHeight(this.height + delta);
			break;
		case 2:	// right
			this.setWidth(event.clientX - this.x + 2);
			break;
		case 3:	// bottom
			this.setHeight(event.clientY - this.y + 2);
			break;
		case 4:	// left
			var delta = this.x - (event.clientX - 2);
			if(this.width + delta <= 0) { return; }
			this.setX(event.clientX - 2);
			this.setWidth(this.width + delta);
			break;
	}
	if(anigenManager && anigenManager.classes && anigenManager.classes.rulerV) { anigenManager.classes.rulerV.refresh(); }
	this.refresh();
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

