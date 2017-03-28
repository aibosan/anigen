/**
 *  @author		Ondrej Benda
 *  @date		2017
 *  @copyright	GNU GPLv3
 *	@brief		Self contained spline editor with event support
 */
function splineEditor(size, value, actions) {
	if(!size || isNaN(size) || size <= 0) { size = 120; }
	this.size = size;
	var ratio = 120/this.size;
	
	this.value = value instanceof spline ? value.clone() : new spline(value);
	if(!this.value) {
		this.value = new spline();
	}
	
	this.actions = actions || {};
	
	svgNS = svgNS || "http://www.w3.org/2000/svg";
	
	this.container = document.createElementNS(svgNS, 'svg');
	this.container.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	this.container.setAttribute("xmlns:sodipodi", "http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd");
	this.container.setAttribute("xmlns:inkscape", "http://www.inkscape.org/namespaces/inkscape");
	this.container.setAttribute("width", this.size);
	this.container.setAttribute("height", this.size);
	this.container.setAttribute("version", "1.1");
	this.container.setAttribute("viewBox", "-10 -10 120 120");
	this.container.setAttribute("preserveAspectRatio", "xMidYMid");
	
	this.container.setAttribute("preserveAspectRatio", "xMidYMid");
	
	this.container.setAttribute("anigen:lock", "interface");
	
	this.container.shepherd = this;
	
	var rect1 = document.createElementNS(svgNS, 'rect');
		rect1.setAttribute('x', '0');
		rect1.setAttribute('y', '0');
		rect1.setAttribute('height', '50');
		rect1.setAttribute('width', '0');
		rect1.setAttribute('style', 'opacity:0.25');
		
	this.container.appendChild(rect1);
	
	var anim1 = document.createElementNS(svgNS, 'animate');
		anim1.setAttribute('attributeType', 'auto');
		anim1.setAttribute('attributeName', 'width');
		anim1.setAttribute('values', '0;100');
		anim1.setAttribute('calcMode', 'spline');
		anim1.setAttribute('keySplines', '0 0 1 1');
		anim1.setAttribute('dur', '5s');
		anim1.setAttribute('begin', '0s');
		anim1.setAttribute('repeatCount', 'indefinite');
		anim1.setAttribute('additive', 'replace');
	
		rect1.appendChild(anim1);
		
	var rect2 = document.createElementNS(svgNS, 'rect');
		rect2.setAttribute('x', '0');
		rect2.setAttribute('y', '50');
		rect2.setAttribute('height', '50');
		rect2.setAttribute('width', '0');
		rect2.setAttribute('style', 'opacity:0.25');
		
	this.container.appendChild(rect2);
	
	this.animation = document.createElementNS(svgNS, 'animate');
	this.animation.setAttribute('attributeType', 'auto');
	this.animation.setAttribute('attributeName', 'width');
	this.animation.setAttribute('values', '0;100');
	this.animation.setAttribute('calcMode', 'spline');
	this.animation.setAttribute('keySplines', this.value);
	this.animation.setAttribute('dur', '5s');
	this.animation.setAttribute('begin', '0s');
	this.animation.setAttribute('repeatCount', 'indefinite');
	this.animation.setAttribute('additive', 'replace');
	
		rect2.appendChild(this.animation);
	
	this.path = document.createElementNS(svgNS, 'path');
	this.path.setAttribute('style', 'fill:none;stroke:#f00;stroke-width:'+ratio+'px;');
	this.container.appendChild(this.path);
	
	this.refreshPath();
	
	var rframe = document.createElementNS(svgNS, 'rect');
		rframe.setAttribute('x', '0');
		rframe.setAttribute('y', '0');
		rframe.setAttribute('height', '100');
		rframe.setAttribute('width', '100');
		rframe.setAttribute('style', 'fill:none;stroke:#000;stroke-width:'+ratio+'px;');
		
	this.container.appendChild(rframe);
	
	
	this.handle1 = new anchor({ 'x': 0, 'y': 0 }, this.container, 'circle',
		{ 'move': 'this.element.shepherd.moveHandle();' },
		new constraintRectangle({'x': 0, 'y': 0, 'width': 100, 'height': 100}));
	this.handle2 = new anchor({ 'x': 0, 'y': 0 }, this.container, 'circle',
		{ 'move': 'this.element.shepherd.moveHandle();' },
		new constraintRectangle({'x': 0, 'y': 0, 'width': 100, 'height': 100}));
	
	this.handle1.setSize(8*ratio);
	this.handle2.setSize(8*ratio);
	
	var handle1Connector = new connector({'x': 0, 'y': 100}, this.handle1);
		this.handle1.addChild(handle1Connector);
	var handle2Connector = new connector({'x': 100, 'y': 0}, this.handle2);
		this.handle2.addChild(handle2Connector);
	
	handle1Connector.setSize(1.5*ratio);	
	handle2Connector.setSize(1.5*ratio);	
	
	
	this.container.appendChild(handle1Connector.container);
	this.container.appendChild(handle2Connector.container);
	this.container.appendChild(this.handle1.container);
	this.container.appendChild(this.handle2.container);
	
	this.refreshHandles();
	
	this.container.addEventListener("mousemove", this.eventMouseMove, false);
    this.container.addEventListener("mousedown", this.eventMouseDown, false);
    this.container.addEventListener("mouseup", this.eventMouseUp, false);
	
	return this.container;
}

splineEditor.prototype.refreshPath = function() {
	var pData = 'M 0 100 ';
		pData += 'C ' + this.value.x1*100 + ' ' + (1-this.value.y1)*100 + ' ';
		pData += '' + this.value.x2*100 + ' ' + (1-this.value.y2)*100 + ' ';
		pData += '100 0';
	this.path.setAttribute('d', pData);
}

splineEditor.prototype.refreshAnimation = function() {
	this.animation.setAttribute('keySplines', this.value);
}

splineEditor.prototype.refreshHandles = function() {
	this.handle1.setPosition(this.value.x1*100, (1-this.value.y1)*100);
	this.handle2.setPosition(this.value.x2*100, (1-this.value.y2)*100);
}

splineEditor.prototype.refresh = function() {
	this.refreshHandles();
	this.refreshAnimation();
	this.refreshPath();
}

splineEditor.prototype.moveHandle = function(index) {
	this.value.x1 = this.handle1.x / 100;
	this.value.y1 = (100-this.handle1.y) / 100;
	this.value.x2 = this.handle2.x / 100;
	this.value.y2 = (100-this.handle2.y) / 100;
	
	this.evaluate();
	
	this.refreshPath();
	this.refreshAnimation();
}

splineEditor.prototype.evaluate = function() {
	for(var i in this.actions) {
		try {
			eval(this.actions[i]);
		} catch(err) {
			console.error(this.actions[i]);
			console.error(err);
		}
	}
}

splineEditor.prototype.eventMouseDown = function(event) {
	var shepherd = this.shepherd;
	if(!shepherd) { return; }
	
	if(event.target.parentNode.shepherd instanceof anchor) {
		shepherd.active = event.target.parentNode.shepherd;
	} else {
		shepherd.active = null;
	}
}

splineEditor.prototype.eventMouseUp = function(event) {
	var shepherd = this.shepherd;
	if(!shepherd) { return; }
	shepherd.active = null;
}

splineEditor.prototype.eventMouseMove = function(event) {
	var shepherd = this.shepherd;
	if(!shepherd || !shepherd.active) { return; }
	
	var ratio = 120/shepherd.size;
	var x = (event.offsetX)*ratio - 10;
	var y = (event.offsetY)*ratio - 10;
	
	shepherd.active.moveTo(x, y);
}
	