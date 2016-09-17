/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Generic single-state button
 */
function button(icon, action, title) {
    this.container = document.createElement('div');
	
	var img = document.createElement('div');
	img.setAttribute("class", "w2ui-tb-image w2ui-icon");
	img.addClass(icon);
	
	this.container.appendChild(img);
	this.container.setAttribute('class', 'button');
	
	if(action) { this.container.setAttribute('onclick', action); }
	if(title) { this.container.setAttribute('title', title); }
	
	this.container.shepherd = this;
	return this.container;
}
