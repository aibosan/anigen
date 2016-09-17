/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Multistate HTML button
 */
function buttonToggle(actions, icons, initial, hints) {
	if(!initial) { initial = 0; }
	
	this.state = initial;
	
    this.container = document.createElement('div');
	//this.container.setAttribute('onclick', 'this.shepherd.toggle();')
	
	for(var i = 0; i < icons.length; i++) {
		var child = new icon(icons[i]);
		
		/*
		var icon = document.createElement("span");
		icon.setAttribute("class", "w2ui-tb-image w2ui-icon floatLeft");
		icon.addClass(icons[i]);
		*/
		
		child.img.setAttribute('class', 'button');
		if(hints && hints[i]) {
			child.img.setAttribute('title', hints[i]);
		}
		if(actions[i]) {
			child.img.setAttribute("onclick", actions[i] + 'this.parentNode.shepherd.toggle();');
		} else {
			child.img.setAttribute("onclick", 'this.parentNode.shepherd.toggle();');
		}
		if(initial != i) {
			child.img.style.display = 'none';
		}
		this.container.appendChild(child.img);
	}
	
	this.container.shepherd = this;
	
	
	this.toggle = function() {
		if(this.state+1 >= this.container.children.length) {
			this.state = 0;
		} else {
			this.state++;
		}
		for(var i = 0; i < this.container.children.length; i++) {
			if(this.state == i) {
				this.container.children[i].style.display = null;
			} else {
				this.container.children[i].style.display = 'none';
			}
		}
	}
	
	this.setState = function(value) {
		if(value < 0 || value >= this.container.children.length) { return; }
		this.state = value;
		
		for(var i = 0; i < this.container.children.length; i++) {
			if(this.state == i) {
				this.container.children[i].style.display = null;
			} else {
				this.container.children[i].style.display = 'none';
			}
		}
	}
}