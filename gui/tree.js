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
	this.rootNode.collapse(true);
	
	var targetNode = this.findNode(this.rootNode, target.getAttribute('id'));
	
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
	
	this.container.parentNode.scrollTop = 0;
	
	var panelHeight = this.container.parentNode.parentNode.scrollHeight;
	var elementOffset = originalNode.li.getBoundingClientRect().bottom;
	
	if(elementOffset > panelHeight) {
		this.container.parentNode.scrollTop = (elementOffset - panelHeight);
	}
	
}
	
// tree clicking event handler
tree.prototype.handle = function(evt) {
	if(evt.target.getAttributeNS(anigenNS, 'originalid') != null) { svg.select(evt.target.getAttributeNS(anigenNS, 'originalid')); }
	evt.stopPropagation();
}