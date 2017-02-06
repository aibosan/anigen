/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		"Abstract" class for other windows (@windowLayers, @windowAnimation)
 */
function windowGeneric(settingName) {
	this.settingName = settingName;
	
    this.container = document.createElement("div");
    this.container.setAttribute('class', 'window');
	this.container.shepherd = this;
	
    this.heading = document.createElement('h1');
	
	this.container.addEventListener('mouseover', anigenActual.eventMouseOver, false);
	
	this.imgLeft = new uiButton('clear', null, null, { 'class': 'icon' }).shepherd;
	
	this.headingText = document.createElement('span');
	
	this.imgRight = new uiButton('close', 'this.shepherd.hide();', 'Close window');
	this.imgRight.style.float = 'right';
	this.imgRight = this.imgRight.shepherd;
	
    this.heading.appendChild(this.imgLeft.container);
	this.heading.appendChild(this.headingText);
	this.heading.appendChild(this.imgRight.container);
	
    this.container.appendChild(this.heading);

	this.navbar = document.createElement("ul");
	this.navbar.setAttribute('class', 'navbar hidden');
	this.container.appendChild(this.navbar);
	
    this.content = document.createElement("div");
    this.container.appendChild(this.content);
	
	this.footer = document.createElement("div");
	this.footer.setAttribute('class', 'footer');
	this.container.appendChild(this.footer);
}

windowGeneric.prototype.addTab = function(name) {
	var newTab = document.createElement("div");
	if(this.navbar.children.length == 0) {
		newTab.setAttribute('class', 'tab');
	} else {
		newTab.setAttribute('class', 'tab hidden');
	}
	this.content.appendChild(newTab);
	var navButton = document.createElement('li');
	var navLink = document.createElement('a');
	navLink.setAttribute('href', '#');
	navLink.setAttribute('onclick', 'this.shepherd.showTab('+this.navbar.children.length+');');
	navLink.shepherd = this;
	navLink.appendChild(document.createTextNode(name));
	navButton.appendChild(navLink);
	this.navbar.appendChild(navButton);
	if(this.navbar.children.length > 1) {
		this.navbar.removeClass('hidden');
	} else {
		this.navbar.children[0].addClass('active');
	}
	return newTab;
}

windowGeneric.prototype.removeTab = function(index) {
	if(this.content.children[index] && this.navbar.children[index]) {
		this.content.removeChild(this.content.children[index]);
		this.navbar.removeChild(this.navbar.children[index]);
	}
}

windowGeneric.prototype.showTab = function(index) {
	if(this.content.children[index] && this.navbar.children[index]) {
		this.shown = index;
		for(var i = 0; i < this.content.children.length; i++) {
			this.content.children[i].addClass('hidden');
			this.navbar.children[i].removeClass('active');
		}
		this.navbar.children[index].addClass('active');
		this.content.children[index].removeClass('hidden');
	}
}

windowGeneric.prototype.hideTab = function(index) {
	var showOther = false;
	if(this.navbar.children[index]) {
		this.navbar.children[index].style.display = 'none';
		if(this.shown == index) { showOther = true; }
	}
	var count = 0;
	for(var i = 0; i < this.navbar.children.length; i++) {
		if(this.navbar.children[i].style.display != 'none') {
			count++;
			if(showOther) { this.showTab(i); showOther = false; }
		}
	}
	if(count <= 1) {
		this.navbar.style.display = 'none';
	}
	
}

windowGeneric.prototype.unhideTab = function(index) {
	if(this.navbar.children[index]) {
		this.navbar.children[index].style.display = null;
	}
	var count = 0;
	for(var i = 0; i < this.navbar.children.length; i++) {
		if(this.navbar.children[i].style.display != 'none') { count++; }
	}
	if(count > 1) {
		this.navbar.style.display = null;
	}
}

windowGeneric.prototype.renameTab = function(index, name) {
	if(index >= this.navbar.children.length) { return; }
	this.navbar.children[index].children[0].removeChildren();
	this.navbar.children[index].children[0].appendChild(document.createTextNode(name));
}


windowGeneric.prototype.setHeading = function(name) {
	if(!name) { return; }
	this.headingText.removeChildren();
	this.headingText.appendChild(document.createTextNode(name));
}

windowGeneric.prototype.setImage = function(name, color) {
	this.imgLeft.stateIcons[0].removeChildren();
	this.imgLeft.stateIcons[0].appendChild(document.createTextNode(name));
	if(color) { this.imgLeft.setColor(color); }
}

windowGeneric.prototype.show = function() {
	this.container.removeClass('hidden');
	anigenActual.checkWindows();
	if(this.settingName) { anigenActual.settings.set(this.settingName, true); }
}

windowGeneric.prototype.hide = function() {
	this.container.addClass('hidden');
	anigenActual.checkWindows();
	if(this.settingName) { anigenActual.settings.set(this.settingName, false); }
}

windowGeneric.prototype.isHidden = function() {
	return this.container.hasClass('hidden');
}

windowGeneric.prototype.toggle = function() {
	if(this.isHidden()) {
		this.show();
	} else {
		this.hide();
	}
}

