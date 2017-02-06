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
	}
	
	switch(element.nodeName.toLowerCase()) {
		case "animatetransform":
			this.info.appendChild(document.createTextNode(element.getAttribute('type')));
			break;
		case "animate":
			this.info.appendChild(document.createTextNode(element.getAttribute('attributeName')));
			break;
	}
	
	var ownerId = element.getAttribute('xlink:href');
	if(ownerId) { 
		ownerId = ownerId.substring(1);
		
		var bLink = new uiButton(
			'link',
			'svg.select("'+ownerId+'")',
			'Select linked element'
		);
		this.container.appendChild(bLink);
	}
	
	if(element.getAttribute('inkscape:groupmode') == 'layer') {
		this.info.appendChild(document.createTextNode(element.getAttribute('inkscape:label')));
	}
}