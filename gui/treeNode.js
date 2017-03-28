/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Node of an XML tree
 */
function treeNode(element) {
    this.parentNode = null;
    this.children = [];
    this.checkbox = null;
	this.container = null;
	this.representative = null;
	
    this.element = element;
	if(!element) { return; }
	
	if(this.element.getAttribute('id') == null) { this.element.generateId(); }
	
	var icon = anigenActual.getNodeIcon(element);
	
	var validChildren = false;
	for(var i = 0; i < this.element.children.length; i++) {
		if(this.element.children[i].getAttribute('anigen:lock')) {
			continue;
		} else {
			validChildren = true;
			break;
		}
	}
		
	var group = false, name = element.getAttribute('id');
	
	if(element.getAttribute("inkscape:label")) {
		name = element.getAttribute("inkscape:label")+'#'+name;
	}
	if(element.getAttribute("anigen:name")) {
		name = element.getAttribute("anigen:name")+'#'+name;
	}
	
	
	this.li = document.createElement("li");
	var nodeName = document.createElement("span");
        nodeName.appendChild(document.createTextNode("<"+element.nodeName.toLowerCase()+">"));
        nodeName.setAttribute("class", "nodeName");
	
	var info = anigenActual.getNodeDescription(element);
	if(info) {	nodeName.setAttribute('title', info);	}
	
	var picture = new uiButton(icon, 'svg.select("'+element.getAttribute('id')+'");', 'Click to select', { "class": "md-18" });
	
	if(validChildren) {
		// branch
		var label = document.createElement("span");
		
		var input = new uiButton([ 'chevron_right', 'expand_more' ], [
			'this.container.parentNode.addClass("checked");this.container.parentNode.shepherd.bloom();anigenManager.classes.tree.fitScroll(this.container.parentNode.shepherd);',
			'this.container.parentNode.removeClass("checked");this.container.parentNode.shepherd.bloom();'
		], [ 'Expand', 'Condense' ], { 'class': 'md-18' }).shepherd;
		
		if(name.indexOf('#') >= 0) {
			var part1span = document.createElement('span');
			var part2span = document.createElement('span');
			part2span.setAttribute('class', 'nodeName');
			
			part1span.appendChild(document.createTextNode(name.substr(0, name.indexOf('#'))));
			part2span.appendChild(document.createTextNode(name.substr(name.indexOf('#'))));
			
			label.appendChild(part1span);
			label.appendChild(part2span);
		} else {
			label.appendChild(document.createTextNode(name));
		}
		
		label.setAttributeNS(anigenNS, "originalid", element.getAttribute('id'));
		label.ondblclick = anigenManager.classes.tree.handleSelect;
		label.onclick = anigenManager.classes.tree.handleToggle;
		label.shepherd = this;
		label.setAttribute("title", "Double-click to select");

		this.li.appendChild(input.container);
		this.li.appendChild(picture);
		this.li.appendChild(label);
		this.li.appendChild(nodeName);
		
		this.checkbox = input;
		
		this.representative = label;
		this.container = document.createElement('ul');
		this.li.shepherd = this;
		this.li.appendChild(this.container);
	} else {
		// leaf
		
		var blank = new uiButton(null, null, null, { 'class': 'icon md-18' });
		
		
		
		var span = document.createElement("span");
			
		if(name.indexOf('#') >= 0) {
			var part1span = document.createElement('span');
			var part2span = document.createElement('span');
			part2span.setAttribute('class', 'nodeName');
			
			part1span.appendChild(document.createTextNode(name.substr(0, name.indexOf('#'))));
			part2span.appendChild(document.createTextNode(name.substr(name.indexOf('#'))));
			
			span.appendChild(part1span);
			span.appendChild(part2span);
		} else {
			span.appendChild(document.createTextNode(name));
		}
			
			span.setAttributeNS(anigenNS, 'originalid', element.getAttribute('id'));
			span.onclick = anigenManager.classes.tree.handleSelect;
			span.setAttribute("title", "Click to select");

		this.li.setAttribute("class", "leaf");
		
		this.li.appendChild(blank);
		this.li.appendChild(picture);
		this.li.appendChild(span);
		this.li.appendChild(nodeName);
		
		this.representative = this.li;
		this.container = null;
	}
	
}

treeNode.prototype.bloom = function(force) {
	if(!this.element || !(this.element instanceof SVGElement)) { return; }
	if(this.children.length > 0 && !force) { return; }
	if(force) { this.clear(); }
	var valid = this.element.getViableChildren();
	for(var i = 0; i < valid.length; i++) {
		this.append(new treeNode(valid[i]));
	}
}

treeNode.prototype.findNode = function(svgNode) {
	if(!svgNode || !(svgNode instanceof SVGElement)) { return; }
	for(var i = 0; i < this.children.length; i++) {
		if(this.children[i].element == svgNode) { return this.children[i]; }
	}
}

treeNode.prototype.setSelected = function(value) {
	if(value) {
		this.representative.addClass('selected');
	} else {
		this.representative.removeClass('selected');
	}
}

treeNode.prototype.append = function(newNode) {
	if(!(newNode instanceof treeNode)) { return; }
	this.children.push(newNode);
	newNode.parentNode = this;
	if(this.container) {
		this.container.appendChild(newNode.li);
	}
}

treeNode.prototype.clear = function() {
	this.children = [];
	if(this.container) {
		this.container.removeChildren();
	}
}

treeNode.prototype.isSpread = function() {
	if(this.checkbox != null && this.checkbox.state == 1) { return true; }
	if(this.representative.hasClass('selected')) { return true; }
	return false;
}

treeNode.prototype.collapse = function(deep) {
	var was = this.isSpread();
	if(this.checkbox != null && this.checkbox.state == 1) {
		this.checkbox.click();
	}
	if(!this.checkbox) {
		this.setSelected(false);
	}
	if(was && deep) {
		for(var i = 0; i < this.children.length; i++) {
			this.children[i].collapse(deep);
		}
	}
}

treeNode.prototype.spread = function() {
	if(this.checkbox != null && this.checkbox.state != 1) {
		this.bloom();
		this.checkbox.click();
	}
	if(!this.checkbox) {
		this.setSelected(true);
	}
}

treeNode.prototype.toggle = function() {
	if(this.checkbox != null && this.checkbox.state == 1) {
		this.collapse();
	} else {
		this.spread();
	}
}