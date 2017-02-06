/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Editor's main menu
 */
function menu() {
	this.container = document.createElement('div');
	this.container.setAttribute('class', 'menu');
	
	this.selected = null;
	this.container.appendChild(build.button('File', { 'onclick': 'anigenManager.classes.menu.eventClick(this, 1);', 'onmouseover': 'anigenManager.classes.menu.eventMouseover(this, 1);', 'class': 'menu' } ));
	this.container.appendChild(build.button('Edit', { 'onclick': 'anigenManager.classes.menu.eventClick(this, 2);', 'onmouseover': 'anigenManager.classes.menu.eventMouseover(this, 2);', 'class': 'menu' } ));
	this.container.appendChild(build.button('Object', { 'onclick': 'anigenManager.classes.menu.eventClick(this, 3);', 'onmouseover': 'anigenManager.classes.menu.eventMouseover(this, 3);', 'class': 'menu' } ));
	this.container.appendChild(build.button('Animation', { 'onclick': 'anigenManager.classes.menu.eventClick(this, 4);', 'onmouseover': 'anigenManager.classes.menu.eventMouseover(this, 4);', 'class': 'menu' } ));
	this.container.appendChild(build.button('Help', { 'onclick': 'anigenManager.classes.menu.eventClick(this, 5);', 'onmouseover': 'anigenManager.classes.menu.eventMouseover(this, 5);', 'class': 'menu' } ));
	
	this.container.addEventListener("click", function(event) { 
		event.preventDefault ? event.preventDefault() : event.returnValue = false;
		event.stopPropagation ? event.stopPropagation() : window.event.cancelBubble = true;
	}, false);
}

menu.prototype.refresh = function() {
	for(var i = 0; i < this.container.children.length; i++) {
		this.container.children[i].removeClass("selected");
	}
	this.selected = null;
}

menu.prototype.eventClick = function(target, index) {
	if(target.hasClass('selected')) {
		target.removeClass('selected');
		popup.hide();
		this.selected = null;
		return;
	}
	popup.hide();
	this.refresh();
	target.addClass('selected');
	this.selected = index;
	switch(index) {
		case 1: popup.macroMenuFile(target); break;
		case 2: popup.macroMenuEdit(target); break;
		case 3: popup.macroMenuObject(target); break;
		case 4: popup.macroMenuAnimation(target); break;
		case 5: popup.macroMenuHelp(target); break;
	}
}

menu.prototype.eventMouseover = function(target, index) {
	if(this.selected == null || this.selected == index) { return; }
	this.eventClick(target, index);
}
