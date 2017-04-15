/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Element highlight UI element
 */
function highlight() {
	this.container = document.createElementNS(svgNS, "g");
    this.container.setAttribute("anigen:lock", "interface");
	this.color = '#ff0000'
}

highlight.prototype.setElement = function(element) {
	if(!element || element instanceof SVGGElement || element instanceof SVGUseElement || element instanceof SVGImageElement || element.shepherd) {
		this.element = null;
		return;
	}
	this.element = element;
	this.refresh();
	this.show();
}

highlight.prototype.refresh = function() {
	this.container.removeChildren();
	if(!this.element) { return; }
	
	if(this.element.isAnimation()) {
		this.color = '#0000ff';
	} else if(this.element.hasAnimation()) {
		var animations = this.element.getAnimations();
		this.color = '#ff0000';
		for(var i = 0; i < animations.length; i++) {
			if(animations[i] instanceof SVGAnimateElement) {
				this.color = '#0000ff';
				break;
			}
		}
	} else {
		this.color = '#ff0000';
	}
	
	this.cloneDrawn = this.element.cloneNode(false);
		
	var transform = this.element.getCTMBase();
	this.cloneDrawn.setAttribute('transform', transform);
    this.cloneDrawn.setAttribute("anigen:lock", "interface");
	this.cloneDrawn.style.fill = 'none';
	this.cloneDrawn.style.stroke = this.color;
	
	this.cloneDrawn.style.strokeDasharray = null;
	this.cloneDrawn.style.strokeLinecap = 'round';
	this.cloneDrawn.style.filter = null;
	this.cloneDrawn.removeAttribute('filter');
	this.cloneDrawn.style.clipPath = null;
	this.cloneDrawn.removeAttribute('clip-path');
	
	this.cloneDrawn.style.marker = null;
	this.cloneDrawn.style.markerStart = null;
	this.cloneDrawn.style.markerMid = null;
	this.cloneDrawn.style.markerEnd = null;
	
	this.cloneHidden = this.cloneDrawn.cloneNode(false);
	this.cloneHidden.style.strokeOpacity = '0';
	
	this.container.appendChild(this.cloneHidden);
	this.container.appendChild(this.cloneDrawn);
	this.adjustZoom();
}

highlight.prototype.adjustZoom = function() {
	if(!this.cloneDrawn || !this.cloneHidden) { return; }
	var transform = this.cloneDrawn.getCTMBase();
	var zero = transform.toViewport(0,0);
	var one = transform.toViewport(1,1);
	var ratio = Math.sqrt((one.x-zero.x)*(one.x-zero.x)+(one.y-zero.y)*(one.y-zero.y));
	
	this.cloneDrawn.style.strokeWidth = 2/(ratio*svg.zoom)+"px";
	this.cloneHidden.style.strokeWidth = 8/(ratio*svg.zoom)+"px";
}

highlight.prototype.hide = function() {
	this.container.setAttribute("display", "none");
}

highlight.prototype.show = function() {
	if(anigenActual.settings.get('highlight')) {
		this.container.removeAttribute("display");
	} else {
		this.container.setAttribute("display", "none");
	}
}