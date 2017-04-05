/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Holds and handles aniGen settings
 */
function settings() {
	this.data = {
		'tree':	false,
		'colors': false,
		'keyframes': false,
		'layers': false,
		'bottom': true,
		
		'highlight': true,
		'progressCurve': false,
		'nodes': true,
		'canvasFrame': true,
		'rulers': true,
		'previewAutorefresh': false,
		'selectionboxAutorefresh': true,
		'loadLayerStates': false,
		
		'windowsWidth': 256,
		'treeWidth': 256,
		'timelineHeight': 96,
		'bottomHeight': 24
	}
}

settings.prototype.loadData = function() {
	var data = getData('anigenSettings');
	if(!data) { return; }
	data = data.split(';');
	
	this.data.tree = data[0] && data[0] != '0' ? true : false;
	this.data.colors = data[1] && data[1] != '0' ? true : false;
	this.data.keyframes = data[2] && data[2] != '0' ? true : false;
	this.data.layers = data[3] && data[3] != '0' ? true : false;
	
	this.data.windowsWidth = parseInt(data[4]);
	this.data.treeWidth = parseInt(data[5]);
	this.data.timelineHeight = parseInt(data[6]);
	
	this.data.highlight = data[7] && data[7] != '1' ? false : true;
	this.data.progressCurve = data[8] && data[8] != '0' ? true : false;
	this.data.nodes = data[9] && data[9] != '1' ? false : true;
	this.data.canvasFrame = data[10] && data[10] != '1' ? false : true;
	this.data.rulers = data[11] && data[11] != '1' ? false : true;
	
	this.data.previewAutorefresh = data[12] && data[12] != '0' ? true : false;
	this.data.selectionboxAutorefresh = data[13] && data[13] != '1' ? false : true;
	
	this.data.bottom = data[14] && data[14] != '1' ? false : true;
	
	this.data.bottomHeight = parseInt(data[15]);
	
	this.data.loadDocumentStates = data[16] && data[16] != '1' ? false : true;
	
	if(this.data.windowsWidth > window.innerWidth/2) { this.data.windowsWidth = window.innerWidth/2; }
	if(this.data.treeWidth > window.innerWidth/2) { this.data.treeWidth = window.innerWidth/2; }
	if(this.data.timelineHeight > window.innerHeight/2) { this.data.timelineHeight = window.innerHeight/2; }
}

settings.prototype.saveData = function() {
	var serialized = [
		(this.data.tree ? '1' : '0'),
		(this.data.colors ? '1' : '0'),
		(this.data.keyframes ? '1' : '0'),
		(this.data.layers ? '1' : '0'),
		
		this.data.windowsWidth,
		this.data.treeWidth,
		this.data.timelineHeight,
		
		(this.data.highlight ? '1' : '0'),
		(this.data.progressCurve ? '1' : '0'),
		(this.data.nodes ? '1' : '0'),
		(this.data.canvasFrame ? '1' : '0'),
		(this.data.rulers ? '1' : '0'),
		
		(this.data.previewAutorefresh ? '1' : '0'),
		(this.data.selectionboxAutorefresh ? '1' : '0'),
		
		(this.data.bottom ? '1' : '0'),
		
		this.data.bottomHeight,
		
		(this.data.loadDocumentStates ? '1' : '0')
		
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
	
	this.set("highlight", table.children[0].children[1].children[0].shepherd.state == 1);
	this.set("progressCurve", table.children[1].children[1].children[0].shepherd.state == 1);
	this.set("nodes", table.children[2].children[1].children[0].shepherd.state == 1);
	this.set("canvasFrame", table.children[3].children[1].children[0].shepherd.state == 1);
	this.set("rulers", table.children[4].children[1].children[0].shepherd.state == 1);
	
	this.set("previewAutorefresh", table.children[5].children[1].children[0].shepherd.state == 1);
	this.set("selectionboxAutorefresh", table.children[6].children[1].children[0].shepherd.state == 1);
	this.set("loadDocumentStates", table.children[7].children[1].children[0].shepherd.state == 1);
	
	if(svg && svg.ui) {
		svg.ui.edit(svg.selected);
		svg.ui.refresh();
	}
}

settings.prototype.apply = function() {
	if(this.data.bottom) { 
		anigenManager.named.bottom.show();
		anigenManager.classes.context.buttons.log.setState(1);
	} else {
		anigenManager.named.bottom.hide();
		anigenManager.classes.context.buttons.log.setState(0);
	}
	
	if(this.data.tree) { 
		anigenManager.named.left.show();
		anigenManager.classes.context.buttons.tree.setState(1);
	} else {
		anigenManager.named.left.hide();
		anigenManager.classes.context.buttons.tree.setState(0);
	}
	
	var keyframesDisabled = !anigenManager.classes.context.buttons.keyframes.enabled;
	anigenManager.classes.context.buttons.keyframes.enable();
	
	
	if(this.data.colors) { 
		anigenManager.classes.windowColors.show();
		anigenManager.classes.context.buttons.colors.setState(1);
	} else {
		anigenManager.classes.windowColors.hide();
		anigenManager.classes.context.buttons.colors.setState(0);
	}
	
	if(this.data.keyframes) { 
		anigenManager.classes.windowAnimation.show();
		anigenManager.classes.context.buttons.keyframes.setState(1);
	} else {
		anigenManager.classes.windowAnimation.hide();
		anigenManager.classes.context.buttons.keyframes.setState(0);
	}
	
	if(keyframesDisabled) {
		anigenManager.classes.context.buttons.keyframes.disable();
		anigenManager.classes.context.buttons.keyframes.setState(0);
	}
	
	if(this.data.layers) { 
		anigenManager.classes.windowLayers.show();
		anigenManager.classes.context.buttons.layers.setState(1);
	} else {
		anigenManager.classes.windowLayers.hide();
		anigenManager.classes.context.buttons.layers.setState(0);
	}
	
	if(this.data.rulers) {
		anigenManager.classes.rulerH.show();
		anigenManager.classes.rulerV.show();
	} else {
		anigenManager.classes.rulerH.hide();
		anigenManager.classes.rulerV.hide();
	}
	
	anigenManager.named.left.setWidth(this.data.treeWidth);
	anigenManager.named.right.setX(window.innerWidth - this.data.windowsWidth);
	
	anigenManager.named.bottom.setY(window.innerHeight - this.data.bottomHeight);
	anigenManager.named.bottom.refresh();
	
	anigenManager.refresh();
}