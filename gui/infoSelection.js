/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Editor's section with information about currently selected element
 */
function infoSelection() {
    this.container = document.createElement("div");

    this.elementNodeName = document.createElement("span");
    this.elementId = document.createElement("span");
    this.info = document.createElement("span");

    this.container.appendChild(this.elementNodeName);
    this.container.appendChild(this.elementId);
    this.container.appendChild(this.info);
	
	this.refresh();
}

infoSelection.prototype.refresh = function() {
	var element = svg.selected;
	
	if(!(element instanceof SVGElement)) { return; }
	if(element == null) { return; }

	this.container.removeChildren();
	
	this.container.appendChild(this.elementNodeName);
    this.container.appendChild(this.elementId);
    this.container.appendChild(this.info);
	
	this.elementNodeName.removeChildren();
	this.elementNodeName.appendChild(document.createTextNode("<" + element.nodeName + ">"))
	
	var info = anigenActual.getNodeDescription(element);
	if(info) {
		this.elementNodeName.setAttribute('title', info);
	} else {
		this.elementNodeName.removeAttribute('title');
	}
	
	if(element.getAttribute('id') == null) {
		element.generateId();
	}

	this.elementId.removeChildren();
	this.elementId.appendChild(document.createTextNode(element.getAttribute('id')))
	
	this.elementId.setAttribute("onclick", "popup.input(infoSelection.elementId, 'text', '"+element.getAttribute('id')+"', 'svg.changeId(svg.selected, value, true);', null)");
	
	this.info.removeChildren();
	
	if(element.getAttribute('anigen:type') == 'animationGroup') {
		this.info.appendChild(document.createTextNode('animated group ('+element.getAttribute('anigen:group') +')'));
		
		try {
			var groupId = svg.animationStates[element.getAttribute('anigen:group')][0].groupElement.getAttribute('id');
		
			var bGroup = new uiButton(
				'folder_special',
				'svg.select("'+groupId+'")',
				'Select state group element'
			);
			this.container.appendChild(bGroup);
		} catch(err) {
			
		}
	}
	
	switch(element.nodeName.toLowerCase()) {
		case "animatetransform":
			this.info.appendChild(document.createTextNode(element.getAttribute('type')));
			break;
		case "animate":
			this.info.appendChild(document.createTextNode(element.getAttribute('attributeName')));
			break;
	}
	
	
	var bVis = new uiButton(
		[ 'visibility', 'visibility_off' ],
		[ 'svg.selected.style.display="none";anigenManager.classes.windowLayers.refresh();', 'svg.selected.style.display=null;anigenManager.classes.windowLayers.refresh();' ],
		[ 'Toggle element visibility', 0 ],
		{ 'state': (svg.selected.style.display == 'none' ? 1 : 0) }
	);
	bVis.shepherd.stateIcons[1].style.color = 'gray';
	this.container.appendChild(bVis);
	
	
	var linkList = element.getLinkList();
	
	for(var i = 0; i < linkList.length; i++) {
		if(!linkList[i].target) { continue; }
		var icon = 'link';
		var altText = 'Select linked object ('+linkList[i].value+')';
		switch(linkList[i].attribute) {
			case 'filter':
				icon = 'blur_on';
				altText = 'Select filter ('+linkList[i].value+')';
				break;
			case 'clip-path':
				icon = 'flip';
				altText = 'Select clip path ('+linkList[i].value+')';
				break;
		}
		if((linkList[i].attribute == 'stroke' || linkList[i].attribute == 'fill') &&
			linkList[i].target instanceof SVGGradientElement) {
			icon = 'gradient';
			altText = 'Select '+linkList[i].attribute +' gradient ('+linkList[i].value+')';
		}
		
		
		var bLink = new uiButton(icon, 'svg.select("'+linkList[i].value+'")', altText);
		this.container.appendChild(bLink);
	}
	
	
	if(svg.camera) { 
		var bCamera = new uiButton(
			'videocam',
			'svg.select(svg.camera.element)',
			'Select camera'
		);
		this.container.appendChild(bCamera);
	}
	
	if(element.getAttribute('inkscape:groupmode') == 'layer') {
		this.info.appendChild(document.createTextNode(element.getAttribute('inkscape:label')));
	}
}