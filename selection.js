/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Container class for multiselect
 *	@warning	Unfinished and not used as of right now
 */
function selection() {
	this.elements = [];
	
}

// removes all elements from selection
selection.prototype.clear = function() {
	this.elements = [];
}

// throws DOMException if index is out of bounds
// returns item at index
selection.prototype.get = function(index) {
	if(index < 0 || index >= this.elements.length) {	throw new DOMException(1); }
	return this.elements[index];
}

// removes item at index
// throws DOMException if index is out of bounds
// returns removed item
selection.prototype.remove = function(target) {
	if(typeof target === 'string') { target = document.getElementById(target); }
	if(!target || !(target instanceof SVGElement)) { return; }
	var index = this.elements.indexOf(target);
	if(index == -1) { return null; }
	this.elements.splice(index, 1);
	return target;
};

// adds target to selection (either SVGElement or by id)
selection.prototype.add = function(target) {
	if(typeof target === 'string') { target = document.getElementById(target); }
	if(!target || !(target instanceof SVGElement)) { return; }
	
	var afterId = null;
	
	for(var i = 0; i < this.elements.length; i++) {
		if(this.elements[i] == target) { return; }
		if(this.elements[i].isChildOf(target) || target.isChildOf(this.elements[i])) {
			this.elements.splice(this.elements[i], 1);
			i--;
		}
		if(target.isOver(this.elements[i])) {
			afterId = i;
		}
	}
	
	if(afterId == this.elements.length-1) {
		this.elements.push(target);
	} else {
		this.elements.splice(afterId, 0, target);
	}
	
	if(tree) {
		if(this.elements.length == 1) {
			tree.select(target);
		} else {
			tree.select();
		}
	}
	
	return target;
}


// evaluates given command for each element
selection.prototype.evaluateAll = function(command) {
	var target;
	for(var i = 0; i < this.elements.length; i++) {
		target = this.elements[i];
		eval(command);
	}
}


// returns bounding box; object with 'left', 'right', 'top', 'bottom' -
//		corresponding to the smallest rectangle encapsulating all elements
// returns null if selection has no elements
selection.prototype.getBoundingBox = function() {
	var box = { 'left': null, 'right': null, 'top': null, 'bottom': null };
	for(var i = 0; i < this.elements.length; i++) {
		if(!(typeof this.elements[i].getBBox() === 'function')) { continue; }
		var elBox = this.elements[i].getBBox();
		if(box.left == null || elBox.x < box.left ) { box.left = elBox.x; }
		if(box.right == null || elBox.x+elBox.width > box.right ) { box.right = elBox.x+elBox.width; }
		if(box.top == null || elBox.y < box.top ) { box.top = elBox.y; }
		if(box.bottom == null || elBox.y+elBox.height < box.height ) { box.bottom = elBox.y+elBox.height; }
	}
	if(box.left == null) { return null; }
	return box;
}


// groups all selected elements
// returns the new group
selection.prototype.group = function() {
	if(this.elements.length == 0) { return; }
	
	var group = document.createElementNS(svgNS, 'g');
	
	var chains = [];
	var maxLength = 0;
	
	for(var i = 0; i < this.elements.length; i++) {
		var currentChain = this.elements[i].getChain();
		if(currentChain.numbers.length > maxLength) { maxLength = currentChain.numbers.length; }
		chains.push(currentChain);
	}
	
	var parentElement;
	var insertAfter;
	
	for(var i = 0; i < maxLength; i++) {
		var maxNumber = null;
		for(var j = 0; j < chains.length; j++) {
			if(maxNumber == null || maxNumber < chains[j].numbers[i]) {
				maxNumber = chains[j].numbers[i];
			}
		}
		
		var candidates = [];
		
		for(var j = 0; j < chains.length; j++) {
			if(chains[j].numbers[i] == maxNumber) {
				if(chains[j].numbers.length == i) {
					candidates = [ chains[j] ];
					break;
				} else {
					candidates.push(chains[j]);
				}
			}
		}
		
		if(candidates.length == 1) {
			parentElement = candidates[0].elements[i];
			if(candidates[0].elements[i+1]) {
				insertAfter = candidates[0].elements[i+1];
			} else {
				insertAfter = candidates[0].owner;
			}
			break;
		}
		
		chains = candidates;
	}
	
	group.generateId();
	
	if(insertAfter.nextElementSibling) {
		parentElement.insertBefore(group, insertAfter.nextElementSibling);
		if(svg && svg.history) {
			svg.history.add(new historyCreation(group.cloneNode(), parentElement.id, insertAfter.nextElementSibling.id, false, true));
		}
	} else {
		parentElement.appendChild(group);
		if(svg && svg.history) {
			svg.history.add(new historyCreation(group.cloneNode(), parentElement.id, null, false, true));
		}
	}
	
	var groupCTM = group.getCTMBase();
	var groupCTMInverted = groupCTM.inverse();
	
	for(var i = 0; i < this.elements.length; i++) {
		var CTM = this.elements[i].getCTMBase();
		var newCTM = groupCTMInverted.multiply(CTM);
		
		var oldTransform = this.elements[i].getAttribute('transform');
		var oldParent = this.elements[i].parentNode.id;
		var oldSibling = this.elements[i].nextElementSibling ? this.elements[i].nextElementSibling.id : null;
		
		group.appendChild(this.elements[i]);
		this.elements[i].setAttribute('transform', newCTM);
		
		if(svg && svg.history) {
			svg.history.add(new historyAttribute(this.elements[i].id, { 'transform': oldTransform },
				{ 'transform': newCTM.toString() }, true));
			svg.history.add(new historyParentage(this.elements[i].id, [ oldParent, group.id ],
				[ oldSibling, null ], true));
		}
		
	}
	
	this.elements = [group];
	
	if(tree) {
		tree.seed();
		tree.select(group);
	}
	
	return group;
}

// ungroups all SVG group elements and adds their contents to the selection
selection.prototype.ungroup = function() {
	var toAdd = [];
	for(var i = 0; i < this.elements.length; i++) {
		if(this.elements[i] instanceof SVGGElement) {
			toAdd.push(this.elements[i].ungroup(true));
			this.elements.splice(i, 1);
			i--;
		}
	}
	for(var i = 0; i < toAdd.length; i++) {
		this.add(toAdd[i]);
	}
	
	if(tree) {
		if(this.elements.length == 1) {
			tree.select(target);
		} else {
			tree.select();
		}
	}
}
















