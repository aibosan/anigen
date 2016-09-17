/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for SVG "animateTransform" element
 */
 
SVGAnimateTransformElement.prototype.getValues = function() {
	this.values = [];
	var temp = this.getAttribute('values');
	if(!temp) { return this.values; }
	temp = temp.split(';');

	switch(this.getAttribute('type')) {
		case "translate":
		case "scale":
			for(var i = 0; i < temp.length; i++) {
				this.values.push(new coordinates(temp[i]));
			}
			break;
		case "rotate":
		case "skewX":
		case "skewY":
			for(var i = 0; i < temp.length; i++) {
				this.values.push(new angle(temp[i]));
			}
			break;
	}
	
	return this.values;
}

SVGAnimateTransformElement.prototype.getValue = function(index) {
	this.getValues();
	if(index < 0 || index >= this.values.length) { throw new DOMException(1); }
	return this.values[index].toString();
}

SVGAnimateTransformElement.prototype.commitValues = function() {
	this.setAttribute('values', this.values.join(';'));
}

SVGAnimateTransformElement.prototype.setX = function(index, value, makeHistory) {
	this.getValues();
	if(index < 0 || index >= this.values.length) { throw new DOMException(1); }
	if(isNaN(parseFloat(value))) { return; }
	value = parseFloat(value);
	
	if(makeHistory && svg && svg.history) {
		svg.history.add(new historyGeneric(this.id, 
			'target.setX('+index+', '+this.values[index].x+');',
			'target.setX('+index+', '+value+');', true));
	}
	
	this.values[index].x = value;
	this.commitValues();
}

SVGAnimateTransformElement.prototype.setY = function(index, value, makeHistory) {
	this.getValues();
	if(index < 0 || index >= this.values.length) { throw new DOMException(1); }
	if(isNaN(parseFloat(value))) { return; }
	value = parseFloat(value);
	
	if(makeHistory && svg && svg.history) {
		svg.history.add(new historyGeneric(this.id, 
			'target.setY('+index+', '+this.values[index].y+');',
			'target.setY('+index+', '+value+');', true));
	}
	
	this.values[index].y = value;
	this.commitValues();
}

SVGAnimateTransformElement.prototype.setPosition = function(index, x, y, makeHistory) {
	this.getValues();
	if(index < 0 || index >= this.values.length) { throw new DOMException(1); }
	if(isNaN(parseFloat(x)) || isNaN(parseFloat(y))) { return; }
	x = parseFloat(x);
	y = parseFloat(y);
	
	if(makeHistory && svg && svg.history) {
		svg.history.add(new historyGeneric(this.id, 
			'target.setPosition('+index+', '+this.values[index].x+', '+this.values[index].y+');',
			'target.setPosition('+index+', '+x+', '+y+');', true));
	}
	
	this.values[index].x = x;
	this.values[index].y = y;
	
	this.commitValues();
}

SVGAnimateTransformElement.prototype.setAngle = function(index, value, makeHistory) {
	this.getValues();
	if(index < 0 || index >= this.values.length) { throw new DOMException(1); }
	if(isNaN(parseFloat(value))) { return; }
	value = parseFloat(value);
	
	if(makeHistory && svg && svg.history) {
		svg.history.add(new historyGeneric(this.id, 
			'target.setAngle('+index+', '+this.values[index].angle+');',
			'target.setAngle('+index+', '+value+');', true));
	}
	
	this.values[index].angle = value;
	this.commitValues();
}

SVGAnimateTransformElement.prototype.getX = function(index) {
	this.getValues();
	if(index < 0 || index >= this.values.length) { throw new DOMException(1); }
	return this.values[index].x;
}

SVGAnimateTransformElement.prototype.getY = function(index) {
	this.getValues();
	if(index < 0 || index >= this.values.length) { throw new DOMException(1); }
	return this.values[index].y;
}

SVGAnimateTransformElement.prototype.getAngle = function(index) {
	this.getValues();
	if(index < 0 || index >= this.values.length) { throw new DOMException(1); }
	return this.values[index].angle;
}

SVGAnimateTransformElement.prototype.isInvertible = function() { return true; }

SVGAnimateTransformElement.prototype.insertValue = function(index, time, value, splineData) {
	switch(this.getAttribute('type')) {
		case "translate":
		case "scale":
			value = new coordinates(value);
			break;
		case "rotate":
		case "skewX":
		case "skewY":
			value = new angle(value);
			break;
		default:
			return;
	}
	
	this.values.splice(index, 0, value);
	this.commitValues();
	
	this.times.splice(index, 0, time);
	this.commitTimes();
	
	if(this.splines) {
		if(!splineData) { splineData = "0 0 1 1"; }
		newSpline = new spline(splineData)
		if(index == 0) { index++; }
		this.splines.splice(index-1, 0, newSpline);
		this.commitSplines();
	}
}

SVGAnimateTransformElement.prototype.invertValues = function(index, makeHistory) {
	this.getValues();
	if(index != null) {
		this.values[index].invert();
	} else {
		for(var i = 0; i < this.values.length; i++) {
			this.values[i].invert();
		}
	}
	
	if(makeHistory) {
		svg.history.add(new historyAttribute(this.id, 
		{ 'values': this.getAttribute('values') },
		{ 'values': this.values.join(';') },	
		true));
	}
	
	this.commitValues();
}

SVGAnimateTransformElement.prototype.duplicateValue = function(index) {
	this.getSplines();
	this.getValues();
	this.getTimes();
	
	if(isNaN(index) || index < 0 || index >= this.values.length) { throw new DOMException(1); }
	
	this.values.splice(index, 0, this.values[index].clone());
	this.commitValues();
	
	this.times.splice(index, 0, this.times[index]);
	this.setAttribute('keyTimes', this.times.join(';'));
	
	if(this.splines) {
		if(index == 0) { index++; }
		this.splines.splice(index-1, 0, this.splines[index-1].clone());
		var temp = [];
		for(var i = 0; i < this.splines.length; i++) {
			temp.push(this.splines[i].toString());
		}
		this.setAttribute('keySplines', temp.join(';'));
	}
}

SVGAnimateTransformElement.prototype.generateAnchors = function() {
	var paths = [];
	var connectors = [];
	var anchors = [];
	var pathData = '';
	
	var CTM = this.getCTMBase();
	
	var center = this.getCenter(true);
	
	var mouseUpAction = "svg.select();"
	
	var threshold = 0.01;
	
	this.getValues();
	
	
	switch(this.getAttribute('type')) {
		case 'translate':
			connectors = [];
			anchors = [];
			
			//svg.ui.setAnchorOffset(center.x, center.y);
			
			var moveAction = "";
			
			var lastAnchor = null;
			
			var firstAnchor = null;
			
			for(var i = 0; i < this.values.length; i++) {
				CTM.e = 0;
				CTM.f = 0;
				
				var adjusted = CTM.toViewport(this.values[i].x, this.values[i].y);
				
				if(lastAnchor && Math.abs(lastAnchor.x - adjusted.x) < threshold && Math.abs(lastAnchor.y - adjusted.y) < threshold) {
					lastAnchor.actions.move += "this.element.setPosition("+i+", relative.x, relative.y, true);";
				} else {
					var constraint;
					if(lastAnchor) {
						constraint = new constraintLinear({ 'x': adjusted.x+center.x, 'y': adjusted.y+center.y }, { 'x': lastAnchor.x+center.x, 'y': lastAnchor.y+center.y }, false, true);
					} else {
						constraint = new constraintPosition({ 'x': adjusted.x+center.x, 'y': adjusted.y+center.y }, true);
					}
				
					var newAnchor = new anchor(adjusted, this, 'rectangle', {
							'move': "this.element.setPosition("+i+", relative.x, relative.y, true);",
							'mouseup': mouseUpAction
							}, constraint);
					newAnchor.setOffset(center.x, center.y);
					
					if(lastAnchor) {
						var slave = new connector(lastAnchor, newAnchor, '#aa0000');
						connectors.push(slave);
					}
					
					anchors.push(newAnchor);
					lastAnchor = newAnchor;
					if(!firstAnchor) { firstAnchor = lastAnchor; }
				}
				
				if(i == this.values.length-1 && firstAnchor && lastAnchor && firstAnchor != lastAnchor && Math.abs(lastAnchor.x - firstAnchor.x) < threshold && Math.abs(lastAnchor.y - firstAnchor.y) < threshold) {
					firstAnchor.addConnector(slave);
					slave.pointB = firstAnchor;
					firstAnchor.actions.move += lastAnchor.actions.move;
					anchors.splice(anchors.length-1, 1);
				}
			}
			anchors = [ anchors ];
			break;
		case 'rotate':
			var initialAngleOffset = this.parentNode.getCTMBase().decompose().rotation;
							
			anchors[0] = [];
			anchors[1] = [];
			
			this.getValues();
			
			if(this.values.length == 0) { break; }
			
			var lastOrigin = null;
			var lastHandle = null;
			
			var firstOrigin = null;
			var firstHandle = null;
			
			for(var i = 0; i < this.values.length; i++) {
				var adjusted = CTM.toViewport(this.values[i].x, this.values[i].y);
				var angle = this.values[i].angle - initialAngleOffset;
				
				if(lastOrigin && Math.abs(lastOrigin.x - adjusted.x) < threshold && Math.abs(lastOrigin.y - adjusted.y) < threshold) {
					// origins are close to one another
					lastOrigin.actions.move += "this.element.setPosition("+i+", relative.x, relative.y, true);";
					
					if(lastHandle && Math.abs(angle - lastHandle.angle) < threshold) {
						// handles are close
						lastHandle.actions.move += "this.element.setAngle("+i+", this.angle, true);";
					} else {
						// handles aren't close
						var handleAnchor = new anchorAngle(originAnchor, center, angle, this, 'circle', {
							'move': "this.element.setAngle("+i+", this.angle, true);",
							'mouseup': mouseUpAction
							});
						anchors[1].push(handleAnchor);
						lastHandle = handleAnchor;
						
						var slave = new connector(lastOrigin, lastHandle);
						
						lastOrigin.addChild(lastHandle);
						
						connectors.push(slave);
						
						var circ = new circleDouble(originAnchor, handleAnchor);
						paths.push(circ);
					}
					
				} else {
					// origins are not close, or last origin isn't defined
					var originConstraint;
					if(lastOrigin) {
						var adjustedPrev = CTM.toViewport(this.values[i-1].x, this.values[i-1].y);
						originConstraint = new constraintLinear({ 'x': adjusted.x+center.x, 'y': adjusted.y+center.y }, { 'x': lastOrigin.x+center.x, 'y': lastOrigin.y+center.y }, false, true);
					} else {
						originConstraint = new constraintPosition({ 'x': adjusted.x+center.x, 'y': adjusted.y+center.y }, true);
					}
					var originAnchor = new anchor(adjusted, this, 'rectangle', {
							'move': "this.element.setPosition("+i+", relative.x, relative.y, true);",
							'mouseup': mouseUpAction
							}, originConstraint);
					anchors[0].push(originAnchor);
					lastOrigin = originAnchor;
					
					var handleAnchor = new anchorAngle(originAnchor, center, angle, this, 'circle', {
						'move': "this.element.setAngle("+i+", this.angle, true);",
						'mouseup': mouseUpAction
						}
						);
					anchors[1].push(handleAnchor);
					
					lastHandle = handleAnchor;
					
					var slave = new connector(lastOrigin, lastHandle);
					lastOrigin.addChild(lastHandle);
					
					connectors.push(slave);
					
					var circ = new circleDouble(originAnchor, handleAnchor);
					paths.push(circ);
				}
				if(!firstOrigin) {
					firstOrigin = lastOrigin;
					firstHandle = lastHandle;
				}
				
				if(i == this.values.length-1 && firstOrigin && lastOrigin && Math.abs(firstOrigin.x - lastOrigin.x) < threshold && Math.abs(firstOrigin.y - lastOrigin.y) < threshold) {
					if(firstOrigin != lastOrigin) {
						for(var j = 0; j < lastOrigin.connectors.length; j++) {
							firstOrigin.addConnector(lastOrigin.connectors[j]);
							lastOrigin.connectors[j].pointA = firstOrigin;
							
						}
						firstOrigin.actions.move += lastOrigin.actions.move;
						anchors[0].splice(-1, 1);
					}
					
					if(firstHandle != lastHandle && Math.abs(firstHandle.x-lastHandle.x) < threshold && Math.abs(firstHandle.y-lastHandle.y) < threshold) {
						firstHandle.actions.move += lastHandle.actions.move;
						anchors[1].splice(-1, 1);
						connectors.splice(-1, 1);
					}
					
				}
			}
			break;
		case 'scale':
			this.getValues();
			
			anchors[0] = [];
			anchors[1] = [];
			anchors[2] = [];
			anchors[3] = [];
			
			center = this.getFarCorner();
			
			var zero = CTM.toViewport(0, 0);
			
			var vectorZero = { 'x': center.x - zero.x, 'y': center.y - zero.y };
			
			var zeroAnchor = new anchor({ 'x': zero.x, 'y': zero.y}, this, 'circle',
				{ 'move': "this.element.parentNode.setZero(absolute.x, absolute.y, true);",
						  'mouseup': mouseUpAction },
				new constraintPosition(zero, true));
			
			anchors[3].push(zeroAnchor);
			
			var lastXY = null;
			var lastX = null;
			var lastY = null;
			
			var firstXY = null;
			var firstX = null;
			var firstY = null;
			
			for(var i = 0; i < this.values.length; i++) {
				
				var adjusted = { 'x': (this.values[i].x*vectorZero.x)+zero.x, 'y': (this.values[i].y*vectorZero.y)+zero.y };
			
				if(lastXY && Math.abs(lastXY.x - adjusted.x) < threshold && Math.abs(lastXY.y - adjusted.y) < threshold) {
					lastXY.actions.move += "this.element.setPosition("+i+", (absolute.x-("+zero.x+"))/"+vectorZero.x+", (absolute.y-("+zero.y+"))/"+vectorZero.y+", true);";
				} else {
					var anchXY = new anchor({ 'x': (this.values[i].x*vectorZero.x)+zero.x, 'y': (this.values[i].y*vectorZero.y)+zero.y },
						this, 'rectangle', 
						{ 'move': "this.element.setPosition("+i+", (absolute.x-("+zero.x+"))/"+vectorZero.x+", (absolute.y-("+zero.y+"))/"+vectorZero.y+", true);",
						  'mouseup': mouseUpAction },
						new constraintLinear(zero, center, false, true));
					
					if(lastXY) {
						var slaveXY = new connector(lastXY, anchXY, '#aa0000');
						connectors.push(slaveXY);
					}
					
					anchors[0].push(anchXY);
					
					lastXY = anchXY;
					
					if(!firstXY) {
						firstXY = anchXY;
					}
				}
				
				if(i == this.values.length-1 && firstXY && lastXY && firstXY != lastXY && Math.abs(lastXY.x - firstXY.x) < threshold && Math.abs(lastXY.y - firstXY.y) < threshold) {
					firstXY.addConnector(slaveXY);
					slaveXY.pointB = firstXY;
					firstXY.actions.move += lastXY.actions.move;
					anchors[0].splice(anchors[0].length-1, 1);
				}
			}
			break;
		case 'skewX':
			anchors[0] = [];
			anchors[1] = [];
			anchors[2] = [];
			anchors[3] = [];
			
			center = this.getFarCorner();
			var zero = CTM.toViewport(0, 0);
			
			var zeroAnchor = new anchor({ 'x': zero.x, 'y': zero.y}, this, 'circle',
				{ 'move': "this.element.setZero(absolute.x, absolute.y, true);",
						  'mouseup': mouseUpAction },
			new constraintLinear(zero, { 'x': zero.x, 'y': zero.y+1}));
			
			anchors[3].push(zeroAnchor);
			
			
			var vectorZero = { 'x': center.x - zero.x, 'y': center.y - zero.y };
			
			var line1 = new lineLong({'x': zero.x, 'y': zero.x }, { 'x': zero.x+1, 'y': zero.y }, '#aaa');
			var line2 = new lineLong({'x': center.x, 'y': center.y }, {'x': center.x + 1, 'y': center.y }, '#aaa');
			
			connectors.push(line1);
			connectors.push(line2);
			
			var lastAnchor = null;
			var firstAnchor = null;
			
			this.getValues();
			
			for(var i = 0; i < this.values.length; i++) {
				if(Math.abs(this.values[i].angle) == 90) { continue; }
				
				var angleRad = Math.PI*(this.values[i].angle)/180;
				var dX = vectorZero.y * Math.tan(angleRad);
				var adjusted = { 'x': vectorZero.x + dX + zero.x, 'y': vectorZero.y + zero.y };
				
				if(lastAnchor && Math.abs(lastAnchor.x - adjusted.x) < threshold && Math.abs(lastAnchor.y - adjusted.y) < threshold) {
					lastAnchor.actions.move += 'this.element.setAngle('+i+', 180*Math.atan(('+vectorZero.x+'*(-1)+(absolute.x-('+zero.x+')))/'+vectorZero.y+')/Math.PI, true);';
				} else {
					var anch = new anchor(adjusted,
						this, 'rectangle',
						{ 'move': 'this.element.setAngle('+i+', 180*Math.atan(('+vectorZero.x+'*(-1)+relative.x-('+zero.x+'))/'+vectorZero.y+')/Math.PI, true);', 
						  'mouseup': mouseUpAction },
						new constraintLinear({ 'x': 0, 'y': center.y }, { 'x': 1, 'y': center.y }, false, false));
					
					
					if(lastAnchor) {
						var slave = new connector(lastAnchor, anch, '#aa0000');
						connectors.push(slave);
					}
					
					lastAnchor = anch;
					anchors[0].push(anch);
					if(!firstAnchor) { firstAnchor = lastAnchor; }
				}
				
				if(i == this.values.length-1 && firstAnchor && lastAnchor && firstAnchor != lastAnchor && Math.abs(lastAnchor.x - firstAnchor.x) < threshold && Math.abs(lastAnchor.y - firstAnchor.y) < threshold) {
					firstAnchor.addConnector(slave);
					slave.pointB = firstAnchor;
					firstAnchor.actions.move += lastAnchor.actions.move;
					anchors[0].splice(anchors[0].length-1, 1);
				}
			}
			break;
		case 'skewY':
			anchors[0] = [];
			anchors[1] = [];
			anchors[2] = [];
			anchors[3] = [];
			
			center = this.getFarCorner();
			var zero = CTM.toViewport(0,0);
			
			var zeroAnchor = new anchor({ 'x': zero.x, 'y': zero.y}, this, 'circle',
				{ 'move': "this.element.setZero(absolute.x, absolute.y, true);",
						  'mouseup': mouseUpAction },
			new constraintLinear(zero, { 'x': zero.x+1, 'y': zero.y}));
			
			anchors[3].push(zeroAnchor);
			
			
			var vectorZero = { 'x': center.x - zero.x, 'y': center.y - zero.y };
			
			var line1 = new lineLong({'x': zero.x, 'y': zero.y }, { 'x': zero.x, 'y': zero.y + 1 }, '#aaa');
			var line2 = new lineLong({'x': center.x, 'y': center.y }, {'x': center.x, 'y': center.y + 1 }, '#aaa');
			
			connectors.push(line1);
			connectors.push(line2);
			
			var lastAnchor = null;
			var firstAnchor = null;
			
			this.getValues();
			
			for(var i = 0; i < this.values.length; i++) {
				if(Math.abs(this.values[i].angle) == 90) { continue; }
				
				var angleRad = Math.PI*(this.values[i].angle)/180;
				var dY = vectorZero.x * Math.tan(angleRad);
				var adjusted = { 'x': vectorZero.x + zero.x, 'y': vectorZero.y + dY + zero.y };
				
				if(lastAnchor && Math.abs(lastAnchor.x - adjusted.x) < threshold && Math.abs(lastAnchor.y - adjusted.y) < threshold) {
					lastAnchor.actions.move += 'this.element.setAngle('+i+', 180*Math.atan(('+vectorZero.y+'*(-1)+relative.y-('+zero.y+'))/'+vectorZero.x+')/Math.PI, true);';
				} else {
					var anch = new anchor(adjusted,
						this, 'rectangle',
						{ 'move': 'this.element.setAngle('+i+', 180*Math.atan(('+vectorZero.y+'*(-1)+relative.y-('+zero.y+'))/'+vectorZero.x+')/Math.PI, true);', 
						  'mouseup': mouseUpAction },
						new constraintLinear({ 'x': center.x, 'y': 0 }, { 'x': center.x, 'y': 1 }, false, false));
					
					
					if(lastAnchor) {
						var slave = new connector(lastAnchor, anch, '#aa0000');
						connectors.push(slave);
					}
					
					lastAnchor = anch;
					anchors[0].push(anch);
					if(!firstAnchor) { firstAnchor = lastAnchor; }
				}
				
				if(i == this.values.length-1 && firstAnchor && lastAnchor && firstAnchor != lastAnchor && Math.abs(lastAnchor.x - firstAnchor.x) < threshold && Math.abs(lastAnchor.y - firstAnchor.y) < threshold) {
					firstAnchor.addConnector(slave);
					slave.pointB = firstAnchor;
					firstAnchor.actions.move += lastAnchor.actions.move;
					anchors[0].splice(anchors[0].length-1, 1);
				}
			}
			break;
	}
	
	return { 'anchors': anchors, 'paths': paths, 'connectors': connectors };
}

SVGAnimateTransformElement.prototype.valuesToViewport = function(CTM) {
	if(!(CTM instanceof SVGMatrix)) { return; }
	if(this.getAttribute('type') == 'scale') { return; }
	if(this.getAttribute('type') == 'translate') { CTM.e = 0; CTM.f = 0; }
	this.getValues();
	for(var i = 0; i < this.values.length; i++) {
		if(this.values[i].x != null && this.values[i].y != null) {
			var adjusted = CTM.toViewport(this.values[i].x, this.values[i].y);
			this.values[i].x = adjusted.x;
			this.values[i].y = adjusted.y;
		}
	}
	this.commitValues();
}

SVGAnimateTransformElement.prototype.valuesToUserspace = function(CTM) {
	if(!(CTM instanceof SVGMatrix)) { return; }
	if(this.getAttribute('type') == 'scale') { return; }
	if(this.getAttribute('type') == 'translate') { CTM.e = 0; CTM.f = 0; }
	this.getValues();
	for(var i = 0; i < this.values.length; i++) {
		if(this.values[i].x != null && this.values[i].y != null) {
			var adjusted = CTM.toUserspace(this.values[i].x, this.values[i].y);
			this.values[i].x = adjusted.x;
			this.values[i].y = adjusted.y;
		}
	}
	this.commitValues();
}



SVGAnimateTransformElement.prototype.getCurrentValue = function(time) {
	var progress = this.getCurrentProgress(time);
	var times = this.getTimes();
	var values = this.getValues();
	
	var timeBefore, timeAfter;
	var before, after;
	
	/*
	if(progress == null) {
		var temp = this.parentNode.cloneNode(false);
		return temp.getPathData().baseVal;
	}
	*/
	
	for(var i = 0; i < times.length; i++) {
		if(this.times[i] == progress) {
			timeBefore = progress;
			before = i;
			break;
		} else if(this.times[i] < progress) {
			timeBefore = this.times[i];
			before = i;
		} else if(timeAfter == null) {
			timeAfter = this.times[i];
			after = i;
			break;
		}
	}
	
	if(timeBefore == progress) {
		return values[before];
	}
	if(after == null) {
		if(this.getAttribute('fill') == 'freeze') {
			return values[before];
		} else {
			return null;
		}	
	}
	
	var ratio = (progress-timeBefore)/(timeAfter-timeBefore);
	
	var splines = this.getSplines();
	
	if(splines && splines[before]) {
		ratio = splines[before].getValue(ratio);
	}
	
	return values[before].inbetween(values[after], ratio);
}

SVGAnimateTransformElement.prototype.getCurrentValueReadable = function(time, negate) {
	var value = this.getCurrentValue(time);
	if(!value) { return null; }
	switch(this.getAttribute('type')) {
		case 'translate':
			if(negate) {
				return 'translate('+(-1*value.x)+' '+(-1*value.y)+')';
			}
			return 'translate('+value.x+' '+value.y+')';
			break;
		case 'rotate':
			if(negate) {
				return 'rotate('+(-1*value.angle)+' '+value.x+' '+value.y+')';
			}
			return 'rotate('+value.angle+' '+value.x+' '+value.y+')';
			break;
		case 'scale':
			if(negate) {
				return 'scale('+(1/value.x)+' '+(1/value.y)+')';
			}
			return 'scale('+value.x+' '+value.y+')';
			break;
		case 'skewX':
			if(negate) {
				return 'skewX('+(-1*value.angle)+')';
			}
			return 'skewX('+value.angle+')';
			break;
		case 'skewY':
			if(negate) {
				return 'skewY('+(-1*value.angle)+')';
			}
			return 'skewY('+value.angle+')';
			break;
	}
	return null;
}



