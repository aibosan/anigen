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
	
	var icon = "default", group = false, name = element.getAttribute('id');
	switch(element.nodeName.toLowerCase()) {
		case "animate":
		case "animatemotion":
		case "animatetransform":
		case "animatecolor":
			icon = "animation";
			break;
		case "svg":
		case "g":
			group = true;
			if (element.getAttribute("inkscape:groupmode") == "layer") {
				icon = "layers";
				name = element.getAttribute("inkscape:label");
			}
			break;
		default:
			icon = "other";
			break;
	}
	this.li = document.createElement("li");
	var nodeName = document.createElement("span");
        nodeName.appendChild(document.createTextNode("<"+element.nodeName.toLowerCase()+">"));
        nodeName.setAttribute("class", "nodeName");
	
	if(group || element.children.length > 0) {
		// branch
		var label = document.createElement("label");
		var input = document.createElement("input");

		label.setAttribute("for", "anigenTree_"+element.getAttribute('id'));
		label.appendChild(document.createTextNode(name));
		if(element.children.length > 0) {
			label.setAttribute("class", icon);
		} else {
			label.setAttribute("class", icon+"-black");
		}
		label.appendChild(nodeName);

		label.setAttributeNS(anigenNS, "originalid", element.getAttribute('id'));
		label.ondblclick = tree.handle;
		label.setAttribute("title", "Double-click to select");

		input.setAttribute("type", "checkbox");
		input.setAttribute("id", "anigenTree_"+element.getAttribute('id'));

		this.li.appendChild(label);
		this.li.appendChild(input);

		this.checkbox = input;
		
		this.representative = label;
		this.container = document.createElement('ul');
		this.li.appendChild(this.container);
	} else {
		// leaf
		var span = document.createElement("span");
			span.setAttribute("class", icon);
			span.setAttribute("id", "anigenTree_"+element.getAttribute('id'));
			span.setAttributeNS(anigenNS, "originalid", element.getAttribute('id'));
			span.appendChild(document.createTextNode(name));
			span.onclick = tree.handle;
			span.setAttribute("title", "Click to select");

		this.li.appendChild(span);
		this.li.setAttribute("class", "leaf");
		this.li.appendChild(nodeName);
		
		this.representative = this.li;
		this.container = null;
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

treeNode.prototype.collapse = function(deep) {
	if(this.checkbox != null && this.checkbox.checked) { this.checkbox.click(); }
	if(deep) {
		for(var i = 0; i < this.children.length; i++) {
			this.children[i].collapse(deep);
		}
	}
}

treeNode.prototype.spread = function() {
	if(this.checkbox != null && !this.checkbox.checked) {
		this.checkbox.click();
	}
}