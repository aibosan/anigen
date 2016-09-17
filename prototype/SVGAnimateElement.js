/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for SVG "animate" element
 */

SVGAnimateElement.prototype.generateAnchors = function() {
	if(this.getAttribute('attributeName') == 'd' && windowAnimation.selected.length != 0) {
		svg.ui.selectionBox.hide();
		this.getValues();
		var CTM = this.parentNode.getCTMBase();
		var transform = CTM.toString();
		
		var zero = CTM.toViewport(0,0);
		var one = CTM.toViewport(1,1);
		var ratio = Math.sqrt((one.x-zero.x)*(one.x-zero.x)+(one.y-zero.y)*(one.y-zero.y));
		
		var nodeTypes = this.parentNode.getAttribute('sodipodi:nodetypes');
		
		var allAnchors = [];
		var allConnectors = [];
		var allPaths = [];
		
		var lastAnchors;
		var currentAnchors;
		var firstAnchors;
		var lastPath;
		
		for(var i = 0; i < windowAnimation.selected.length; i++) {
			if(i == 0 || this.values[windowAnimation.selected[i]] != this.values[windowAnimation.selected[i-1]]) {
				lastPath = document.createElementNS(svgNS, 'path');
				lastPath.setAttribute('d', this.values[windowAnimation.selected[i]]);
				lastPath.setAttribute('transform', transform);
				lastPath.setAttribute("anigen:lock", "interface");
				if(nodeTypes != null) {
					lastPath.setAttribute('sodipodi:nodetypes', nodeTypes);
				}
				lastPath.setAttribute('style', 'fill:none;stroke:#aa0000;stroke-width:'+2/(ratio*svg.zoom)+'px');
				currentAnchors = lastPath.generateAnchors();
				
				if(firstAnchors == null) { firstAnchors = currentAnchors; }
				
				if(windowAnimation.selected.length != 1 && i == windowAnimation.selected.length-1 && this.values[windowAnimation.selected[i]] == this.values[windowAnimation.selected[0]]) {
					currentAnchors = firstAnchors;
				} else {
					allAnchors = allAnchors.concat(currentAnchors.anchors);
					allConnectors = allConnectors.concat(currentAnchors.connectors);
					allPaths.push(lastPath);
				}
			} else {
				currentAnchors = lastAnchors;
			}
			for(var j = 0; j < currentAnchors.anchors[0].length; j++) {
				currentAnchors.anchors[0][j].bound = this;
				currentAnchors.anchors[0][j].actions.move += 'bound.setValue('+windowAnimation.selected[i]+', this.element.getAttribute("d"), true);';
				currentAnchors.anchors[0][j].actions.mouseup = '';
			}
			if(anigenActual.settings.get('linesAnimationStates') && lastAnchors && currentAnchors && currentAnchors != lastAnchors) {
				for(var j = 0; j < currentAnchors.anchors[0].length; j++) {
					var slave = new connector(currentAnchors.anchors[0][j], lastAnchors.anchors[0][j], '#00aa00');
					allConnectors.push(slave);
				}
			}
			lastAnchors = currentAnchors;
		}
		
		return { 'connectors': allConnectors, 'anchors': allAnchors, 'paths': allPaths };
	}
}