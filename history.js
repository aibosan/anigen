/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Handles history, that is undo and redo commands
 */
function history() {
    this.histArray = [];
	this.index = -1;
	
	this.collapseConstant = 100;		// limit between two timestamps to allow history objects to collapse into one
}

history.prototype.clear = function() {
	this.index = -1;
	this.histArray = [];
}

history.prototype.remove = function(index) {
	if(index == null || index < 0 || this.histArray.length >= index) { throw new DOMException(1); }
	if(index <= this.index) { this.index--; }
	this.histArray.splice(index, 1);
}

history.prototype.add = function(addition) {
	if(	!(addition instanceof historyAttribute) && 
		!(addition instanceof historyCreation) && 
		!(addition instanceof historyGeneric) && 
		!(addition instanceof historyParentage)	) { return false; }
	
	this.histArray.splice(this.index+1);		// cuts everything after current history index
	
	/*
	var current = this.histArray[this.index];
	
	if(	current && current.targetId == addition.targetId && 
		Math.abs(current.timestamp - addition.timestamp) < this.collapseConstant) {
		current.devour(addition);
		return true;
	}
	*/
	
	this.histArray.push(addition);
	this.index = this.histArray.length-1;
	return true;
}

history.prototype.undo = function() {
	if(this.index < 0) { return false; }
	
	do {
		this.histArray[this.index].undo();
		this.index--;
	} while(this.index >= 0 && 
		this.histArray[this.index+1].collapsible == true &&
		this.histArray[this.index].collapsible == true &&
		Math.abs(this.histArray[this.index+1].timestamp - this.histArray[this.index].timestamp) < this.collapseConstant);
	
	if(anigenActual) { anigenActual.eventUIRefresh(); }
	anigenManager.classes.windowAnimation.refresh();
	svg.select();
	return true;
}

history.prototype.redo = function() {
	if(this.index == this.histArray.length-1) { return false; }
	
	do {
		this.index++;
		this.histArray[this.index].redo();
	} while(this.index < this.histArray.length-1 && 
		this.histArray[this.index].collapsible == true &&
		this.histArray[this.index+1].collapsible == true &&
		Math.abs(this.histArray[this.index+1].timestamp - this.histArray[this.index].timestamp) < this.collapseConstant);
	
	if(anigenActual) { anigenActual.eventUIRefresh(); }
	anigenManager.classes.windowAnimation.refresh();
	svg.select();
	
	return true;
}