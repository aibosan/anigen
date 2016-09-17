/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		History element (representing a single step) for moving element in DOM
 */
function historyParentage(targetId, parentIds, siblingIds, collapsible) {
	this.timestamp = Date.now();
	this.collapsible = collapsible || false;
	
	this.targetId = targetId;
	this.parentIds = parentIds || [ null, null ];
	this.siblingIds = siblingIds || [ null, null ];
	
	this.undo = function() {
		var el = document.getElementById(this.targetId);
		var owner = document.getElementById(this.parentIds[0]);
		if(!el || !owner) { return false; }
		if(siblingIds[0]) {
			var sibling = document.getElementById(this.siblingIds[0]);
			if(!sibling) { return false; }
			owner.insertBefore(el, sibling);
			return true;
		}
		owner.appendChild(el);
		return true;
	};
	
	this.redo = function() {
		var el = document.getElementById(this.targetId);
		var owner = document.getElementById(this.parentIds[1]);
		if(!el || !owner) { return false; }
		if(siblingIds[1]) {
			var sibling = document.getElementById(this.siblingIds[1]);
			if(!sibling) { return false; }
			owner.insertBefore(el, sibling);
			return true;
		}
		owner.appendChild(el);
		return true;
	};
	
	this.devour = function() {
		return false;
	};
	
	
}