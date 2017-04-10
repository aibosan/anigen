/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for generic element
 */
 
Element.prototype.removeChildren = function(conditional, deep) {
	if(!conditional) {
		while(this.firstChild) {
			this.removeChild(this.firstChild);
		}
		return;
	}
	
	for(var i = 0; i < this.children.length; i++) {
		if(!this.children[i].parentNode) { continue; }
		
		if(conditional.bind(this.children[i])()) {
			this.children[i].parentNode.removeChild(this.children[i]);
			i--;
		}
	}
	
	if(deep) {
		for(var i = 0; i < this.children.length; i++) {
			this.children[i].removeChildren(conditional, deep);
		}
	}
}

Element.prototype.getElementsByTagName = function(tag, deep, lenient) {
    var response = new Array();
	tag = tag || '';
    var children = this.children;
    for(var i = 0; i < children.length; i++) {
        if(!lenient && children[i].tagName.toLowerCase() == tag.toLowerCase() || lenient && children[i].tagName.toLowerCase().match(tag) != null) {
            response.push(children[i]);
        }
        if(deep) {
            response = response.concat(children[i].getElementsByTagName(tag, deep, lenient));
        }
    }
    return response;
}

Element.prototype.getChildren = function(deep) {
	var response = [].slice.call(this.children);
    if(deep) {
		for(var i = 0; i < this.children.length; i++) {
			response = response.concat(this.children[i].getChildren(deep));
		}
	}
    return response;
}

Element.prototype.getElementsByAttribute = function(attribute, value, deep, lenient) {
    var response = new Array();
    var children = this.children;
    for(var i = 0; i < children.length; i++) {
		if(!attribute) {
			for(var j in children[i].attributes) {
				if((children[i].attributes[j].name && children[i].attributes[j].value) && ((lenient && children[i].attributes[j].value.match(value)) || children[i].attributes[j].value == value)) {
					response[response.length] = children[i];
					break;
				}
			}
		}
        if(children[i].getAttribute(attribute) != null) {
            if((lenient && children[i].getAttribute(attribute)) || (value != null && children[i].getAttribute(attribute) == value) || value == null) {
                response[response.length] = children[i];
            }
        }
        if(deep) {
            response = response.concat(children[i].getElementsByAttribute(attribute, value, deep));
        }
    }
    return response;
}

Element.prototype.generateId = function(deep, name) {
	var oldId = this.getAttribute('id');
	
    if((oldId != null && oldId.length != 0 && document.getElementById(oldId) != this) || 
		oldId == null || oldId.length == 0) {
		
		this.removeAttribute('id');
		var newId;
		do {
			if(name) {
				newId = name + "" + parseInt(Math.random()*10000);
			} else {
				newId = this.tagName + "" + parseInt(Math.random()*10000);
			}
		} while(document.getElementById(newId) != null)
		this.setAttribute('id', newId);
	}
	
	if(deep) {
		var children = this.children;
		for(var i = 0; i < children.length; i++) {
			children[i].generateId(deep);
		}
	}
}

Element.prototype.stripId = function(deep) {
	this.removeAttribute('id');
	if(deep) {
		var children = this.children;
		for(var i = 0; i < children.length; i++) {
			children[i].stripId(deep);
		}
	}
}

Element.prototype.isAnimation = function() {
	return this instanceof SVGAnimationElement;
}

Element.prototype.hasAnimation = function(onlyViable) {
	for(var i = 0; i < this.children.length; i++) {
		if(this.children[i] instanceof SVGAnimationElement &&
			(!onlyViable || (onlyViable && !this.children[i].getAttribute('anigen:lock')))
		) { return true;}
	}
	return false;
}

Element.prototype.isChildOf = function(element, inclusive) {
    var node = this;
	if(!inclusive) { node = node.parentNode; }
    while(node != null) {
        if(node == element) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

Element.prototype.addClass = function(name) {
	if(!name) { return; }
	name = name.split(' ');
	for(var i = 0; i < name.length; i++) {
		this.classList.add(name[i]);
	}
}

Element.prototype.removeClass = function(name) {
	if(!name) { return; }
	name = name.split(' ');
	for(var i = 0; i < name.length; i++) {
		this.classList.remove(name);
	}
}

Element.prototype.hasClass = function(name) {
	for(var i = 0; i < this.classList.length; i++) {
		if(this.classList[i] == name) { return true; }
	}
	return false;
}

/** Rips element from document to clone it in a state not affected by animations 
 *  Leads to a bit of flicker, so use with care.
 */
Element.prototype.cloneNodeStatic = function(deep) {
	var par = this.parentNode;
	var nex = this.nextElementSibling;
	
	if(!par) { return this.cloneNode(deep); }
	
	par.removeChild(this);
	var clone = this.cloneNode(deep);
	if(nex) {
		par.insertBefore(this, nex);
	} else {
		par.appendChild(this);
	}
	return clone;
}

