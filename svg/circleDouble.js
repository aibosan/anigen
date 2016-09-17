/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Circle UI element, white with black outline. Defined by a center and reference element (with .x and .y)
 */
function circleDouble(center, reference, colors) {
	if(!center || !reference) { return; }
	if(!colors || !Array.isArray(colors)) {
		colors = [ '#ffffff', '#000000' ];
	}
	if(!colors[0]) { colors[0] = '#ffffff'; }
	if(!colors[1]) { colors[1] = '#000000'; }
	
	this.center = center;
	this.reference = reference;
	
	if(this.center instanceof anchor || this.center instanceof anchorAngle) {
		this.center.addConnector(this);
	}
	if(this.reference instanceof anchor || this.reference instanceof anchorAngle) {
		this.reference.addConnector(this);
	}
	
	this.adjustZoom = function() {
        this.circle1.setAttribute("stroke-width", 1.5/svg.zoom+"px");
		this.circle2.setAttribute("stroke-width", 2.5/svg.zoom+"px");
    };
	
	this.refresh = function() {
		this.radius = Math.sqrt((this.center.x-(this.reference.x+this.center.x))*(this.center.x-(this.reference.x+this.center.x))+(this.center.y-(this.reference.y+this.center.y))*(this.center.y-(this.reference.y+this.center.y)));
		this.circle1.setAttribute('cx', this.center.x);
		this.circle1.setAttribute('cy', this.center.y);
		this.circle2.setAttribute('cx', this.center.x);
		this.circle2.setAttribute('cy', this.center.y);
		this.circle1.setAttribute('r', this.radius);
		this.circle2.setAttribute('r', this.radius);
	};
	
	this.x = center.x;
	this.y = center.y;
	
    this.container = document.createElementNS(svgNS, "g");
    this.container.setAttribute("anigen:lock", "interface");
	
    this.circle1 = document.createElementNS(svgNS, "circle");
	this.circle2 = document.createElementNS(svgNS, "circle");
    
	this.container.appendChild(this.circle2);
	this.container.appendChild(this.circle1);
	
	this.circle1.setAttribute("anigen:lock", "interface");
	this.circle2.setAttribute("anigen:lock", "interface");

    this.circle1.setAttribute("style", "fill:none;stroke:"+colors[0]+";");
	this.circle2.setAttribute("style", "fill:none;stroke:"+colors[1]+";");

	this.adjustZoom();
	this.refresh();
	
    this.hide = function() {
        this.container.setAttribute("display", "none");
    };
    this.show = function() {
        this.container.removeAttribute("display");
    };
}