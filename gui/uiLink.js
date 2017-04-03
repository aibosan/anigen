/**
 *  @author		Ondrej Benda
 *  @date		2011-2017
 *  @copyright	GNU GPLv3
 *	@brief		UI link with icon and text
 */
function uiLink(icon, action, text, attributes) {
	this.container = document.createElement('span');
	this.container.setAttribute('class', 'uiLink');
	
	attributes = attributes || {};
	
	if(icon) {
		this.button = new uiButton(icon, null, null, { 'class': 'icon', 'state': attributes.state || 0 });
		this.container.appendChild(this.button);
	}
	if(text) {
		this.container.appendChild(document.createTextNode(text));
	} else {
		this.container.style.padding = '1px';
	}
	
	this.container.addEventListener('click', function(event) {
		if(event.target.shepherd != this.button.shepherd) {
			this.button.shepherd.click();
		}
	}.bind(this), false);
	
	this.container.setAttribute('onclick', action);
	
	for(var i in attributes) {
		if(i == 'state') { continue; }
		if(i == 'class') {
			this.container.addClass(attributes[i]);
		} else {
			this.container.setAttribute(i, attributes[i]);
		}
	}
	
	this.container.shepherd = this;
	
	return this.container;
}

uiLink.prototype.getState = function() {
	return this.button.shepherd.state;
}

uiLink.prototype.setState = function(value) {
	return this.button.shepherd.setState(value);
}

