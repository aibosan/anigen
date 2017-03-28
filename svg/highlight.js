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
	
	this.clone = this.element.cloneNode(false);
		
	var transform = this.element.getCTMBase();
	this.clone.setAttribute('transform', transform);
    this.clone.setAttribute("anigen:lock", "interface");
	this.clone.style.fill = 'none';
	this.clone.style.stroke = this.color;
	this.clone.style.strokeDasharray = null;
	this.clone.style.filter = null;
	this.clone.removeAttribute('filter');
	this.clone.style.clipPath = null;
	this.clone.removeAttribute('clip-path');
	
	this.container.appendChild(this.clone);
	this.adjustZoom();
}

highlight.prototype.adjustZoom = function() {
	if(!this.clone) { return; }
	var transform = this.clone.getCTMBase();
	var zero = transform.toViewport(0,0);
	var one = transform.toViewport(1,1);
	var ratio = Math.sqrt((one.x-zero.x)*(one.x-zero.x)+(one.y-zero.y)*(one.y-zero.y));
	
	this.clone.style.strokeWidth = 2/(ratio*svg.zoom)+"px";
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