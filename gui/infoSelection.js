/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Editor's section with information about currently selected element
 */
function infoSelection() {
    this.container = document.createElement("div");
    this.container.id = "anigeninfoSelection";

    this.elementNodeName = document.createElement("span");
    this.elementId = document.createElement("span");
    this.info = document.createElement("span");

    this.container.appendChild(this.elementNodeName);
    this.container.appendChild(this.elementId);
    this.container.appendChild(this.info);
}

infoSelection.prototype.refresh = function() {
	var element = svg.selected;

	if(!(element instanceof SVGElement)) { return; }
	if(element == null) { return; }

	this.elementNodeName.removeChildren();
	this.elementNodeName.appendChild(document.createTextNode("<" + element.nodeName + ">"))
	
	if(element.getAttribute('id') == null) {
		element.generateId();
	}

	this.elementId.removeChildren();
	this.elementId.appendChild(document.createTextNode(element.getAttribute('id')))
	
	this.elementId.setAttribute("onclick", "popup.input(infoSelection.elementId, 'text', '"+svg.selected.getAttribute('id')+"', 'svg.changeId(svg.selected, value, true);', null)");
	
	this.info.removeChildren();
	
	if(element.getAttribute('anigen:type') == 'animationGroup') {
		this.info.appendChild(document.createTextNode('animation group ('+element.getAttribute('anigen:group') +')'));
	}
	
	switch(element.nodeName.toLowerCase()) {
		case "animatetransform":
			this.info.appendChild(document.createTextNode(element.getAttribute('type')));
			break;
		case "animate":
			this.info.appendChild(document.createTextNode(element.getAttribute('attributeName')));
			break;
		case "use":
			var ownerId = element.getAttribute('xlink:href');
			if(!ownerId) { break; }
			ownerId = ownerId.substring(1);
			this.info.appendChild(new button('icon-chain-black', 'svg.select("'+ownerId+'")', 'Select linked element'));
			break;
	}
	if(element.getAttribute('inkscape:groupmode') == 'layer') {
		this.info.appendChild(document.createTextNode(element.getAttribute('inkscape:label')));
	}
}