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
}

historyParentage.prototype.undo = function() {
	var el = document.getElementById(this.targetId);
	var owner = document.getElementById(this.parentIds[0]);
	if(!el || !owner) { 
		logger.error('<span class="tab"></span>Failed to move element <strong>'+this.targetId+'</strong>:', 1);
		if(!el) {
			logger.error('<span class="tab"></span><span class="tab"></span>Element does not exist.', 1);
		}
		if(!owner) {
			logger.error('<span class="tab"></span><span class="tab"></span>Parent <strong>'+this.parentIds[0]+'</strong> does not exist.', 1);
		}
		return false;
	}
	if(this.siblingIds[0]) {
		var sibling = document.getElementById(this.siblingIds[0]);
		if(!sibling) {
			logger.error('<span class="tab"></span>Failed to move element <strong>'+this.targetId+'</strong>:', 1);
			logger.error('<span class="tab"></span><span class="tab"></span>Sibling element <strong>'+this.siblingIds[0]+'</strong> does not exist.', 1);
			return false;
		}
		logger.report('<span class="tab"></span>Element <strong>'+this.targetId+'</strong> moved into <strong>'+this.parentIds[0]+'</strong>, inserted before <strong>'+this.siblingIds[0]+'</strong>.', 1);
		owner.insertBefore(el, sibling);
		return true;
	}
	logger.report('<span class="tab"></span>Element <strong>'+this.targetId+'</strong> moved appended to <strong>'+this.parentIds[0]+'</strong>.', 1);
	owner.appendChild(el);
	return true;
}

historyParentage.prototype.redo = function() {
	var el = document.getElementById(this.targetId);
	var owner = document.getElementById(this.parentIds[1]);
	if(!el || !owner) {
		logger.error('<span class="tab"></span>Failed to move element <strong>'+this.targetId+'</strong>:', 1);
		if(!el) {
			logger.error('<span class="tab"></span><span class="tab"></span>Element does not exist.', 1);
		}
		if(!owner) {
			logger.error('<span class="tab"></span><span class="tab"></span>Parent <strong>'+this.parentIds[1]+'</strong> does not exist.', 1);
		}
		return false;
	}
	if(this.siblingIds[1]) {
		var sibling = document.getElementById(this.siblingIds[1]);
		if(!sibling) {
			logger.error('<span class="tab"></span>Failed to move element <strong>'+this.targetId+'</strong>:', 1);
			logger.error('<span class="tab"></span><span class="tab"></span>Sibling element <strong>'+this.siblingIds[1]+'</strong> does not exist.', 1);
			return false;
		}
		logger.report('<span class="tab"></span>Element <strong>'+this.targetId+'</strong> moved into <strong>'+this.parentIds[1]+'</strong>, inserted before <strong>'+this.siblingIds[1]+'</strong>.', 1);
		owner.insertBefore(el, sibling);
		return true;
	}
	logger.report('<span class="tab"></span>Element <strong>'+this.targetId+'</strong> moved appended to <strong>'+this.parentIds[1]+'</strong>.', 1);
	owner.appendChild(el);
	return true;
}

historyParentage.prototype.devour = function() {
	return false;
}