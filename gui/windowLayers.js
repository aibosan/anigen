/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Window for showing and manipulating Inkscape layers
 */
function windowLayers() {
	windowGeneric.call(this, 'layers');
	
	this.seed();
}

windowLayers.prototype = Object.create(windowGeneric.prototype);
windowLayers.prototype.constructor = windowLayers;

windowLayers.prototype.seed = function() {
	this.container.addEventListener('contextmenu', this.eventContextMenu, false);
	
	this.setHeading('Layers (Ctrl+Shift+L)');
	
	this.setImage('layers');
	//this.setImage('filter');
	
	this.imgRight.actions = [ "anigenManager.classes.windowLayers.hide();anigenManager.classes.context.buttons.layers.setState(0);" ];
	
	this.tab1 = this.addTab('Layers');
	
	var buttons = [
		new uiButton('add', 'anigenManager.classes.windowLayers.eventToolbar("plus");event.stopPropagation();', 'Add layer'),
		new uiButton('remove', 'anigenManager.classes.windowLayers.eventToolbar("minus");', 'Remove layer'),
		new uiButton('vertical_align_top', 'anigenManager.classes.windowLayers.eventToolbar("top");', 'Raise the current layer to the top'),
		new uiButton('arrow_upward', 'anigenManager.classes.windowLayers.eventToolbar("up");', 'Raise the current layer'),
		new uiButton('arrow_downward', 'anigenManager.classes.windowLayers.eventToolbar("down");', 'Lower the current layer'),
		new uiButton('vertical_align_bottom', 'anigenManager.classes.windowLayers.eventToolbar("bottom");', 'Lower the current layer to the bottom')
	];
	
	buttons[2].addClass('floatRight');
	buttons[3].addClass('floatRight');
	buttons[4].addClass('floatRight');
	buttons[5].addClass('floatRight');
	
	this.footer.setAttribute('style', 'text-align: left;');
	this.footer.appendChild(buttons[0]);
	this.footer.appendChild(buttons[1]);
	this.footer.appendChild(buttons[2]);
	this.footer.appendChild(buttons[3]);
	this.footer.appendChild(buttons[4]);
	this.footer.appendChild(buttons[5]);
	 
}

windowLayers.prototype.eventContextMenu = function(event) {
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
	event.stopPropagation();
	
	if(!event.target.getAttribute('anigen:id') && !event.target.parentNode.getAttribute('anigen:id')) { return; }
	
	popup.macroLayerContextMenu(event, event.target.getAttribute('anigen:id') || event.target.parentNode.getAttribute('anigen:id'));
}

windowLayers.prototype.contextMenuEvaluate = function(option, id) {
	switch(option) {
		case 'add':
			popup.macroLayerNew(id);
			event.stopPropagation();
			break;
		case 'rename':
			popup.macroLayerRename(id);
			break;
		case 'raise':
			document.getElementById(id).moveUp(true);
			window.dispatchEvent(new Event("treeSeed"));
			svg.select();
			break;
		case 'lower':
			document.getElementById(id).moveDown(true);
			window.dispatchEvent(new Event("treeSeed"));
			svg.select();
			break;
		case 'duplicate':
			svg.duplicate(document.getElementById(id));
			break;
		case 'delete':
			svg.delete(document.getElementById(id));
			break;
	}
}

windowLayers.prototype.eventToolbar = function(option) {
	var currentLayer = svg.getCurrentLayer();
	
	switch(option) {
		case 'plus':		// add layer
			popup.macroLayerNew();
			break;
		case 'minus':		// remove current layer
			svg.delete(currentLayer);
			break;
		case 'top':
			currentLayer.moveTop(true);
			window.dispatchEvent(new Event("treeSeed"));
			svg.select();
			break;
		case 'bottom':
			currentLayer.moveBottom(true);
			window.dispatchEvent(new Event("treeSeed"));
			svg.select();
			break;
		case 'up':
			currentLayer.moveUp(true);
			window.dispatchEvent(new Event("treeSeed"));
			svg.select();
			break;
		case 'down':
			currentLayer.moveDown(true);
			window.dispatchEvent(new Event("treeSeed"));
			svg.select();
			break;
	}
}

windowLayers.prototype.refresh = function() {
	var parentScrolledTop = this.container.parentNode.scrollTop;
	var parentScrolledLeft = this.container.parentNode.scrollLeft;
	var scrolledTop = this.container.scrollTop;
	var scrolledLeft = this.container.scrollLeft;
	
	var currentLayer = svg.getCurrentLayer();
	var layersRaw = svg.getLayers(svg.svgElement);
	this.tab1.removeChildren();
	var selectedIndex = null;
	
	var array = [];
	
	for(var i = 0; i < layersRaw.length; i++) {
		var subArray = [];
		array.push(subArray);
		
		var depth = 0;
		var tmp = layersRaw[i];
		while(!(tmp instanceof SVGSVGElement)) {
			tmp = tmp.getViableParent();
			if(tmp.getAttribute('inkscape:groupmode') == 'layer') { depth++; }
		}
		
		if(layersRaw[i] == currentLayer) { selectedIndex = i; }
		
		var state = layersRaw[i].style.display == 'none' ? 1 : 0;
		
		var visToggle = new uiButton(
			[ 'visibility', 'visibility_off' ],
			[ "svg.toggleVisibility('"+layersRaw[i].getAttribute('id')+"');", "svg.toggleVisibility('"+layersRaw[i].getAttribute('id')+"');" ],
			[ 'Hide layer', 'Show layer' ],
			{ 'state': state, 'class': 'md-18' }
		);
		visToggle.shepherd.stateIcons[1].style.color = 'gray';
			
		
		var layerName = document.createElement('span');
		layerName.appendChild(document.createTextNode(layersRaw[i].getAttribute('inkscape:label')));
		if(depth) { layerName.setAttribute('style', 'padding-left: ' + depth*1.5 + 'em;'); }
		
		subArray.push(visToggle);
		subArray.push(layerName)
	}
	
	var table = build.table(array);
	table.setAttribute('class', 'layers');
	
	if(selectedIndex != null && table.children[selectedIndex]) {
		table.children[selectedIndex].addClass('selected');
	}
	this.tab1.appendChild(table);

	if(layersRaw.length == 0) {
		this.hide();
	}
	
	for(var i = 0; i < table.children.length; i++) {
		table.children[i].children[1].setAttribute('onclick', 'svg.select("'+layersRaw[i].getAttribute('id')+'");');
		table.children[i].children[1].setAttribute('anigen:id', layersRaw[i].getAttribute('id'));
	}
	
	this.container.parentNode.scrollTop = parentScrolledTop;
	this.container.parentNode.scrollLeft = parentScrolledLeft;
	this.container.scrollTop = scrolledTop;
	this.container.scrollLeft = scrolledLeft;
}

windowLayers.prototype.eventKeyDown = function(event) {
	if(event.target != document.body) { return; }
	switch(event.keyCode) {
		case 33:		// page up
			this.eventToolbar('up');
			return true;
		case 34:		// page down
			this.eventToolbar('down');
			return true;
		case 35:		// end
			this.eventToolbar('bottom');
			return true;
		case 36:		// home
			this.eventToolbar('top');
			return true;
		case 46:		// delete
			this.eventToolbar('minus');
			return true;
	}
	return false;
}

