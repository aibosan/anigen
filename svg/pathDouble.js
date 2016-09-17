/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Generic path element, white with black outline
 */
function pathDouble(data, colors) {
	if(!data) { return; }
	if(!colors || !Array.isArray(colors)) {
		colors = [ '#ffffff', '#000000' ];
	}
	if(!colors[0]) { colors[0] = '#ffffff'; }
	if(!colors[1]) { colors[1] = '#000000'; }
	
	this.adjustZoom = function() {
        this.path1.setAttribute("stroke-width", 1.5/svg.zoom+"px");
		this.path2.setAttribute("stroke-width", 2.5/svg.zoom+"px");
    };
	
	this.x = 0;
	this.y = 0;
	
    this.container = document.createElementNS(svgNS, "g");
    this.container.setAttribute("anigen:lock", "interface");
	
    this.path1 = document.createElementNS(svgNS, "path");
	this.path2 = document.createElementNS(svgNS, "path");
    
	this.container.appendChild(this.path2);
	this.container.appendChild(this.path1);
	
	this.path1.setAttribute('d', data);
	this.path2.setAttribute('d', data);
	
    this.path1.setAttribute("anigen:lock", "interface");
	this.path2.setAttribute("anigen:lock", "interface");

    this.path1.setAttribute("style", "fill:none;stroke:"+colors[0]+";");
	this.path2.setAttribute("style", "fill:none;stroke:"+colors[1]+";");

	this.adjustZoom();
	
    this.hide = function() {
        this.container.setAttribute("display", "none");
    };
    this.show = function() {
        this.container.removeAttribute("display");
    };
	
	this.moveBy = function(dX, dY) {
		if(dX == null || dY == null) { return; }
		this.x += dX;
		this.y += dY;
		this.container.setAttribute('transform', 'translate('+(this.x)+', '+(this.y)+')');
	};
}