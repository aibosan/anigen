/**
 *  @author		Ondrej Benda
 *  @date		2017
 *  @copyright	GNU GPLv3
 *	@brief		UI ruler
 */
function uiRuler(vertical, tied) {
	this.vertical = vertical || false;
	this.tied = tied || null;
	
	this.girth = 25;
	
	this.container = document.createElement('div');
	this.container.setAttribute('class', 'ruler');
	this.container.addClass(this.vertical ? 'vertical' : 'horizontal');
	
	this.container.style.top = '0px';
	this.container.style.left = '0px';
	
	this.arrow = document.createElementNS(svgNS, 'polygon');
	this.arrow.style.fill = 'black';
	
	if(this.vertical) {
		this.container.style.height = "100%";
		this.container.style.width = this.girth+"px";
		this.arrow.setAttribute('points',  this.girth*0.8 + ',' + (-0.2*this.girth) + ' ' + this.girth*0.8 + ',' + 0.2*this.girth + ' ' + this.girth + ',0');
	} else {
		this.container.style.height = this.girth+"px";
		this.container.style.width = "100%";
		this.arrow.setAttribute('points', (-0.2*this.girth) + ',' + this.girth*0.8 + ' ' + 0.2*this.girth + ',' + this.girth*0.8 + ' 0,' + this.girth);
	}
	
	this.svg = document.createElementNS(svgNS, 'svg');
	this.svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	this.svg.setAttribute("xmlns:sodipodi", "http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd");
	this.svg.setAttribute("xmlns:inkscape", "http://www.inkscape.org/namespaces/inkscape");
	this.svg.setAttribute("width", this.vertical ? this.girth+"px" : "100%");
	this.svg.setAttribute("height", this.vertical ? "100%" : this.girth+"px");
	this.svg.setAttribute("version", "1.1");
	this.svg.setAttribute("preserveAspectRatio", "xMidYMid");
	this.svg.setAttribute("shape-rendering", "crispEdges");
	this.svg.setAttribute("anigen:lock", "interface");
	
	this.container.appendChild(this.svg);
	
	this.refresh();
}

uiRuler.prototype.hide = function() {
	this.container.addClass('hidden');
}

uiRuler.prototype.show = function() {
	this.container.removeClass('hidden');
}

uiRuler.prototype.toggle = function() {
	if(this.container.hasClass('hidden')) {
		this.show();
	} else {
		this.hide();
	}
}

uiRuler.prototype.isHidden = function() {
	return this.container.hasClass('hidden');
}

uiRuler.prototype.refresh = function() {
	if(!svg || !svg.viewBox || svg.viewBox.height == 0 || svg.viewBox.width == 0) { return; }
	
	
	if(this.tied instanceof uiSection) {
		if(this.vertical) {
			if(this.tied.isHidden()) {
				this.container.style.left = this.tied.x + "px";
			} else {
				this.container.style.left = this.tied.x + this.tied.width + "px";
			}
		} else {
			if(this.tied.isHidden()) {
				this.container.style.top = this.tied.y + "px";
			} else {
				this.container.style.top = this.tied.y + this.tied.height + "px";
			}
		}
	}
	
	var dFrom = 0;
	var dTo = this.vertical ? window.innerHeight : window.innerWidth;
	var dSize = this.vertical ? (window.innerHeight - dFrom) : (window.innerWidth - dFrom);
	
	var nFrom = (this.vertical ? svg.viewBox.y : svg.viewBox.x);
	var nSize = dSize/svg.zoom;
	
	var dSegmentSize = 100;
	var nSegmentSize = parseFloat(Number(dSegmentSize/svg.zoom).toPrecision(1));
	dSegmentSize = nSegmentSize * svg.zoom;
	
	var segmentCount = parseInt(Math.ceil(nSize/nSegmentSize));
	
	var nOffset = Math.floor( nFrom / nSegmentSize ) * nSegmentSize;
	
	var dOffset = ((nFrom - nOffset)/nSegmentSize) * dSegmentSize;
	
	this.svg.removeChildren();
	
	// for rounding numbers a bit
	var order = Math.floor(Math.log(nSegmentSize) / Math.LN10 + 0.000000001);
	if(order < 0) { order *= -1; }
	order++;
	
	if(this.vertical) {
		for(var i = -1; i <= segmentCount; i++) {
			var subRuler = document.createElementNS(svgNS, "path");
		
			subRuler.setAttribute("fill", "none");
			subRuler.setAttribute("stroke", "black");
			subRuler.setAttribute("stroke-width", "1px");
			subRuler.setAttribute("transform", "translate(0," + ( i*dSegmentSize - dOffset ) + ")");
			subRuler.setAttribute("d", 
				"M " + this.girth + " " + dSegmentSize*0.0 + " h " + (-0.8*this.girth) +
				" M " + this.girth + " " + dSegmentSize*0.1 + " h " + (-0.2*this.girth) + 
				" M " + this.girth + " " + dSegmentSize*0.2 + " h " + (-0.2*this.girth) + 
				" M " + this.girth + " " + dSegmentSize*0.3 + " h " + (-0.2*this.girth) + 
				" M " + this.girth + " " + dSegmentSize*0.4 + " h " + (-0.2*this.girth) + 
				" M " + this.girth + " " + dSegmentSize*0.5 + " h " + (-0.5*this.girth) + 
				" M " + this.girth + " " + dSegmentSize*0.6 + " h " + (-0.2*this.girth) + 
				" M " + this.girth + " " + dSegmentSize*0.7 + " h " + (-0.2*this.girth) + 
				" M " + this.girth + " " + dSegmentSize*0.8 + " h " + (-0.2*this.girth) + 
				" M " + this.girth + " " + dSegmentSize*0.9 + " h " + (-0.2*this.girth)
				);
			this.svg.appendChild(subRuler);
			
			var rulerText = document.createElementNS(svgNS, "text");
			rulerText.setAttribute("x", 0);
			rulerText.setAttribute("y", 2);
			rulerText.setAttribute("font-size", this.girth*0.4+"px");
			rulerText.setAttribute("transform", "translate(0," + ( i*dSegmentSize - dOffset ) + ")");
			
			var textString = String(parseFloat((nOffset + nSegmentSize*i).toFixed(order)));
			
			for(var j = 0; j < textString.length; j++) {
				var tspanNode = document.createElementNS(svgNS, "tspan");
				tspanNode.setAttribute("dy", this.girth*0.4);
				if(textString[j] == "-")
				{
					j++;
					tspanNode.appendChild(document.createTextNode("-" + textString[j]))
					tspanNode.setAttribute("x", this.girth/9);
				} else {
					tspanNode.appendChild(document.createTextNode(textString[j]))
					tspanNode.setAttribute("x", this.girth/4);
				}
				rulerText.appendChild(tspanNode)
			}
			this.svg.appendChild(rulerText);
			
		}
	} else {
		for(var i = -1; i <= segmentCount; i++) {
			var subRuler = document.createElementNS(svgNS, "path");
			
			subRuler.setAttribute("fill", "none");
			subRuler.setAttribute("stroke", "black");
			subRuler.setAttribute("stroke-width", "1px");
			subRuler.setAttribute("transform", "translate(" + ( i*dSegmentSize - dOffset ) + ",0)");
			subRuler.setAttribute("d", 
				"M " + dSegmentSize*0.0 + " " + this.girth + " v " + (-0.8*this.girth) +
				" M " + dSegmentSize*0.1 + " " + this.girth + " v " + (-0.2*this.girth) + 
				" M " + dSegmentSize*0.2 + " " + this.girth + " v " + (-0.2*this.girth) + 
				" M " + dSegmentSize*0.3 + " " + this.girth + " v " + (-0.2*this.girth) + 
				" M " + dSegmentSize*0.4 + " " + this.girth + " v " + (-0.2*this.girth) + 
				" M " + dSegmentSize*0.5 + " " + this.girth + " v " + (-0.5*this.girth) + 
				" M " + dSegmentSize*0.6 + " " + this.girth + " v " + (-0.2*this.girth) + 
				" M " + dSegmentSize*0.7 + " " + this.girth + " v " + (-0.2*this.girth) + 
				" M " + dSegmentSize*0.8 + " " + this.girth + " v " + (-0.2*this.girth) + 
				" M " + dSegmentSize*0.9 + " " + this.girth + " v " + (-0.2*this.girth)
				);
			this.svg.appendChild(subRuler);
			
			var rulerText = document.createElementNS(svgNS, "text");
			rulerText.setAttribute("x", +2);
			rulerText.setAttribute("y", 0.5*this.girth);
			rulerText.setAttribute("font-size", this.girth*0.4+"px");
			rulerText.setAttribute("transform", "translate(" + ( i*dSegmentSize - dOffset ) + ",0)");
			rulerText.appendChild(document.createTextNode( parseFloat((nOffset + nSegmentSize*i).toFixed(order)) ));
			this.svg.appendChild(rulerText);
			
		}
	}
	
	this.svg.appendChild(this.arrow);

}

uiRuler.prototype.setArrow = function(value) {
	if(this.vertical) {
		this.arrow.setAttribute('transform', 'translate(0, '+(value-svg.viewBox.y)*svg.zoom+')');
	} else {
		this.arrow.setAttribute('transform', 'translate('+(value-svg.viewBox.x)*svg.zoom+', 0)');
	}
	
}




