/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		XML tree UI element
 */
function tree() {
    this.container = document.createElement('div');

    this.root = document.createElement('ul');
    this.root.setAttribute("class", "tree");

    this.container.appendChild(this.root);

    this.rootNode = null;
	
	this.selected = null;

    this.boxes = [];
	
	this.container.addEventListener("click", function(event) { event.target.blur(); }, false);
}
	
tree.prototype.parseSVG = function(svgNode, lastNode) {
	if(svgNode == null) { svgNode = svg.svgElement; }
	if(svgNode.getAttribute('id') == null) { svgNode.generateId(); }
	
	// ignores interface branches
	if(svgNode.getAttribute('anigen:lock') == 'interface') { return; }
	
	// skips creation of elements out of skipped nodes
	if(svgNode.getAttribute('anigen:lock') != 'skip') {
		// parses element into a treeNode
		var currentNode = new treeNode(svgNode);
		
		if(this.rootNode == null) {
			this.rootNode = currentNode;
			lastNode = this.rootNode;
		} else {
			lastNode.append(currentNode);
		}
		lastNode = currentNode;
	}
	
	for(var i = 0; i < svgNode.children.length; i++) {
		this.parseSVG(svgNode.children[i], lastNode);
	}
	
}

tree.prototype.seed = function() {
	this.rootNode = null;
	this.lastNode = null;
	this.selected = null;
	this.boxes = [];
	this.root.removeChildren();
	this.parseSVG(svg.svgElement);
	this.root.appendChild(this.rootNode.li);
	if(svg && svg.selected) { this.select(svg.selected); }
}

tree.prototype.findNode = function(treeNode, nodeId) {
	if(treeNode == null) { treeNode = this.rootNode; }
	if(treeNode.element.id == nodeId) { return treeNode; }

	for(var i = 0; i < treeNode.children.length; i++) {
		var result = this.findNode(treeNode.children[i], nodeId);
		if(result != null) { return result };
	}
	return null;
}

tree.prototype.select = function(target, attemptTwo) {
	if(!target) {
		if(this.selected != null) {
			this.selected.setSelected(false);
		}
		this.selected = null;
		return;
	}
	
	var targetNode = this.findNode(this.rootNode, target.getAttribute('id'));
	if(!targetNode) { this.select(); return; }
	
	var originalOffset = targetNode.li.getBoundingClientRect().top;
	
	this.rootNode.collapse(true);
	if(!targetNode) { 
		if(attemptTwo) {
			console.log('Tree could not find element.', target);
			return false;
		} else {
			this.seed();
			this.select(target, true);
			return;
		}
	}
	
	if(this.selected != null) {
		this.selected.setSelected(false);
	}
	this.selected = targetNode;
	targetNode.setSelected(true);
	
	var originalNode = targetNode;
	
	while(targetNode != null) {
		targetNode.spread();
		targetNode = targetNode.parentNode;
	};
	
	
	var panelHeight = this.container.parentNode.parentNode.scrollHeight;
	var elementOffset = originalNode.li.getBoundingClientRect().top;
	
	this.container.parentNode.scrollTop -= (originalOffset - elementOffset);
	
	/*
	if(elementOffset > panelHeight) {
		this.container.parentNode.scrollTop = (elementOffset - panelHeight);
	}
	*/
	
}
	
// tree clicking event handler
tree.prototype.handleSelect = function(evt) {
	var targ = evt.target;
	while(!targ.getAttributeNS(anigenNS, 'originalid') && !(targ instanceof HTMLUListElement)) {
		targ = targ.parentNode;
	}
	if((targ instanceof HTMLUListElement)) { return; }
	svg.select(targ.getAttributeNS(anigenNS, 'originalid'));
	evt.stopPropagation();
}

tree.prototype.handleToggle = function(evt) {
	var targ = evt.target;
	while(!targ.shepherd && !(targ instanceof HTMLUListElement)) {
		targ = targ.parentNode;
	}
	if((targ instanceof HTMLUListElement)) { return; }
	targ.shepherd.toggle();
	evt.stopPropagation();
}