/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for SVG "animate" element
 */

SVGAnimateElement.prototype.generateAnchors = function() {
	if(this.getAttribute('attributeName') == 'd' && anigenManager.classes.windowAnimation.selected.length != 0) {
		svg.ui.selectionBox.hide();
		this.getKeyframes();
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
		
		var originalPath = document.createElementNS(svgNS, 'path');
			originalPath.setAttribute('d', this.parentNode.getAttribute('d'));
		
		for(var i = 0; i < anigenManager.classes.windowAnimation.selected.length; i++) {
			if(i == 0 || this.keyframes.getItem(anigenManager.classes.windowAnimation.selected[i]).value != this.keyframes.getItem(anigenManager.classes.windowAnimation.selected[i-1]).value) {
				lastPath = document.createElementNS(svgNS, 'path');
				lastPath.setAttribute('d', this.keyframes.getItem(anigenManager.classes.windowAnimation.selected[i]).value);
				lastPath.setAttribute('transform', transform);
				lastPath.setAttribute("anigen:lock", "interface");
				
				if(this.getAttribute('additive') == 'sum') {
					lastPath.sum(originalPath);
				}
				
				
				if(nodeTypes != null) {
					lastPath.setAttribute('sodipodi:nodetypes', nodeTypes);
				}
				lastPath.setAttribute('style', 'fill:none;stroke:#0f0;stroke-width:'+2/(ratio*svg.zoom)+'px');
				lastPath.ratio = ratio;
				lastPath.adjustZoom = function() {
					this.style.strokeWidth = 2/(this.ratio*svg.zoom)+'px';
				}
				currentAnchors = lastPath.generateAnchors();
				
				if(firstAnchors == null) { firstAnchors = currentAnchors; }
				
				if(anigenManager.classes.windowAnimation.selected.length != 1 && i == anigenManager.classes.windowAnimation.selected.length-1 && this.keyframes.getItem(anigenManager.classes.windowAnimation.selected[i]).value == this.keyframes.getItem(anigenManager.classes.windowAnimation.selected[0]).value) {
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
				currentAnchors.anchors[0][j].animation = this;
				currentAnchors.anchors[0][j].actions.move += 'this.animation.setValue('+anigenManager.classes.windowAnimation.selected[i]+', this.element.getAttribute("d"));';
				currentAnchors.anchors[0][j].actions.move += 'this.animation.commit();';
				currentAnchors.anchors[0][j].actions.mouseup = '';
			}
			if(anigenActual.settings.get('progressCurve') && lastAnchors && currentAnchors && currentAnchors != lastAnchors) {
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


SVGAnimateElement.prototype.inbetween = function(one, two, ratio) {
	this.getKeyframes();
	if(two < one) {
		var temp = one;
		one = two;
		two = temp;
		ratio = 1-ratio;
	}
	if(ratio == null) { ratio = 0.5; }
	
	var item1, item2;
	try {
		item1 = this.keyframes.getItem(one);
		item2 = this.keyframes.getItem(two);
	} catch(err) {
		throw err;
	}
	
	var newSpline = null;
	if(item1.spline && item2.spline) {
		newSpline = item1.spline.inbetween(item2.spline, ratio);
	} else {
		if(item1.spline) { newSpline = item1.spline.clone(); }
		else if(item2.spline) { newSpline = item2.spline.clone(); }
	}
	var clone = new keyframe(item1.time+ratio*(item2.time-item1.time), newSpline, '', item1.intensity+ratio*(item2.intensity-item1.intensity));
	
	var p1 = document.createElementNS(svgNS, 'path');
	var p2 = document.createElementNS(svgNS, 'path');
	p1.setAttribute('d', item1.value);
	p2.setAttribute('d', item2.value);
	var pData = p1.inbetween(p2, ratio);
	clone.value = pData.toString();
	
	this.keyframes.push(clone);
	
	this.keyframes.sort();
}

