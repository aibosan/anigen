/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for generic element
 */
 
Element.prototype.removeChildren = function() {
    /*this.innerHTML = '';*/
    while(this.firstChild) {
        this.removeChild(this.firstChild);
    }
}

Element.prototype.getElementsByTagName = function(tag, deep, lenient) {
    var response = new Array();
    var children = this.children;
    for(var i = 0; i < children.length; i++) {
        if(!lenient && children[i].tagName.toLowerCase() == tag.toLowerCase() || lenient && children[i].tagName.toLowerCase().match(tag) != null) {
            response[response.length] = children[i];
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

Element.prototype.getElementsByAttribute = function(attribute, value, deep) {
    var response = new Array();
    var children = this.children;
    for(var i = 0; i < children.length; i++) {
        if(children[i].getAttribute(attribute) != null) {
            if((value != null && children[i].getAttribute(attribute) == value) || value == null) {
                response[response.length] = children[i];
            }
        }
        if(deep) {
            response = response.concat(children[i].getElementsByAttribute(attribute, value, deep));
        }
    }
    return response;
}

Element.prototype.generateId = function(deep) {
	var oldId = this.getAttribute('id');
	
    if((oldId != null && oldId.length != 0 && document.getElementById(oldId) != this) || 
		oldId == null || oldId.length == 0) {
		
		this.removeAttribute('id');
		var newId;
		do {
			newId = this.tagName + "" + parseInt(Math.random()*10000);
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
    if( this.nodeName.toLowerCase() == 'animate' ||
        this.nodeName.toLowerCase() == 'animatetransform' ||
        this.nodeName.toLowerCase() == 'animatemotion' ||
        this.nodeName.toLowerCase() == 'animateColor') { return true; } else { return false; }
}

Element.prototype.hasAnimation = function() {
    if (this.getElementsByTagName('animate', false, true).length > 0) {
        return true;
    } else {
        return false;
    }
}

Element.prototype.isChildOf = function(element) {
    var node = this;
	node = node.parentNode;
    while(node != null) {
        if(node == element) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

Element.prototype.addClass = function(name) {
	this.classList.add(name);
}

Element.prototype.removeClass = function(name) {
	this.classList.remove(name);
}

Element.prototype.hasClass = function(name) {
	for(var i = 0; i < this.classList.length; i++) {
		if(this.classList[i] == name) { return true; }
	}
	return false;
}


