/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Group extension providing information for @animationGroup classes
 */
function animationState(elem, name, group) {
	if(!elem) { return; }
	
	if(!elem.isChildOf(svg.defs)) {
		// state does not exist in defs - main element was given and state will be copied to defs
		this.element = elem.cloneNode(true);
		
		if(!(this.element instanceof SVGGElement)) {
			var grp = document.createElementNS(svgNS, 'g');
			grp.appendChild(this.element);
			this.element = grp;
		}
		
		this.element.removeAttribute('transform');
		this.element.consumeTransform();
		this.element.stripId(true);
		this.element.toPath(true);
		
		this.name = name;
		this.group = group;
		
		if(this.group) {
			var children = svg.defs.getElementsByAttribute('anigen:name', this.group);
			
			if(children.length > 0) {
				// group exists - append
				this.groupElement = children[0];
				this.group = this.groupElement.getAttribute('anigen:name');
				this.number = this.groupElement.childElementCount;
				this.element.setAttribute('anigen:number', this.groupElement.childElementCount);
				this.groupElement.appendChild(this.element);
				svg.animationStates[group].push(this);
			} else {
				// group doesn't exist - create
				this.groupElement = document.createElementNS(svgNS, 'g');
				this.groupElement.generateId();
				svg.defs.appendChild(this.groupElement);
				this.groupElement.appendChild(this.element);
				this.groupElement.setAttribute('anigen:name', this.group);
				this.element.setAttribute('anigen:number', 0);
				this.number = 0;
				if(!svg.animationStates) { svg.animationStates = {}; }
				svg.animationStates[group] = [];
				svg.animationStates[group].push(this);
			}
		} else {
			this.groupElement = null;
		}
		this.element.generateId(true);
		
	} else {
		// element from defs
		this.element = elem;
		
		this.groupElement = this.element.parentNode;
		this.group = this.groupElement.getAttribute('anigen:name');
		
		if(!this.group) {
			// generate new group name
			var groups = [];
			for(var i in svg.animationStates) {
				groups.push(i);
			}
			do {
				this.group = "group_" + parseInt(Math.random()*10000);
			} while(groups.indexOf(this.group) != -1)
			this.groupElement.setAttribute('anigen:name', this.group);
		}
		this.number = parseInt(this.element.getAttribute('anigen:number') || this.groupElement.children.length-1);
		this.name = (this.element.getAttribute('anigen:name') || name);
		
		if(!svg.animationStates) { svg.animationStates = {}; }
		if(!svg.animationStates[this.group]) { svg.animationStates[this.group] = []; }
		
		var candidate = svg.animationStates[this.group][this.number];
		if(candidate) { 
			// could be the same thing
			if(candidate.name != this.name || candidate.element.getFingerprint() != this.element.getFingerprint()) {
				// isn't a duplicate - just matches number (add)
				this.number = svg.animationStates[this.group].length;
				svg.animationStates[this.group].push(this);
				svg.animationStates[this.group].sort(function(a,b) { return a.number-b.number; })
			}
		} else {
			svg.animationStates[this.group].push(this);
			svg.animationStates[this.group].sort(function(a,b) { return a.number-b.number; })
		}
	}
	
	this.preview = new imageSVG(this.element, { width: 100, height: 50 });
	
	if(!this.name) { this.name = 'state_'+this.number; }
	this.element.setAttribute('anigen:name', this.name);
	this.element.setAttribute('anigen:type', 'animationState');
	
	this.number = parseInt(this.number);
	
	if(this.groupElement) {
		this.groupElement.setAttribute('anigen:name', this.group);
	}
	this.element.shepherd = this;
	
	var allChildren = this.element.getChildren(true);
	this.children = this.element.getChildren(true);
	
	this.element.setAttribute('anigen:group', this.group);
}

animationState.prototype.getAttribute = function(attribute) {
	var arr = [];
	for(var i = 0; i < this.children.length; i++) {
		arr.push(this.children[i].getAttribute(attribute));
	}
	return arr;
}

animationState.prototype.setNumber = function(number) {
	this.number = number;
	this.element.setAttribute('anigen:number', this.number);
}

animationState.prototype.setName = function(name) {
	if(!name || name.length == 0) { return false; }
	this.name = name;
	this.element.setAttribute('anigen:name', this.name);
	return true;
}

animationState.prototype.destroy = function() {
	var siblings = this.element.parentNode.children;
	for(var i = 0; i < siblings.length; i++) { 
		if(siblings[i].shepherd.number > this.number) {
			siblings[i].shepherd.setNumber(siblings[i].shepherd.number-1);
		}
	}
	this.element.parentNode.removeChild(this.element);
	if(this.groupElement.children.length == 0) {
		this.groupElement.parentNode.removeChild(this.groupElement);
		if(svg.animationStates[this.group]) {
			svg.animationStates[this.group] = null;
			delete svg.animationStates[this.group];
		}
	}
}

animationState.prototype.inbetween = function(other, ratio, name, append) {
	if(ratio == null) { ratio = 0; }
	if(!(other instanceof animationState) || this.group != other.group) { return; }
	
	if(!name) { name = this.name+"-"+other.name+"-"+ratio; }
	
	var clone = this.element.cloneNode(true);
	var candidatesOne = clone.getChildren(true);
	var candidatesTwo = other.element.getChildren(true);
	
	for(var i = 0; i < candidatesOne.length; i++) {
		if(candidatesOne[i] instanceof SVGUseElement) {
			clone.removeChild(candidatesOne[i]);
			continue;
		}
		if(!candidatesTwo[i] || candidatesOne[i].nodeName != candidatesTwo[i].nodeName) {
			return;
		}
		if(typeof candidatesOne[i].inbetween === 'function') {
			candidatesOne[i].setAttribute('d', candidatesOne[i].inbetween(candidatesTwo[i], ratio));
		}
	}
	
	return new animationState(clone, name, (append ? this.group : null));
}

