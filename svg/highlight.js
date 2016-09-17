/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Element highlight UI element
 */
function highlight() {
	this.container = document.createElementNS(svgNS, "g");
    this.container.setAttribute("anigen:lock", "interface");
	this.color = new color('#ff0000');
}

highlight.prototype.setElement = function(element) {
	if(!element || element instanceof SVGGElement || element instanceof SVGUseElement) {
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
	
	this.clone = this.element.cloneNode(false);
	var transform = this.element.getCTMBase();
	this.clone.setAttribute('transform', transform);
    this.clone.setAttribute("anigen:lock", "interface");
	this.clone.style.fill = 'none';
	this.clone.style.stroke = this.color.getHex();
	
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
	this.container.removeAttribute("display");
}