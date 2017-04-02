/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		History element (representing a single step) for creating and destroying elements
 */
function historyCreation(clone, parentId, nextSiblingId, isDeletion, collapsible) {
	this.timestamp = Date.now();
	this.collapsible = collapsible || false;
	this.clone = clone;
	this.targetId = clone.getAttribute('id');
	
	this.parentId = parentId;
	this.nextSiblingId = nextSiblingId;
	this.deletion = isDeletion || false;
}
	
historyCreation.prototype.undo = function() {
	if(this.deletion) {
		var newElement = this.clone.cloneNode(true);
		var owner = document.getElementById(this.parentId);
		if(this.nextSiblingId) {
			var sibling = document.getElementById(this.nextSiblingId);
			if(owner && sibling) {
				owner.insertBefore(newElement, sibling);
				log.report('<span class="tab"></span><strong>'+newElement.getAttribute('id')+'</strong> was recreated and inserted into <strong>'+owner.getAttribute('id')+'</strong>, before  <strong>'+sibling.getAttribute('id')+'</strong>.', 1);
				return true;
			} else {
				log.error('<span class="tab"></span><span class="tab"></span>Failed to insert <strong>'+newElement.getAttribute('id')+'</strong>:', 1);
				if(!owner) {
					log.report('<span class="tab"></span><span class="tab"></span>Parent element <strong>'+this.parentId+'</strong> is missing!</span>', 1);
				}
				if(!sibling) {
					log.report('<span class="tab"></span><span class="tab"></span>Sibling element <strong>'+this.nextSiblingId+'</strong> is missing!</span>', 1);
				}
				return false;
			}
		} else {
			if(owner) {
				owner.appendChild(newElement);
				log.report('<span class="tab"></span><strong>'+newElement.getAttribute('id')+'</strong> was recreated and appended to <strong>'+owner.getAttribute('id')+'</strong>.', 1);
				return true;
			} else {
				log.error('<span class="tab"></span><span class="tab"></span>Failed to insert <strong>'+newElement.getAttribute('id')+'</strong>:', 1);
				log.error('<span class="tab"></span><span class="tab"></span>Parent element <strong>'+this.parentId+'</strong> is missing!</span>', 1);
				return false;
			}
		}
	} else {
		var el = document.getElementById(this.clone.getAttribute('id'));
		if(!el) { 
			log.error('<span class="tab"></span><span class="tab"></span>Failed to remove <strong>'+this.clone.getAttribute('id')+'</strong> - element does not exist.', 1);
			return false;
		}
		if(svg.selected == el) { svg.select(el.parentNode); }
		log.report('<span class="tab"></span>Removed <strong>'+el.getAttribute('id')+'</strong> from <strong>'+el.parentNode.getAttribute('id')+'</strong>.', 1);
		el.parentNode.removeChild(el);
		return true;
	}
}
	
historyCreation.prototype.redo = function() {
	if(!this.deletion) {
		var newElement = this.clone.cloneNode(true);
		var owner = document.getElementById(this.parentId);
		if(this.nextSiblingId) {
			var sibling = document.getElementById(this.nextSiblingId);
			if(owner && sibling) {
				owner.insertBefore(newElement, sibling);
				log.report('<span class="tab"></span><strong>'+newElement.getAttribute('id')+'</strong> was recreated and inserted into <strong>'+owner.getAttribute('id')+'</strong>, before  <strong>'+sibling.getAttribute('id')+'</strong>.', 1);
				return true;
			} else {
				log.error('<span class="tab"></span><span class="tab"></span>Failed to insert <strong>'+newElement.getAttribute('id')+'</strong>:', 1);
				if(!owner) {
					log.report('<span class="tab"></span><span class="tab"></span>Parent element <strong>'+this.parentId+'</strong> is missing!</span>', 1);
				}
				if(!sibling) {
					log.report('<span class="tab"></span><span class="tab"></span>Sibling element <strong>'+this.nextSiblingId+'</strong> is missing!</span>', 1);
				}
				return false;
			}
		} else {
			if(owner) {
				log.report('<span class="tab"></span><strong>'+newElement.getAttribute('id')+'</strong> was recreated and appended to <strong>'+owner.getAttribute('id')+'</strong>.', 1);
				owner.appendChild(newElement);
				return true;
			} else {
				log.error('<span class="tab"></span><span class="tab"></span>Failed to insert <strong>'+newElement.getAttribute('id')+'</strong>:', 1);
				log.error('<span class="tab"></span><span class="tab"></span>Parent element <strong>'+this.parentId+'</strong> is missing!', 1);
				return false;
			}
		}
	} else {
		var el = document.getElementById(this.clone.id);
		if(!el) {
			log.error('<span class="tab"></span><span class="tab"></span>Failed to remove <strong>'+this.clone.getAttribute('id')+'</strong> - element does not exist.', 1);
			return false;
		}
		if(svg.selected == el) { svg.select(el.parentNode); }
		log.report('<span class="tab"></span>Removed <strong>'+el.getAttribute('id')+'</strong> from <strong>'+el.parentNode.getAttribute('id')+'</strong>.', 1);
		el.parentNode.removeChild(el);
		return true;
	}
}
	
historyCreation.prototype.devour = function() {
	return false;
}