/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for SVG "animateTransform" element
 */

SVGAnimateTransformElement.prototype.getKeyframes = function() {
	if(this.keyframes) {
		return this.keyframes;
	}
	
	var timesArray = this.getAttribute('keyTimes') ? this.getAttribute('keyTimes').split(';') : [];
	var splineArray = this.getAttribute('keySplines') ? this.getAttribute('keySplines').split(';') : [];
	var valueArray = this.getAttribute('values') ? this.getAttribute('values').split(';') : [];
	
	this.keyframes = new keyframeList();
	
	var isAngle = false;
	switch(this.getAttribute('type')) {
		case "rotate":
		case "skewX":
		case "skewY":
			isAngle = true;
			break;
	}
	
	for(var i = 0; i < timesArray.length; i++) {
		this.keyframes.push(
			new keyframe(parseFloat(timesArray[i]),
				(splineArray[i-1] ? new spline(splineArray[i-1]) : null),
				(isAngle ? new angle(valueArray[i]) : new coordinates(valueArray[i]))
			)
		);
	}
	return this.keyframes;
}

SVGAnimateTransformElement.prototype.setPosition = function(index, x, y) {
	if((x != null && isNaN(parseFloat(x))) || (y != null && isNaN(parseFloat(y)))) { return; }
	if(x != null) { x = parseFloat(x); }
	if(y != null) { y = parseFloat(y); }
	this.getKeyframes();
	try {
		if(x != null) {
			this.keyframes.getItem(index).value.x = x;
		}
		if(y != null) {
			this.keyframes.getItem(index).value.y = y;
		}
	} catch(err) {
		throw err;
	}
}

SVGAnimateTransformElement.prototype.setAngle = function(index, angle) {
	if(isNaN(parseFloat(angle))) { return; }
	angle = parseFloat(angle);
	this.getKeyframes();
	try {
		this.keyframes.getItem(index).value.angle = angle;
	} catch(err) {
		throw err;
	}
}

SVGAnimateTransformElement.prototype.isInvertible = function() { return true; }

SVGAnimateTransformElement.prototype.generateAnchors = function() {
	var paths = [];
	var connectors = [];
	var anchors = [];
	var pathData = '';
	
	var CTM = this.getCTMBase();
	
	var center = this.getCenter(true);
	
	var mouseUpAction = "svg.select();"
	
	var threshold = 0.01;
	
	this.getKeyframes();
	
	
	switch(this.getAttribute('type')) {
		case 'translate':
			connectors = [];
			anchors = [];
			
			//svg.ui.setAnchorOffset(center.x, center.y);
			
			var moveAction = "";
			
			var lastAnchor = null;
			
			var firstAnchor = null;
			
			for(var i = 0; i < this.keyframes.length; i++) {
				CTM.e = 0;
				CTM.f = 0;
				
				var adjusted = CTM.toViewport(this.keyframes.getItem(i).value.x, this.keyframes.getItem(i).value.y);
				
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
							'mouseup': mouseUpAction,
							'click': 'windowAnimation.select('+i+', { "ctrlKey": keys.ctrlKey || keys.shiftKey });'
							}, constraint);
					newAnchor.setOffset(center.x, center.y);
					
					if(windowAnimation.selected.length > 0 && windowAnimation.selected.indexOf(i) != -1) {
						newAnchor.select(true);
					}
					
					if(lastAnchor) {
						var slave = new connector(lastAnchor, newAnchor, '#aa0000');
						connectors.push(slave);
					}
					
					anchors.push(newAnchor);
					lastAnchor = newAnchor;
					if(!firstAnchor) { firstAnchor = lastAnchor; }
				}
				
				if(i == this.keyframes.length-1 && firstAnchor && lastAnchor && firstAnchor != lastAnchor && Math.abs(lastAnchor.x - firstAnchor.x) < threshold && Math.abs(lastAnchor.y - firstAnchor.y) < threshold) {
					firstAnchor.addConnector(slave);
					slave.pointB = firstAnchor;
					firstAnchor.actions.move += lastAnchor.actions.move;
					anchors.splice(anchors.length-1, 1);
				}
			}
			
			for(var i = 0; i < anchors.length; i++) {
				if(anchors[i].actions.move) {
					anchors[i].actions.move += 'this.element.commit();';
				}
			}
			
			anchors = [ anchors ];
			break;
		case 'rotate':
			var initialAngleOffset = this.parentNode.getCTMBase().decompose().rotation;
							
			anchors[0] = [];
			anchors[1] = [];
			
			this.getKeyframes();
			
			if(this.keyframes.length == 0) { break; }
			
			var lastOrigin = null;
			var lastHandle = null;
			
			var firstOrigin = null;
			var firstHandle = null;
			
			for(var i = 0; i < this.keyframes.length; i++) {
				var adjusted = CTM.toViewport(this.keyframes.getItem(i).value.x, this.keyframes.getItem(i).value.y);
				var angle = this.keyframes.getItem(i).value.angle - initialAngleOffset;
				
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
						var adjustedPrev = CTM.toViewport(this.keyframes.getItem(i-1).value.x, this.keyframes.getItem(i-1).value.y);
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
				
				if(i == this.keyframes.length-1 && firstOrigin && lastOrigin && Math.abs(firstOrigin.x - lastOrigin.x) < threshold && Math.abs(firstOrigin.y - lastOrigin.y) < threshold) {
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
			
			for(var i = 0; i < anchors[0].length; i++) {
				if(anchors[0][i].actions.move) {
					anchors[0][i].actions.move += 'this.element.commit();';
				}
			}
			for(var i = 0; i < anchors[1].length; i++) {
				if(anchors[1][i].actions.move) {
					anchors[1][i].actions.move += 'this.element.commit();';
				}
			}
			
			
			break;
		case 'scale':
			this.getKeyframes();
			
			anchors[0] = [];
			anchors[1] = [];
			anchors[2] = [];
			anchors[3] = [];
			
			center = this.getFarCorner();
			
			var zero = CTM.toViewport(0, 0);
			
			var vectorZero = { 'x': center.x - zero.x, 'y': center.y - zero.y };
			
			var zeroAnchor = new anchor({ 'x': zero.x, 'y': zero.y}, this, 'circle',
				{ 'move': "this.element.setZero(absolute.x, absolute.y, true);",
					'mouseup': mouseUpAction },
				new constraintPosition(zero, true));
				
			/*
			var zeroAnchor = new anchor({ 'x': zero.x, 'y': zero.y}, this, 'circle',
				{ 'mouseup': "this.element.setZero(absolute.x, absolute.y, true);"+mouseUpAction },
				new constraintPosition(zero, true));
			*/
			
			anchors[3].push(zeroAnchor);
			
			var lastXY = null;
			var lastX = null;
			var lastY = null;
			
			var firstXY = null;
			var firstX = null;
			var firstY = null;
			
			for(var i = 0; i < this.keyframes.length; i++) {
				
				var adjusted = { 'x': (this.keyframes.getItem(i).value.x*vectorZero.x)+zero.x, 'y': (this.keyframes.getItem(i).value.y*vectorZero.y)+zero.y };
			
				if(lastXY && Math.abs(lastXY.x - adjusted.x) < threshold && Math.abs(lastXY.y - adjusted.y) < threshold) {
					lastXY.actions.move += "this.element.setPosition("+i+", (absolute.x-("+zero.x+"))/"+vectorZero.x+", (absolute.y-("+zero.y+"))/"+vectorZero.y+", true);";
				} else {
					var anchXY = new anchor({ 'x': (this.keyframes.getItem(i).value.x*vectorZero.x)+zero.x, 'y': (this.keyframes.getItem(i).value.y*vectorZero.y)+zero.y },
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
				
				if(i == this.keyframes.length-1 && firstXY && lastXY && firstXY != lastXY && Math.abs(lastXY.x - firstXY.x) < threshold && Math.abs(lastXY.y - firstXY.y) < threshold) {
					firstXY.addConnector(slaveXY);
					slaveXY.pointB = firstXY;
					firstXY.actions.move += lastXY.actions.move;
					anchors[0].splice(anchors[0].length-1, 1);
				}
			}
			
			for(var i = 0; i < anchors[0].length; i++) {
				if(anchors[0][i].actions.move) {
					anchors[0][i].actions.move += 'this.element.commit();';
				}
			}
			for(var i = 0; i < anchors[1].length; i++) {
				if(anchors[1][i].actions.move) {
					anchors[1][i].actions.move += 'this.element.commit();';
				}
			}
			for(var i = 0; i < anchors[2].length; i++) {
				if(anchors[2][i].actions.move) {
					anchors[2][i].actions.move += 'this.element.commit();';
				}
			}
			for(var i = 0; i < anchors[3].length; i++) {
				if(anchors[3][i].actions.move) {
					anchors[3][i].actions.move += 'this.element.commit();';
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
			
			this.getKeyframes();
			
			for(var i = 0; i < this.keyframes.length; i++) {
				if(Math.abs(this.keyframes.getItem(i).value.angle) == 90) { continue; }
				
				var angleRad = Math.PI*(this.keyframes.getItem(i).value.angle)/180;
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
				
				if(i == this.keyframes.length-1 && firstAnchor && lastAnchor && firstAnchor != lastAnchor && Math.abs(lastAnchor.x - firstAnchor.x) < threshold && Math.abs(lastAnchor.y - firstAnchor.y) < threshold) {
					firstAnchor.addConnector(slave);
					slave.pointB = firstAnchor;
					firstAnchor.actions.move += lastAnchor.actions.move;
					anchors[0].splice(anchors[0].length-1, 1);
				}
			}
			
			for(var i = 0; i < anchors[0].length; i++) {
				if(anchors[0][i].actions.move) {
					anchors[0][i].actions.move += 'this.element.commit();';
				}
			}
			for(var i = 0; i < anchors[1].length; i++) {
				if(anchors[1][i].actions.move) {
					anchors[1][i].actions.move += 'this.element.commit();';
				}
			}
			for(var i = 0; i < anchors[2].length; i++) {
				if(anchors[2][i].actions.move) {
					anchors[2][i].actions.move += 'this.element.commit();';
				}
			}
			for(var i = 0; i < anchors[3].length; i++) {
				if(anchors[3][i].actions.move) {
					anchors[3][i].actions.move += 'this.element.commit();';
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
			
			this.getKeyframes();
			
			for(var i = 0; i < this.keyframes.length; i++) {
				if(Math.abs(this.keyframes.getItem(i).value.angle) == 90) { continue; }
				
				var angleRad = Math.PI*(this.keyframes.getItem(i).value.angle)/180;
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
				
				if(i == this.keyframes.length-1 && firstAnchor && lastAnchor && firstAnchor != lastAnchor && Math.abs(lastAnchor.x - firstAnchor.x) < threshold && Math.abs(lastAnchor.y - firstAnchor.y) < threshold) {
					firstAnchor.addConnector(slave);
					slave.pointB = firstAnchor;
					firstAnchor.actions.move += lastAnchor.actions.move;
					anchors[0].splice(anchors[0].length-1, 1);
				}
			}
			
			for(var i = 0; i < anchors[0].length; i++) {
				if(anchors[0][i].actions.move) {
					anchors[0][i].actions.move += 'this.element.commit();';
				}
			}
			for(var i = 0; i < anchors[1].length; i++) {
				if(anchors[1][i].actions.move) {
					anchors[1][i].actions.move += 'this.element.commit();';
				}
			}
			for(var i = 0; i < anchors[2].length; i++) {
				if(anchors[2][i].actions.move) {
					anchors[2][i].actions.move += 'this.element.commit();';
				}
			}
			for(var i = 0; i < anchors[3].length; i++) {
				if(anchors[3][i].actions.move) {
					anchors[3][i].actions.move += 'this.element.commit();';
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
	this.getKeyframes();
	for(var i = 0; i < this.keyframes.length; i++) {
		if(this.keyframes.getItem(i).value.x != null && this.keyframes.getItem(i).value.y != null) {
			var adjusted = CTM.toViewport(this.keyframes.getItem(i).value.x, this.keyframes.getItem(i).value.y);
			this.setPosition(i, adjusted.x, adjusted.y);
		}
	}
	/*
	console.log(this.getAttribute('values'));
	console.log(this.keyframes.getValues());
	*/
}

SVGAnimateTransformElement.prototype.valuesToUserspace = function(CTM) {
	if(!(CTM instanceof SVGMatrix)) { return; }
	if(this.getAttribute('type') == 'scale') { return; }
	if(this.getAttribute('type') == 'translate') { CTM.e = 0; CTM.f = 0; }
	this.getKeyframes();
	for(var i = 0; i < this.keyframes.length; i++) {
		if(this.keyframes.getItem(i).value.x != null && this.keyframes.getItem(i).value.y != null) {
			var adjusted = CTM.toUserspace(this.keyframes.getItem(i).value.x, this.keyframes.getItem(i).value.y);
			this.setPosition(i, adjusted.x, adjusted.y);
		}
	}
	/*
	console.log(this.getAttribute('values'));
	console.log(this.keyframes.getValues());
	*/
}



SVGAnimateTransformElement.prototype.getCurrentValue = function(time) {
	var progress = this.getCurrentProgress(time);
	
	this.getKeyframes();
	var timeBefore, timeAfter;
	var before, after;
	
	for(var i = 0; i < this.keyframes.length; i++) {
		if(this.keyframes.getItem(i).time == progress) {
			timeBefore = progress;
			before = i;
			break;
		} else if(this.keyframes.getItem(i).time < progress) {
			timeBefore = this.keyframes.getItem(i).time;
			before = i;
		} else if(timeAfter == null) {
			timeAfter = this.keyframes.getItem(i).time;
			after = i;
			break;
		}
	}
	
	if(timeBefore == progress) {
		return this.keyframes.getItem(before).value;
	}
	if(after == null) {
		if(this.getAttribute('fill') == 'freeze') {
			return this.keyframes.getItem(before).value;
		} else {
			return null;
		}	
	}
	
	var ratio = (progress-timeBefore)/(timeAfter-timeBefore);
	
	if(this.keyframes.getItem(after).spline) {
		ratio = this.keyframes.getItem(after).spline.getValue(ratio);
	}
	
	return this.keyframes.getItem(before).value.inbetween(this.keyframes.getItem(after).value, ratio);
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



