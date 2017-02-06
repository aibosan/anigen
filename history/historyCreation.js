/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		History element (representing a single step) for creating and destroying elements
 */
function historyCreation(clone, parentId, previousSiblingId, isDeletion, collapsible) {
	this.timestamp = Date.now();
	this.collapsible = collapsible || false;
	this.clone = clone;
	this.targetId = clone.getAttribute('id');
	
	this.parentId = parentId;
	this.previousSiblingId = previousSiblingId;
	this.deletion = isDeletion || false;
	
	
	this.undo = function() {
		if(isDeletion) {
			var newElement = this.clone.cloneNode(true);
			var owner = document.getElementById(this.parentId);
			if(this.previousSiblingId) {
				var sibling = document.getElementById(this.previousSiblingId);
				if(owner && sibling) {
					owner.insertBefore(newElement, sibling);
					if(newElement.isAnimation() || newElement.hasAnimation()) { 
						// svg.rebuildShepherds(svg.svgElement, true);
						//timeline.rebuild();
					}
					return true;
				} else {
					return false;
				}
			} else {
				if(owner) {
					owner.appendChild(newElement);
					if(newElement.isAnimation() || newElement.hasAnimation()) {
						// svg.rebuildShepherds(svg.svgElement, true);
						//timeline.rebuild();
					}
					return true;
				} else {
					return false;
				}
			}
		} else {
			var el = document.getElementById(this.clone.getAttribute('id'));
			if(!el) { return false; }
			if(svg.selected == el) { svg.select(el.parentNode); }
			if(el.isAnimation() || el.hasAnimation()) {
				// svg.rebuildShepherds(svg.svgElement, true);
				//timeline.rebuild();
			}
			el.parentNode.removeChild(el);
			return true;
		}
	};
	
	this.redo = function() {
		if(!isDeletion) {
			var newElement = this.clone.cloneNode(true);
			var owner = document.getElementById(this.parentId);
			if(this.previousSiblingId) {
				var sibling = document.getElementById(this.previousSiblingId);
				if(owner && sibling) {
					owner.insertBefore(newElement, sibling);
					if(newElement.isAnimation() || newElement.hasAnimation()) {
						// svg.rebuildShepherds(svg.svgElement, true);
						//timeline.rebuild();
					}
					return true;
				} else {
					return false;
				}
			} else {
				if(owner) {
					owner.appendChild(newElement);
					if(newElement.isAnimation() || newElement.hasAnimation()) {
						// svg.rebuildShepherds(svg.svgElement, true);
						//timeline.rebuild();
					}
					return true;
				} else {
					return false;
				}
			}
		} else {
			var el = document.getElementById(this.clone.id);
			if(!el) { return false; }
			if(svg.selected == el) { svg.select(el.parentNode); }
			if(el.isAnimation() || el.hasAnimation()) {
				// svg.rebuildShepherds(svg.svgElement, true);
				//timeline.rebuild();
			}
			el.parentNode.removeChild(el);
			return true;
		}
	};
	
	this.devour = function() {
		return false;
	};
}