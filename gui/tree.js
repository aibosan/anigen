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
	
	window.addEventListener("treeSeed", function(event) { this.seed(event.detail); }.bind(this), false);
}
	
tree.prototype.parseSVG = function(svgNode, parentTreeNode) {
	if(svgNode == null) { svgNode = svg.svgElement; }
	if(svgNode.getAttribute('id') == null) { svgNode.generateId(); }
	
	// ignores interface branches
	if(svgNode.getAttribute('anigen:lock') == 'interface') { return; }
	
	// skips creation of elements out of skipped nodes
	if(svgNode.getAttribute('anigen:lock') != 'skip') {
		// parses element into a treeNode
		var currentNode = new treeNode(svgNode);
		
		if(parentTreeNode) {
			parentTreeNode.append(currentNode);
		}
		
		return currentNode;
	}
}

tree.prototype.seed = function(forget) {
	this.rootNode = null;
	this.boxes = [];
	this.root.removeChildren();
	if(forget) { this.selected = null; }
	
	this.rootNode = new treeNode(svg.svgElement);
	this.rootNode.bloom();
	
	this.root.appendChild(this.rootNode.li);
	if(!forget && svg && svg.selected) {
		try {
			this.select(svg.selected);
		} catch(err) {
		}
	}
}

tree.prototype.collapse = function(parentTreeNode) {
	for(var i = 0; i < parentTreeNode.children.length; i++) {
		parentTreeNode.children[i].collapse();
	}
}

tree.prototype.select = function(target) {
	if(typeof target === 'string') {
		target = document.getElementById(target);
	}
	
	if(!target || !(target instanceof SVGElement)) { return; }
	
	var chain = target.getChain();
	chain.elements.push(target);
	
	var currentNode = this.rootNode;
	
	for(var i = 0; i < chain.elements.length; i++) {
		if(!currentNode) { return; }
		currentNode.collapse(true);
		currentNode.spread();							// spread parent (also creates children)
		
		if(i < chain.elements.length-1) {
			newNode = currentNode.findNode(chain.elements[i+1]);		// find child
			if(!newNode) {	// not found; re-bloom and try again
				currentNode.bloom(true);
				newNode = currentNode.findNode(chain.elements[i+1]);
				if(!newNode) {
					this.selected = null;
					throw new Error('Node not found.');
				}
			}
			currentNode = newNode;
		}
		
	}
	this.selected = currentNode;
	this.fitScroll();
}

tree.prototype.fitScroll = function(target) {
	target = target || this.selected;
	if(!target) { return; }
	
	var elTop = target.representative.offsetTop;
	var elBot = elTop + target.li.scrollHeight;
	
	if(this.container.parentNode.scrollTop+this.container.parentNode.clientHeight < elBot) {
		// scroll item to bottom of window
		this.container.parentNode.scrollTop = elBot - this.container.parentNode.clientHeight;
	}
	if(this.container.parentNode.scrollTop > elTop) {
		// scroll item to top of window
		this.container.parentNode.scrollTop = elTop;
	}
}
	
// tree clicking event handler
tree.prototype.handleSelect = function(event) {
	var targ = event.target;
	while(!targ.getAttributeNS(anigenNS, 'originalid') && !(targ instanceof HTMLUListElement)) {
		targ = targ.parentNode;
	}
	if((targ instanceof HTMLUListElement)) { return; }
	svg.select(targ.getAttributeNS(anigenNS, 'originalid'));
	event.stopPropagation();
}

tree.prototype.handleToggle = function(event) {
	var targ = event.target;
	while(!targ.shepherd && !(targ instanceof HTMLUListElement)) {
		targ = targ.parentNode;
	}
	if((targ instanceof HTMLUListElement)) { return; }
	targ.shepherd.toggle();
	event.stopPropagation();
}