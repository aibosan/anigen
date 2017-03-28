/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for SVG "path" element
 */
 
// implements .getPathData
// returns object with "baseVal" and "animVal", both instances of pathSegList
//		- "baseVal" is the element's normalized, absolute path data
//		- "animVal" is the element's normalized, absolute path data as set by its animation (if any)
//			if element has no animation of "d" attribute, "animVal" is a clone of "baseVal"
SVGPathElement.prototype.getPathData = function() {
	this.pathData = { 'baseVal': null, 'animVal': null }
	
	// baseVal
	this.pathData.baseVal = new pathSegList();
	
	
	// this works, but it makes the path flicker between static and animated states (TODO)	
	/*
	// remove all animations
	var animArray = [];
	var nextArray = [];
	for(var i = 0; i < this.children.length; i++) {
		if(this.children[i] instanceof SVGAnimateElement && this.children[i].getAttribute('attributeName') == 'd') {
			nextArray.push(this.children[i].nextElementSibling);
			animArray.push(this.children[i]);
		}
	}
	for(var i = 0; i < animArray.length; i++) { this.removeChild(animArray[i]); }
	
	var path = this.getAttribute('d') || '';
	
	// put them back
	animArray.reverse();
	nextArray.reverse();
	for(var i = 0; i < animArray.length; i++) {
		if(nextArray[i]) {
			this.insertBefore(animArray[i], nextArray[i]);
		} else {
			this.appendChild(animArray[i], nextArray[i]);
		}
	}
	
	*/
	
	var path = this.getAttribute('d') || '';
	path = path.replace(/,/g, ' ').replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
	path = path.split(' ');
	
	var absolute = true;
	var lastAbsolute = { x: 0, y: 0 };
	var lastMCoordinate = { x: 0, y: 0 };
	var lastLetter = null;
	var error = false;
	
	for(var i = 0; i < path.length; i++) {
		if(isNaN(path[i])) {
			lastLetter = path[i];
			absolute = (path[i].toUpperCase() == path[i]);
			i++;
		}
		if(!lastLetter) { error = true; break; }
		
		var segment = [];
		var pathSegment = null;
		
		switch(lastLetter.toLowerCase()) {
			case 'm':		// moveto
				//lastAbsolute = lastMCoordinate;
				if(i+1 >= path.length) { error = true; break; }
				if(absolute || i == 1) {
					segment = [
						'M',
						parseFloat(path[i]),
						parseFloat(path[i+1])
					];
				} else {
					segment = [
						'M',
						lastAbsolute.x + parseFloat(path[i]),
						lastAbsolute.y + parseFloat(path[i+1])
					];
				}
				lastLetter = absolute ? 'L' : 'l';
				lastAbsolute = { 'x': segment[1], 'y': segment[2] };
				lastMCoordinate = { 'x': segment[1], 'y': segment[2] };
				i += 1;
				break;
			case 'l':		// lineto
			case 't':		// shorthand quadratic
				if(i+1 >= path.length) { error = true; break; }
				if(absolute) {
					segment = [
						lastLetter.toUpperCase(),
						parseFloat(path[i]),
						parseFloat(path[i+1])
					]
				} else {
					segment = [
						lastLetter.toUpperCase(),
						lastAbsolute.x + parseFloat(path[i]),
						lastAbsolute.y + parseFloat(path[i+1])
					];
				}
				lastAbsolute = { 'x': segment[1], 'y': segment[2] };
				i += 1;
				break;
			case 'z':		// closepath
				segment = [ 'Z' ];
				lastAbsolute = lastMCoordinate;
				i -= 1;
				break;
			case 'h':		// horizontal lineto
				if(absolute) {
					segment = [
						'L',
						parseFloat(path[i]),
						lastAbsolute.y
					]
				} else {
					segment = [
						'L',
						lastAbsolute.x + parseFloat(path[i]),
						lastAbsolute.y
					];
				}
				lastAbsolute = { 'x': segment[1], 'y': segment[2] };
				break;
			case 'v':		// vertical lineto
				if(absolute || (lastLetter.toLowerCase() == 'm' && i == 0)) {
					segment = [
						'L',
						lastAbsolute.x,
						parseFloat(path[i])
						
					]
				} else {
					segment = [
						'L',
						lastAbsolute.x,
						lastAbsolute.y + parseFloat(path[i])
					];
				}
				lastAbsolute = { 'x': segment[1], 'y': segment[2] };
				break;
			case 'c':		// curveto
				if(i+5 >= path.length) { error = true; break; }
				if(absolute) {
					segment = [
						'C',
						parseFloat(path[i]),
						parseFloat(path[i+1]),
						parseFloat(path[i+2]),
						parseFloat(path[i+3]),
						parseFloat(path[i+4]),
						parseFloat(path[i+5])
						
					]
				} else {
					segment = [
						'C',
						lastAbsolute.x + parseFloat(path[i]),
						lastAbsolute.y + parseFloat(path[i+1]),
						lastAbsolute.x + parseFloat(path[i+2]),
						lastAbsolute.y + parseFloat(path[i+3]),
						lastAbsolute.x + parseFloat(path[i+4]),
						lastAbsolute.y + parseFloat(path[i+5])
					];
				}
				lastAbsolute = { 'x': segment[5], 'y': segment[6] };
				i += 5;
				break;
			case 's':		// shorthand curveto
			case 'q':		// quadratic curveto
				if(i+3 >= path.length) { error = true; break; }
				if(absolute) {
					segment = [
						lastLetter.toUpperCase(),
						parseFloat(path[i]),
						parseFloat(path[i+1]),
						parseFloat(path[i+2]),
						parseFloat(path[i+3])
					]
				} else {
					segment = [
						lastLetter.toUpperCase(),
						lastAbsolute.x + parseFloat(path[i]),
						lastAbsolute.y + parseFloat(path[i+1]),
						lastAbsolute.x + parseFloat(path[i+2]),
						lastAbsolute.y + parseFloat(path[i+3])
					];
				}
				lastAbsolute = { 'x': segment[3], 'y': segment[4] };
				i += 3;
				break;
			case 'a':		// elliptical arc
				if(i+6 >= path.length) { error = true; break; }
				if(absolute) {
					segment = [
						lastLetter.toUpperCase(),
						parseFloat(path[i]),
						parseFloat(path[i+1]),
							parseFloat(path[i+2]),
							parseInt(path[i+3]),
							parseInt(path[i+4]),
						parseFloat(path[i+5]),
						parseFloat(path[i+6])
						
					]
				} else {
					segment = [
						lastLetter.toUpperCase(),
								parseFloat(path[i]),
								parseFloat(path[i+1]),
								parseFloat(path[i+2]),
								parseInt(path[i+3]),
								parseInt(path[i+4]),
							lastAbsolute.x + parseFloat(path[i+5]),
							lastAbsolute.y + parseFloat(path[i+6])
					];
				}
				lastAbsolute = { 'x': segment[6], 'y': segment[7] };
				i += 6;
				break;
			default:
				error = true;
				break;
		}
		
		if(error) { break; }
		
		switch(segment[0].toLowerCase()) {
			case 'm':		// moveto
				pathSegment = new pathSegMoveto(segment[1], segment[2]);
				break;
			case 'l':		// lineto
				pathSegment = new pathSegLineto(segment[1], segment[2]);
				break;
			case 't':		// shorthand quadratic
				pathSegment = new pathSegCurvetoQuadraticSmooth(segment[1], segment[2]);
				break;
			case 'z':		// closepath
				pathSegment = new pathSegClosepath();
				break;
			case 'h':		// horizontal lineto
				pathSegment = new pathSegLinetoHorizontal(segment[1]);
				break;
			case 'v':		// vertical lineto
				pathSegment = new pathSegLinetoVertical(segment[1]);
				break;
			case 'c':		// curveto
				pathSegment = new pathSegCurvetoCubic(segment[1], segment[2], segment[3], segment[4], segment[5], segment[6]);
				break;
			case 's':		// shorthand curveto
				pathSegment = new pathSegCurvetoCubicSmooth(segment[1], segment[2], segment[3], segment[4]);
				break;
			case 'q':		// quadratic curveto
				pathSegment = new pathSegCurvetoQuadratic(segment[1], segment[2], segment[3], segment[4]);
				break;
			case 'a':		// elliptical arc
				pathSegment = new pathSegArc(segment[1], segment[2], segment[3], segment[4], segment[5], segment[6], segment[7]);
				break;
		}
		if(!pathSegment) { error = true; break; }
		this.pathData.baseVal.appendItem(pathSegment);
	}
	this.setAttribute('d', this.pathData.baseVal);
	
	// animVal
	for(var i = 0; i < this.children.length; i++) {
		if(this.children[i] instanceof SVGAnimateElement && this.children[i].getAttribute('attributeName') == 'd') {
			if(this.pathData.animVal == null || this.children[i].getAttribute('additive') != 'sum') {
				this.pathData.animVal = this.children[i].getCurrentValue();
				if(this.children[i].getAttribute('additive') == 'sum') {
					this.pathData.animVal.sum(this.pathData.baseVal);
				}
			} else {
				this.pathData.animVal.sum(this.children[i].getCurrentValue())
			}
		}
	}
	
	if(this.pathData.animVal == null) {
		this.pathData.animVal = this.pathData.baseVal;
	}
	
	return this.pathData;
}

// sets "d" attribute from given pathSegList object
SVGPathElement.prototype.setPathData = function(pathData, makeHistory) {
	if(!this.pathData || !(pathData.baseVal instanceof pathSegList)) { return; }
	
	this.pathData = pathData;
	
	var oldD = this.getAttribute('d');
	var newD = this.pathData.baseVal.toString();
	
	var hasAnimD = false;
	for(var i = 0; i < this.children.length; i++) {
		if(this.children[i] instanceof SVGAnimateElement && this.children[i].getAttribute('attributeName') == 'd') {
			hasAnimD = true;
			break;
		}
	}
	
	if(makeHistory && svg && svg.history) {
		if(hasAnimD) {
			svg.history.add(new historyAttribute(this.id, 
				{ 'd': oldD, 'anigen:original-d': this.getAttribute('anigen:orginal-d') },
				{ 'd': newD, 'anigen:original-d': newD },	
				true));
		} else {
			svg.history.add(new historyAttribute(this.id, 
				{ 'd': oldD },
				{ 'd': newD },	
				true));
		}
	}
	
	this.setAttribute('d', newD);
}

// sets "d" attribute from string and attempts to parse the new vaue with .getPathData
SVGPathElement.prototype.setD = function(newData) {
	this.setAttribute('d', newData);
	this.getPathData();
}

// moves pathSeg object of given index to given (toX, toY) coordinates
// point, handle1, handle2 are booleans which guide which of the segment's values should move;
//	[x,y], [x1, y1], and [x2, y2] respecively
// throws DOMException if index is out of bounds
SVGPathElement.prototype.moveTo = function(index, toX, toY, point, handle1, handle2, makeHistory) {
	if(!this.pathData) { this.getPathData(); }
	if(index < 0 || index >= this.pathData.length) { throw new DOMException(1); }
	this.pathData.baseVal.getItem(index).moveTo(toX, toY, point, handle1, handle2);
	this.setPathData(this.pathData, makeHistory);
}
	
// moves pathSeg object of given index by given (byX, byY) delta coordinates
// point, handle1, handle2 are booleans which guide which of the segment's values should move;
//	[x,y], [x1, y1], and [x2, y2] respecively
// throws DOMException if index is out of bounds
SVGPathElement.prototype.moveBy = function(index, byX, byY, point, handle1, handle2, makeHistory) {
	if(!this.pathData) { this.getPathData(); }
	if(index < 0 || index >= this.pathData.length) { throw new DOMException(1); }
	this.pathData.baseVal.getItem(index).moveBy(byX, byY, point, handle1, handle2);
	this.setPathData(this.pathData, makeHistory);
}


// returns pathSegList corresponding to an inbetween of given <0;1> ratio of this and other path
// this means the interpolation of the two paths; if paths cannot be interpolated between
// (they have different number or type of segments), either this (ratio <= 0.5) or other (ratio > 0.5) path is given
SVGPathElement.prototype.inbetween = function(other, ratio) {
	if(!(other instanceof SVGPathElement)) { return; }
	
	var otherData = other.getPathData();
	var pathData = this.getPathData();
	
	if(other.pathData.baseVal.length != pathData.baseVal.length) { 
		if(ratio <= 0.5) {
			return pathData.baseVal;
		} else {
			return otherData.baseVal;
		}
	}
	
	var out = new pathSegList();
	for(var i = 0; i < pathData.baseVal.length; i++) {
		try {
			out.appendItem(pathData.baseVal.getItem(i).inbetween(otherData.baseVal.getItem(i), ratio));
		} catch(er) {
			if(ratio <= 0.5) {
				console.warn(er, 'Defaulting to path 1.');
				return pathData.baseVal;
			} else {
				console.warn(er, 'Defaulting to path 2.');
				return otherData.baseVal;
			}
		}
	}
	return out;
}

// returns object with "connectors" (connector objects) and "anchors" (anchor) objects which can be used for the UI
SVGPathElement.prototype.generateAnchors = function(offset) {
	if(!offset) { offset = { 'x': 0, 'y': 0 }; }
	var anchors = [];
	var connectors = [];
	
	var CTM = this.getCTMBase();
			
	var lastPoint = null;
	var lastH2 = null;
	
	var lastM = null;
	var lastMIndex = null;
	var firstH1 = null;
	var firstH1Index = null;
	var lastH2 = null;
	var lastH2Index = null;
	var zCounter = 0;
	
	var threshold = 0.01;
	
	var pathData = this.getPathData().baseVal;
	var nodeTypes = this.getAttribute('sodipodi:nodetypes');
	
	for(var i = 0; i < pathData.length; i++) {
		var pData = pathData.arr[i];
		var segmentAnchors = { };
		
		if(pData.x1 != null && pData.y1 != null) {
			var adjustedXY1 = CTM.toViewport(pData.x1, pData.y1);
			segmentAnchors.handle1 = new anchor({'x': adjustedXY1.x, 'y': adjustedXY1.y }, this, 'circle', 
				{ 'move': 'this.element.moveBy('+i+', dRelative.x, dRelative.y, false, true, false, true);' });
		}
		
		if(pData.x2 != null && pData.y2 != null) {
			var adjustedXY2 = CTM.toViewport(pData.x2, pData.y2);
			segmentAnchors.handle2 = new anchor({'x': adjustedXY2.x, 'y': adjustedXY2.y }, this, 'circle',
				{ 'move': 'this.element.moveBy('+i+', dRelative.x, dRelative.y, false, false, true, true);' });
		}
		
		if(pData.x != null && pData.y != null) {
			var adjustedXY = CTM.toViewport(pData.x, pData.y);
			var nodeShape = 'diamond';
			if(nodeTypes && nodeTypes[i-zCounter]) {
				if(nodeTypes[i-zCounter] == 's') { nodeShape = 'rectangle'; }		// smooth
				if(nodeTypes[i-zCounter] == 'z') { nodeShape = 'rectangle'; }		// symmetrical
				if(nodeTypes[i-zCounter] == 'a') { nodeShape = 'circle'; }			// auto-smooth
			}
			segmentAnchors.point = new anchor({'x': adjustedXY.x, 'y': adjustedXY.y }, this, nodeShape,
				{ 'move': 'this.element.moveTo('+i+', relative.x, relative.y, true, false, true, true);',
					'click': 'if(keys.ctrlKey){this.element.cycleNodeType('+(i-zCounter)+', true);};svg.select();' });
		}
		
		if(lastPoint && segmentAnchors.handle1) {
			var constraint = new constraintLinear(lastPoint, segmentAnchors.handle1, { 'optional': true });
			segmentAnchors.handle1.constraint = constraint;
		}
		if(segmentAnchors.point && segmentAnchors.handle2) {
			var constraint = new constraintLinear(segmentAnchors.point, segmentAnchors.handle2, { 'optional': true });
			segmentAnchors.handle2.constraint = constraint;
		}
		
		for(var j in segmentAnchors) {
			switch(j) {
				case 'point':
					lastPoint = segmentAnchors[j];
					
					if(pData.pathSegTypeAsLetter.toLowerCase() == 'l' || pData.pathSegTypeAsLetter.toLowerCase() == 'z' || 
						pData.pathSegTypeAsLetter.toLowerCase() == 'h' || pData.pathSegTypeAsLetter.toLowerCase() == 'v') {
							lastH1 = null;
							lastH2 = null;
							break;
					}
					
					if(lastH2) {		// if previous handle 2 exists, it is added to point's children (but action already exists)
						var slave = new connector(lastPoint, lastH2);
						lastPoint.addChild(lastH2);
						//lastPoint.actions.move += 'this.element.moveBy('+(i)+', dRelative.x, dRelative.y, false, false, true, true);';
						connectors.push(slave);
					}
					break;
				case 'handle2':
					segmentAnchors[j].selectable = false;
					lastH2 = segmentAnchors[j];
					lastH2Index = i;
					break;
				case 'handle1':
					if(!firstH1) {
						firstH1 = segmentAnchors[j];
						firstH1Index = i;
					}
				
					segmentAnchors[j].selectable = false;
					var thisPoint = segmentAnchors[j];
					if(lastPoint) {		// if last point exists, handle 1 is added to its children and to the actions
						var slave = new connector(lastPoint, thisPoint);
						lastPoint.addChild(thisPoint);
						lastPoint.actions.move += 'this.element.moveBy('+(i)+', dRelative.x, dRelative.y, false, true, false, true);';
						connectors.push(slave);
					}
					if(lastH2 && i > 0 && nodeTypes && nodeTypes[i-1-zCounter]) {		// if last handle2 exists...
						switch(nodeTypes[i-1-zCounter]) {
							case 'a':	// auto-smooth
							case 's':	// smooth
								lastH2.bound = thisPoint;
								lastH2.center = lastPoint;
								thisPoint.bound = lastH2;
								thisPoint.center = lastPoint;
								lastH2.actions.moveLocal = thisPoint.actions.moveLocal = 'var angle = this.getAngle()+180;var out = this.bound.setAngle(angle);this.bound.evaluate(out.absolute, out.dAbsolute, out.relative, out.dRelative);'
								break;
							case 'z':	// symmetrical
								lastH2.bound = thisPoint;
								lastH2.center = lastPoint;
								thisPoint.bound = lastH2;
								thisPoint.center = lastPoint;
								lastH2.actions.moveLocal = thisPoint.actions.moveLocal = 'var distance = { "x": this.x-this.center.x, "y": this.y-this.center.y }; var out = this.bound.setPosition(this.center.x-distance.x, this.center.y-distance.y);this.bound.evaluate(out.absolute, out.dAbsolute, out.relative, out.dRelative);';
								break;
						}
						if(nodeTypes[i-1-zCounter] == 'a') {
							lastH2.actions.move += 'this.element.setNodeType('+(i-1-zCounter)+', "s", true);'
							thisPoint.actions.move += 'this.element.setNodeType('+(i-1-zCounter)+', "s", true);'
						}
					}
					break;
				}
				
			//segmentAnchors[j].actions.mouseup = 'svg.gotoTime();svg.select();'
			anchors.push(segmentAnchors[j]);
		}
		
		
		// resets to prevent skipping over a node
		if(!segmentAnchors.point) { lastPoint = null; }
		if(!segmentAnchors.handle2) { lastH2 = null; }
		
		
		
		if(pathData.arr[i] instanceof pathSegMoveto) {
			lastMIndex = i;
			lastM = segmentAnchors;
			firstH1 = null;
			firstH1Index = null;
			lastH2 = null;
			lastH2Index = null;
		}
		
		// node merger
		if(pathData.arr[i+1] && pathData.arr[i+1] instanceof pathSegClosepath) {
			
			if(nodeTypes && firstH1 && lastH2 && nodeTypes[lastMIndex-zCounter] == nodeTypes[lastH2Index-zCounter] && nodeTypes[lastMIndex-zCounter]) {
				switch(nodeTypes[lastH2Index-zCounter]) {
					case 'a':	// auto-smooth
					case 's':	// smooth
						lastH2.bound = firstH1;
						lastH2.center = lastPoint;
						firstH1.bound = lastH2;
						firstH1.center = lastPoint;
						lastH2.actions.moveLocal = firstH1.actions.moveLocal = 'var angle = this.getAngle()+180;var out = this.bound.setAngle(angle);this.bound.evaluate(out.absolute, out.dAbsolute, out.relative, out.dRelative);'
						break;
					case 'z':	// symmetrical
						lastH2.bound = firstH1;
						lastH2.center = lastPoint;
						firstH1.bound = lastH2;
						firstH1.center = lastPoint;
						lastH2.actions.moveLocal = firstH1.actions.moveLocal = 'var distance = { "x": this.x-this.center.x, "y": this.y-this.center.y }; var out = this.bound.setPosition(this.center.x-distance.x, this.center.y-distance.y);this.bound.evaluate(out.absolute, out.dAbsolute, out.relative, out.dRelative);';
						break;	
				}
			}
			zCounter++;
			
			
			if(lastM.point && lastPoint && lastM.point != lastPoint && Math.abs(lastM.point.x-lastPoint.x) < threshold && Math.abs(lastM.point.y-lastPoint.y) < threshold) {
				lastM.point.actions.move += lastPoint.actions.move;
				lastM.point.actions.click += lastPoint.actions.click;
				for(var k = 0; k < lastPoint.children.length; k++) {
					lastM.point.addChild(lastPoint.children[k]);
				}
				for(var k = 0; k < lastPoint.connectors.length; k++) {
					lastPoint.connectors[k].pointA = lastM.point;
					lastM.point.addConnector(lastPoint.connectors[k]);
				}
				for(var k = anchors.length-1; k >= 0; k--) {
					if(anchors[k] == lastPoint) {
						anchors.splice(k, 1);
						break;
					}
				}
				i++;
			}
			
			lastMIndex = null;
			lastM = null;
			firstH1 = null;
			firstH1Index = null;
			lastH2 = null;
			lastH2Index = null;
		}
	}
	
	return { 'connectors': connectors, 'anchors': [ anchors ] };
}

// moves path so that its first pathSegMoveto is at [0,0]; all other points are moved to stay at the same relative positions
SVGPathElement.prototype.setStartAtZero = function() {
	this.getPathData();
	if(!this.pathData.baseVal.getItem(0)) { return; }
	this.moveAllBy(-1*this.pathData.baseVal.getItem(0).x, -1*this.pathData.baseVal.getItem(0).y);
}

// moves all path's segments by given (dX, dY) delta
SVGPathElement.prototype.moveAllBy = function(dX, dY) {
	if(dX == null || dY == null) { return; }
	
	this.getPathData();
	
	for(var i = 0; i < this.pathData.baseVal.length; i++) {
		this.pathData.baseVal.getItem(i).moveBy(dX, dY, true, true, true);
	}
	
	this.setAttribute('d', this.pathData.baseVal);
}

// changes node type at given index to given letter
// 		-> c -> s -> a -> z ->
// corner, smooth, auto-smooth, symmetrical
// creates sodipodi:nodetypes attribute if there is none (all nodes are corner nodes)
SVGPathElement.prototype.setNodeType = function(index, letter, makeHistory) {
	var nodeTypes = this.getAttribute('sodipodi:nodetypes');
	if(!nodeTypes) {
		this.getPathData();
		nodeTypes = "";
		for(var i = 0; i < this.pathData.baseVal.length; i++) {
			nodeTypes += 'c';
		}
	}
	
	if(!this.pathData) { this.getPathData(); }
	
	var zCounter = 0;
	for(var i = 0; i < index; i++) {
		if(!this.pathData.baseVal.arr[i]) { return; }
		if(this.pathData.baseVal.arr[i] instanceof pathSegClosepath) { zCounter++; }
	}
	
	if(index < 0 || index >= nodeTypes.length) { throw new DOMException(1); }
	nodeTypes = nodeTypes.split('');
	if(nodeTypes[index] == letter) {
		return;
	} else {
		nodeTypes[index] = letter;
	}
	nodeTypes = nodeTypes.join('');
	
	index += zCounter;
	
	var point, handle1, handle2;
	point = handle2 = this.pathData.baseVal.getItem(index);
	if(index < this.pathData.baseVal.arr.length-1 && !(this.pathData.baseVal.getItem(index+1) instanceof pathSegClosepath)) {
		handle1 = this.pathData.baseVal.getItem(index+1);
	} else if(this.pathData.baseVal.getItem(index+1) instanceof pathSegClosepath) {
		for(var i = index; i >= 0; i--) {
			if(this.pathData.baseVal.arr[i] instanceof pathSegMoveto) {
				handle1 = this.pathData.baseVal.getItem(i+1);
				break;
			}
		}
	}
	if(point && point.x != null && point.y != null &&
		handle1 && handle1.x1 != null && handle1.y1 != null &&
		handle2 && handle2.x2 != null && handle2.y2 != null) {
		
		
		switch(letter) {
			case 'z':		// symetrical
			case 's':		// smooth
				var vHandle1 = { 'x': handle1.x1 - point.x, 'y': handle1.y1 - point.y };
				var vHandle2 = { 'x': handle2.x2 - point.x, 'y': handle2.y2 - point.y };
				var rHandle1 = Math.sqrt(vHandle1.x*vHandle1.x + vHandle1.y*vHandle1.y);
				var rHandle2 = Math.sqrt(vHandle2.x*vHandle2.x + vHandle2.y*vHandle2.y);
				var aHandle1 = Math.atan2(vHandle1.y, vHandle1.x);
				if(aHandle1 < 0) { aHandle1 += 2*Math.PI; }
				var aHandle2 = Math.atan2(vHandle2.y, vHandle2.x);
				if(aHandle2 < 0) { aHandle2 += 2*Math.PI; }
				var fSwitch = false;
				var aH1PH2 = aHandle2 >= aHandle1 ? aHandle2 - aHandle1 : aHandle1 - aHandle2;
				if(aH1PH2 > Math.PI) { aH1PH2 = 2*Math.PI - aH1PH2; fSwitch = !fSwitch; }
				var aDelta = (Math.PI-aH1PH2)/2;
				if(fSwitch) {
					aHandle1 += aDelta;
					aHandle2 -= aDelta;
				} else {
					aHandle1 -= aDelta;
					aHandle2 += aDelta;
				}
				if(letter == 'z') {
					rHandle1 = rHandle2 = (rHandle1+rHandle2)/2
				}
				handle1.x1 = point.x + rHandle1*Math.cos(aHandle1);
				handle1.y1 = point.y + rHandle1*Math.sin(aHandle1);
				handle2.x2 = point.x + rHandle2*Math.cos(aHandle2);
				handle2.y2 = point.y + rHandle2*Math.sin(aHandle2);
				break;
			case 'a':		// auto-smooth
				// TODO: too complex and niche
				break;
		}
	}
	
	if(makeHistory) {
		this.setAttributeHistory({ 'sodipodi:nodetypes': nodeTypes });
	} else {
		this.setAttribute('sodipodi:nodetypes', nodeTypes);
	}
	
	
	this.setPathData(this.pathData, makeHistory);
}

// cycles through node type at given index
// 		-> c -> s -> a -> z ->
// corner, smooth, auto-smooth, symmetrical
// TODO: finish autosmooth nodes, currently only
// 		-> c -> s -> z ->
SVGPathElement.prototype.cycleNodeType = function(index, makeHistory) {
	
	var nodeTypes = this.getAttribute('sodipodi:nodetypes');
	
	if(!nodeTypes) {
		this.getPathData();
		nodeTypes = "";
		for(var i = 0; i < this.pathData.baseVal.length; i++) {
			nodeTypes += 'c';
		}
	}
	if(index < 0 || index >= nodeTypes.length) { throw new DOMException(1); }
	nodeTypes = nodeTypes.split('');
	switch(nodeTypes[index]) {
		case 'c':
			this.setNodeType(index, 's', makeHistory);
			break;
		case 's':
//			this.setNodeType(index, 'a', makeHistory);	// no autosmooth functionality available now
			this.setNodeType(index, 'z', makeHistory);
			break;
		case 'a':
			this.setNodeType(index, 'z', makeHistory);
			break;
		case 'z':
			this.setNodeType(index, 'c', makeHistory);
			break;
	}
}


SVGPathElement.prototype.negate = function() {
	this.getPathData();
	for(var i = 0; i < this.pathData.baseVal.length; i++) {
		this.pathData.baseVal.arr[i].negate();
	}
	this.setD(this.pathData.baseVal);
}

SVGPathElement.prototype.sum = function(other) {
	if(!(other instanceof SVGPathElement)) { return; }
	
	this.getPathData();
	other.getPathData();
	
	if(this.pathData.baseVal.arr.length != other.pathData.baseVal.arr.length) { return; }
	
	this.pathData.baseVal.sum(other.pathData.baseVal);
	
	this.setD(this.pathData.baseVal);
	return this.pathData.baseVal.toString();
}



// returns element's center - the middle of the positions of all of its control points
// if viewport is true, the value given will be adjusted so that the original viewport value is given
// (according to the element's complete transformation matrix)
SVGPathElement.prototype.getCenter = function(viewport) {
	var xMax, xMin, xMax_anim, xMin_anim;
	var yMax, yMin, yMax_anim, yMin_anim;
	
	var pathData = this.getPathData();
	
	var lastBase;
	var lastAnim;
	
	var CTM = this.getCTMBase();
	var CTMAnim = this.getCTMAnim();
	
	for(var i = 0; i < pathData.baseVal.length; i++) {
		var item = pathData.baseVal.getItem(i);
		var itemAnim = pathData.animVal.getItem(i);
		
		var adjusted;
		
		if(item.x != null && item.y != null) {
			adjusted = viewport ? CTM.toViewport(item.x, item.y) : { 'x': item.x, 'y': item.y };
			if(xMin == null || xMin > adjusted.x) { xMin = adjusted.x; }
			if(xMax == null || xMax < adjusted.x) { xMax = adjusted.x; }
			if(yMin == null || yMin > adjusted.y) { yMin = adjusted.y; }
			if(yMax == null || yMax < adjusted.y) { yMax = adjusted.y; }
		}
		if(item.x1 != null && item.y1 != null) {
			adjusted = viewport ? CTM.toViewport(item.x1, item.y1) : { 'x': item.x1, 'y': item.y1 };
			if(xMin == null || xMin > adjusted.x) { xMin = adjusted.x; }
			if(xMax == null || xMax < adjusted.x) { xMax = adjusted.x; }
			if(yMin == null || yMin > adjusted.y) { yMin = adjusted.y; }
			if(yMax == null || yMax < adjusted.y) { yMax = adjusted.y; }
		}
		if(item.x2 != null && item.y2 != null) {
			adjusted = viewport ? CTM.toViewport(item.x2, item.y2) : { 'x': item.x2, 'y': item.y2 };
			if(xMin == null || xMin > adjusted.x) { xMin = adjusted.x; }
			if(xMax == null || xMax < adjusted.x) { xMax = adjusted.x; }
			if(yMin == null || yMin > adjusted.y) { yMin = adjusted.y; }
			if(yMax == null || yMax < adjusted.y) { yMax = adjusted.y; }
		}
		
		if(itemAnim.x != null && itemAnim.y != null) {
			adjusted = viewport ? CTMAnim.toViewport(itemAnim.x, itemAnim.y) : { 'x': itemAnim.x, 'y': itemAnim.y };
			if(xMin_anim == null || xMin_anim > adjusted.x) { xMin_anim = adjusted.x; }
			if(xMax_anim == null || xMax_anim < adjusted.x) { xMax_anim = adjusted.x; }
			if(yMin_anim == null || yMin_anim > adjusted.y) { yMin_anim = adjusted.y; }
			if(yMax_anim == null || yMax_anim < adjusted.y) { yMax_anim = adjusted.y; }
		}
		if(itemAnim.x1 != null && itemAnim.y1 != null) {
			adjusted = viewport ? CTMAnim.toViewport(itemAnim.x1, itemAnim.y1) : { 'x': itemAnim.x1, 'y': itemAnim.y1 };
			if(xMin_anim == null || xMin_anim > adjusted.x) { xMin_anim = adjusted.x; }
			if(xMax_anim == null || xMax_anim < adjusted.x) { xMax_anim = adjusted.x; }
			if(yMin_anim == null || yMin_anim > adjusted.y) { yMin_anim = adjusted.y; }
			if(yMax_anim == null || yMax_anim < adjusted.y) { yMax_anim = adjusted.y; }
		}
		if(itemAnim.x2 != null && itemAnim.y2 != null) {
			adjusted = viewport ? CTMAnim.toViewport(itemAnim.x2, itemAnim.y2) : { 'x': itemAnim.x2, 'y': itemAnim.y2 };
			if(xMin_anim == null || xMin_anim > adjusted.x) { xMin_anim = adjusted.x; }
			if(xMax_anim == null || xMax_anim < adjusted.x) { xMax_anim = adjusted.x; }
			if(yMin_anim == null || yMin_anim > adjusted.y) { yMin_anim = adjusted.y; }
			if(yMax_anim == null || yMax_anim < adjusted.y) { yMax_anim = adjusted.y; }
		}
	}
	
	if(xMax == null || xMin == null || yMax == null || yMin == null) { return; }
	
	var cx = xMin+(xMax-xMin)/2;
	var cy = yMin+(yMax-yMin)/2;
	var cx_anim = xMin_anim+(xMax_anim-xMin_anim)/2;
	var cy_anim = yMin_anim+(yMax_anim-yMin_anim)/2;
	
	return { 'x': cx, 'y': cy, 'x_anim': cx_anim, 'y_anim': cy_anim,
		'left': xMin, 'right': xMax, 'top': yMin, 'bottom': yMax };
}

SVGPathElement.prototype.consumeTransform = function(matrixIn) {
	var matrix = this.getTransformBase();
	if(matrixIn) {
		matrix = matrixIn.multiply(matrix);
	}
	
	if(this.style.strokeWidth) {
		var oldStroke = parseFloat(this.style.strokeWidth);
		var zero = matrix.toViewport(0,0);
		var one = matrix.toViewport(1,1);
		var ratio = Math.sqrt((one.x-zero.x)*(one.x-zero.x)+(one.y-zero.y)*(one.y-zero.y))/Math.sqrt(2);
		this.style.strokeWidth = ratio*oldStroke;
	}
	
	this.getPathData();
	
	for(var i = 0; i < this.pathData.baseVal.length; i++) {
		this.pathData.baseVal.getItem(i).adjust(matrix);
	}
	
	this.setPathData(this.pathData);
	this.removeAttribute('transform');
}

SVGPathElement.prototype.toPath = function() {
	return this;
}

SVGPathElement.prototype.isVisualElement = function() { return true; }




/*
SVGEllipseElement.prototype.getAbsoluteRectangle = function() {
	var matrix = this.getCTMBase();
	
	var topLeft = matrix.toViewport(this.cx.baseVal.value-this.rx.baseVal.value, this.cy.baseVal.value-this.ry.baseVal.value);
	var botRight = matrix.toViewport(this.cx.baseVal.value+this.rx.baseVal.value, this.cy.baseVal.value+this.ry.baseVal.value);
	
	return {
		'left': Math.min(topLeft.x, botRight.x),
		'right': Math.max(topLeft.x, botRight.x),
		'top': Math.min(topLeft.y, botRight.y),
		'bottom': Math.max(topLeft.y, botRight.y)
	};
}
*/