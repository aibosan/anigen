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

    this.imgLeft = document.createElement("span");
	this.imgLeft.setAttribute("class", "w2ui-tb-image w2ui-icon");
	this.headingText = document.createElement("span");
	
	this.imgRight = document.createElement("span");
	this.imgRight.setAttribute("class", "w2ui-tb-image w2ui-icon icon-ex-white button");
	this.imgRight.shepherd = this;
	this.imgRight.setAttribute('onclick', 'this.shepherd.hide();');
	this.imgRight.setAttribute('title', 'Close window');
	
    this.heading.appendChild(this.imgLeft);
	this.heading.appendChild(this.headingText);
	this.heading.appendChild(this.imgRight);
	
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
	if(this.navbar.children[index]) {
		this.navbar.children[index].style.display = 'none';
		if(this.shown == index) { this.showTab(0); }
	}
}

windowGeneric.prototype.unhideTab = function(index) {
	if(this.navbar.children[index]) {
		this.navbar.children[index].style.display = null;
	}
}


windowGeneric.prototype.setHeading = function(name) {
	if(!name) { return; }
	this.headingText.removeChildren();
	this.headingText.appendChild(document.createTextNode(name));
}

windowGeneric.prototype.setImage = function(name, color) {
	this.imgLeft.addClass('icon-'+name+'-'+color);
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

