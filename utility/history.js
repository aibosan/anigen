/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Handles history, that is undo and redo commands
 */
function history() {
    this.histArray = [];
	this.index = -1;
	
	this.collapseConstant = 300;		// limit between two timestamps to allow history objects to collapse into one
	
	window.addEventListener("historyAdd", function(event) { this.add(event.detail); }.bind(this), false);
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
	
	if(addition instanceof historyAttribute) {
		var matches = true;
		for(var i in addition.attributesFrom) {
			if(!addition.attributesTo[i] || addition.attributesFrom[i] != addition.attributesTo[i]) { matches = false; break; }
		}
		for(var i in addition.top) {
			if(!matches) { break; }
			if(!addition.attributesFrom[i] || addition.attributesFrom[i] != addition.attributesTo[i]) { matches = false; break; }
		}
		if(matches) { return false; }
	}
	
	this.histArray.splice(this.index+1);		// cuts everything after current history index
	
	this.histArray.push(addition);
	this.index = this.histArray.length-1;
	return true;
}

history.prototype.undo = function(single) {
	if(this.index < 0) { return false; }
	
	log.report('Beginning history undo:', 1);
	
	var steps = 0;
	var timeStart = new Date();
	
	do {
		steps++;
		this.histArray[this.index].undo();
		this.index--;
	} while(!single && this.index >= 0 && 
		this.histArray[this.index+1].collapsible == true &&
		this.histArray[this.index].collapsible == true &&
		Math.abs(this.histArray[this.index+1].timestamp - this.histArray[this.index].timestamp) < this.collapseConstant);
	
	var timeEnd = new Date();
	log.report('History <strong>undo</strong>. Steps: '+steps+', elapsed time: '+(timeEnd.getTime()-timeStart.getTime())+' ms.');
	
	svg.ui.selectionBox.origin = null;
	if(anigenActual) { anigenActual.eventUIRefresh(); }
	svg.select();
	return true;
}

history.prototype.redo = function(single) {
	if(this.index == this.histArray.length-1) { return false; }
	
	log.report('Beginning history redo:', 1);
	
	var steps = 0;
	var timeStart = new Date();
	
	do {
		steps++;
		this.index++;
		this.histArray[this.index].redo();
	} while(!single && this.index < this.histArray.length-1 && 
		this.histArray[this.index].collapsible == true &&
		this.histArray[this.index+1].collapsible == true &&
		Math.abs(this.histArray[this.index+1].timestamp - this.histArray[this.index].timestamp) < this.collapseConstant);
	
	var timeEnd = new Date();
	log.report('History <strong>redo</strong>. Steps: '+steps+', elapsed time: '+(timeEnd.getTime()-timeStart.getTime())+' ms.');
	
	svg.ui.selectionBox.origin = null;
	if(anigenActual) { anigenActual.eventUIRefresh(); }
	svg.select();
	return true;
}

history.prototype.toIndex = function(index) {
	if(index == this.index) { return; }
	if(this.histArray.length-1 < index) { index = this.histArray.length-1; }
	if(index < -1) { index = -1; }
	
	if(index < this.index) {
		while(this.index > index) {
			this.undo();
		}
		while(this.index < index) {
			this.redo(true);
		}
	}
	
	if(index < this.index) {
		while(this.index < index) {
			this.redo();
		}
		while(this.index > index) {
			this.redo(true);
		}
	}
}


