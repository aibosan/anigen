/**
 *  @author		Ondrej Benda
 *  @date		2011-2017
 *  @copyright	GNU GPLv3
 *	@brief		UI link with icon and text
 */
function uiLink(icon, action, text, attributes) {
	this.container = document.createElement('span');
	this.container.setAttribute('class', 'uiLink');
	
	if(icon) {
		this.container.appendChild(new uiButton(icon, null, null, { 'class': 'icon' }));
	}
	this.container.appendChild(document.createTextNode(text));
	this.container.setAttribute('onclick', action);
	
	for(var i in attributes) {
		if(i == 'class') {
			this.container.addClass(attributes[i]);
		} else {
			this.container.setAttribute(i, attributes[i]);
		}
	}
	
	return this.container;
}

