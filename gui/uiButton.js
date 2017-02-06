/**
 *  @author		Ondrej Benda
 *  @date		2011-2017
 *  @copyright	GNU GPLv3
 *	@brief		Generic button
 */
function uiButton(images, actions, titles, flags) {
	if(flags && flags.radio) {
		if(!images || images.length == 0) { images = [ 'radio_button_unchecked', 'radio_button_checked' ]; }
	}
	
	if(!Array.isArray(images)) { images = [ images ]; }
	if(!Array.isArray(actions)) { actions = [ actions ]; }
	if(!Array.isArray(titles)) { titles = [ titles ]; }
	
	this.enabled = true;
	this.state = 0;
	
	this.container = document.createElement('div');
	this.container.setAttribute('class', 'uiButton');
	this.container.shepherd = this;
	
	if(flags) {
		if((flags.radio || flags.toggle) && images.length == 1) {
			images[1] = 0;
			actions[1] = 0;
			titles[1] = 0;
		}
		if(flags.size) {
			this.container.style.fontSize = flags.size;
		}
		if(flags.class) {
			this.container.addClass(flags.class);
		}
		if(flags.state != null) {
			this.state = flags.state;
		}
	
	}
	
	this.toggle = flags && flags.toggle;
	this.radio = flags && flags.radio;
	this.radioChain = null;
	
	this.stateIcons = [];
	
	this.container.addEventListener('click', function(event) { event.target.shepherd.click(); }, false);
	
	for(var i = 0; i < images.length; i++) {
		if(typeof images[i] === 'number') {
			images[i] = images[images[i]];
		}
		if(typeof actions[i] === 'number') {
			actions[i] = actions[actions[i]];
		}
		if(typeof titles[i] === 'number') {
			titles[i] = titles[titles[i]];
		}
		if(images[i] == null) { images[i] = ''; }
		
		var icon = document.createElement('i');
			icon.addClass('material-icons');
		
			icon.appendChild(document.createTextNode(images[i]));
			icon.shepherd = this;
		
		/* something something ligature compatibility
		var code = this.getCode(images[i]);
		if(code) { icon.appendChild(document.createTextNode(code)); }
		*/
		
			if(titles[i]) { icon.setAttribute('title', titles[i]); }
		
		if(i != 0) { icon.style.display = 'none'; }
		this.container.appendChild(icon);
		
		this.stateIcons.push(icon);
		this.container.appendChild(icon);
	}
	
	this.actions = actions;
	
	this.setState(this.state);
	
	return this.container;
}

uiButton.prototype.click = function() {
	if(!this.enabled) { return; }
	if(this.radio && this.state == 1) { return; }
	if(this.actions[this.state]) {
		try {
			eval(this.actions[this.state]);
		} catch(err) {
			console.log(this.actions[this.state]);
			throw err;
		}
	}
	
	this.setState(this.state+1);
}

uiButton.prototype.setState = function(index, caller) {
	if(index >= this.stateIcons.length) { index = 0; }
	if(caller == this) { return; }
	this.state = index;
	
	if(this.toggle) {
		if(this.state == 1) {
			this.container.addClass('selected');
		} else {
			this.container.removeClass('selected');
		}
	}
	
	for(var i = 0; i < this.stateIcons.length; i++) {
		if(i == index) {
			this.stateIcons[i].style.display = null;
			continue;
		}
		this.stateIcons[i].style.display = 'none';
	}
	
	if(this.radio && this.radioChain) {
		this.radioChain.setState(0, caller || this);
	}
}

uiButton.prototype.setRadioChain = function(other) {
	if(!other) { this.radioChain = null; return; }
	if(!(other instanceof uiButton)) { return; }
	this.radioChain = other;
}

uiButton.prototype.setColor = function(color) {
	this.container.style.color = color;
}

uiButton.prototype.enable = function() {
	this.enabled = true;
	this.container.removeClass('disabled');
}

uiButton.prototype.disable = function() {
	this.enabled = false;
	this.container.addClass('disabled');
}

