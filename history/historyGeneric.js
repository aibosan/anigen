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
	
	
	this.undo = function() {
		if(this.actionUndo) {
			var target = document.getElementById(this.targetId);
			try {
				eval(this.actionUndo);
			} catch(e) {
				console.log('Could not evaluate', this.actionUndo, e);
			}	
		}
	};
	
	this.redo = function() {
		if(this.actionRedo) {
			var target = document.getElementById(this.targetId);
			try {
				eval(this.actionRedo);
			} catch(e) {
				console.log('Could not evaluate', this.actionRedo, e);
			}	
		}
	};
	
	this.devour = function(other) {
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
		
	};
}