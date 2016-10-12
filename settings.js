/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Holds and handles aniGen settings
 */
function settings() {
	this.data = {
		'tree':	false,
		'timeline': false,
		'keyframes': false,
		'layers': false,
		
		'highlight': true,
		'progressCurve': false,
		'nodes': true,
		'canvasFrame': true,
		
		'windowsWidth': 256,
		'treeWidth': 256,
		'timelineHeight': 96
	}
}

settings.prototype.loadData = function() {
	var data = getData('anigenSettings');
	if(!data) { return; }
	data = data.split(';');
	
	this.data.tree = data[0] && data[0] != '0' ? true : false;
	this.data.timeline = data[1] && data[1] != '0' ? true : false;
	this.data.keyframes = data[2] && data[2] != '0' ? true : false;
	this.data.layers = data[3] && data[3] != '0' ? true : false;
	
	this.data.windowsWidth = parseInt(data[4]);
	this.data.treeWidth = parseInt(data[5]);
	this.data.timelineHeight = parseInt(data[6]);
	
	this.data.highlight = data[7] && data[7] != '1' ? false : true;
	this.data.progressCurve = data[8] && data[8] != '0' ? true : false;
	this.data.nodes = data[9] && data[9] != '1' ? false : true;
	this.data.canvasFrame = data[10] && data[10] != '1' ? false : true;
	
	if(this.data.windowsWidth > window.innerWidth/2) { this.data.windowsWidth = window.innerWidth/2; }
	if(this.data.treeWidth > window.innerWidth/2) { this.data.treeWidth = window.innerWidth/2; }
	if(this.data.timelineHeight > window.innerHeight/2) { this.data.timelineHeight = window.innerHeight/2; }
}

settings.prototype.saveData = function() {
	var serialized = [
		(this.data.tree ? '1' : '0'),
		(this.data.timeline ? '1' : '0'),
		(this.data.keyframes ? '1' : '0'),
		(this.data.layers ? '1' : '0'),
		
		this.data.windowsWidth,
		this.data.treeWidth,
		this.data.timelineHeight,
		
		(this.data.highlight ? '1' : '0'),
		(this.data.progressCurve ? '1' : '0'),
		(this.data.nodes ? '1' : '0'),
		(this.data.canvasFrame ? '1' : '0')
	];
		
	setData('anigenSettings', serialized.join(';'));
}

settings.prototype.get = function(data) {
	return this.data[data];
}

settings.prototype.set = function(data, value) {
	this.data[data] = value;
	this.saveData();
}

settings.prototype.evaluateOverlay = function(table) {
	table = table || overlay.content.children[0];
	
	this.set("highlight", table.children[0].children[1].children[0].checked);
	this.set("progressCurve", table.children[1].children[1].children[0].checked);
	this.set("nodes", table.children[2].children[1].children[0].checked);
	this.set("canvasFrame", table.children[3].children[1].children[0].checked);
	
	if(svg && svg.ui) {
		svg.ui.edit(svg.selected);
		svg.ui.refresh();
	}
}

settings.prototype.apply = function() {
	if(this.data.tree) { 
		w2ui['layout'].show('left', true);
		w2ui['anigenContext'].check('buttonTree');
	} else {
		w2ui['layout'].hide('left', true);
		w2ui['anigenContext'].uncheck('buttonTree');
	}
	
	if(this.data.timeline) { 
		w2ui['layout'].show('bottom', true);
		w2ui['anigenContext'].check('buttonTimeline');
	} else {
		w2ui['layout'].hide('bottom', true);
		w2ui['anigenContext'].uncheck('buttonTimeline');
	}
	
	var keyframesDisabled = w2ui['anigenContext'].get('buttonAnimation').disabled;
	w2ui['anigenContext'].enable('buttonAnimation');
	
	if(this.data.keyframes) { 
		windowAnimation.show();
		w2ui['anigenContext'].check('buttonAnimation');
	} else {
		windowAnimation.hide();
		w2ui['anigenContext'].uncheck('buttonAnimation');
	}
	
	if(keyframesDisabled) {
		w2ui['anigenContext'].disable('buttonAnimation');
	}
	
	if(this.data.layers) { 
		windowLayers.show();
		w2ui['anigenContext'].check('buttonLayers');
	} else {
		windowLayers.hide();
		w2ui['anigenContext'].uncheck('buttonLayers');
	}
	
	w2ui['layout'].sizeTo('right', this.data.windowsWidth);
	w2ui['layout'].sizeTo('left', this.data.treeWidth);
	w2ui['layout'].sizeTo('bottom', this.data.timelineHeight);
}