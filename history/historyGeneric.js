/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		History element for launching given commands
 */
function historyGeneric(targetId, actionUndo, actionRedo, collapsible) {
	this.timestamp = Date.now();
	this.collapsible = collapsible || false;
	
	this.targetId = targetId;
	this.actionUndo = actionUndo;
	this.actionRedo = actionRedo;
}	
	
historyGeneric.prototype.undo = function() {
	if(this.actionUndo) {
		var target = document.getElementById(this.targetId);
		try {
			eval(this.actionUndo);
			logger.report('<span class="tab"></span>Action: '+this.actionUndo, 1);
		} catch(e) {
			logger.error('<span class="tab"></span><span class="tab"></span>Failed to evaluate action:', 1);
			logger.error(''+this.actionUndo+'', 1);
			logger.error('<span class="tab"></span><span class="tab"></span>Error::', 1);
			logger.error(''+e+'', 1);
		}	
	}
}
	
historyGeneric.prototype.redo = function() {
	if(this.actionRedo) {
		var target = document.getElementById(this.targetId);
		try {
			eval(this.actionRedo);
			logger.report('<span class="tab"></span>Action: '+this.actionRedo, 1);
		} catch(e) {
			logger.error('<span class="tab"></span><span class="tab"></span>Failed to evaluate action:', 1);
			logger.error(''+this.actionRedo+'', 1);
			logger.error('<span class="tab"></span><span class="tab"></span>Error:', 1);
			logger.error(''+e+'', 1);
		}	
	}
}
	
historyGeneric.prototype.devour = function(other) {
	if(!(other instanceof historyGeneric) || other.targetId != this.targetId) { return false; }
	
	if(other.timestamp >= this.timestamp) {
		if(other.actionUndo) { this.actionUndo = this.actionUndo ? other.actionUndo + this.actionUndo : other.actionUndo; }
		if(other.actionRedo) { this.actionRedo = this.actionRedo ? this.actionRedo + other.actionRedo : other.actionRedo; }
		this.timestamp = other.timestamp;
	} else {
		if(other.actionUndo) { this.actionUndo = this.actionUndo ? other.actionUndo + this.actionUndo : other.actionUndo; }
		if(other.actionRedo) { this.actionRedo = this.actionRedo ? other.actionRedo + this.actionRedo : other.actionRedo; }
	}
	
	return true;
	
}