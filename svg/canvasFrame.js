/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Canvas frame UI element - draws a box around the SVG's viewBox
 */
function canvasFrame() {
    this.container = document.createElementNS(svgNS, "g");
    this.container.setAttributeNS(anigenNS, 'anigen:lock', 'interface');
}


canvasFrame.prototype.refresh = function() {
	this.container.removeChildren();

	if (svg.namedView.getAttribute("bordercolor")) {
		var viewFrameColor = svg.namedView.getAttribute("bordercolor");
	} else {
		var viewFrameColor = "#666666";
		svg.namedView.setAttribute("bordercolor", viewFrameColor);
	}

	if (svg.namedView.getAttribute("borderopacity")) {
		var viewFrameOpacity = svg.namedView.getAttribute("borderopacity");
	} else {
		var viewFrameOpacity = "1";
		svg.namedView.setAttribute("borderopacity", viewFrameOpacity);
	}
	
	this.frame = document.createElementNS(svgNS, "g");

	var shadowA = document.createElementNS(svgNS, "rect");
	var shadowB = document.createElementNS(svgNS, "rect");
	var shadowC = document.createElementNS(svgNS, "rect");
	var frameRect = document.createElementNS(svgNS, "rect");

	originX = svg.svgBox[0];
	originY = svg.svgBox[1];
	frameWidth = svg.svgBox[2];
	frameHeight = svg.svgBox[3];

	this.container.appendChild(shadowA);
	this.container.appendChild(shadowB);
	this.container.appendChild(shadowC);
	this.container.appendChild(frameRect);

	this.container.setAttribute("id", "frameGroup");
	this.container.setAttribute("opacity", viewFrameOpacity);
	this.container.setAttribute("anigen:lock", "interface");

	shadowA.setAttribute("x", originX + frameWidth);
	shadowA.setAttribute("y", originY + 3);
	shadowA.setAttribute("width", 3);
	shadowA.setAttribute("height", frameHeight - 3);
	shadowA.setAttribute("fill", viewFrameColor);
	shadowA.setAttribute("stroke", "none");
	shadowA.setAttribute("id", "anigenShadowA");
	shadowA.setAttribute("anigen:lock", "interface");

	shadowB.setAttribute("x", originX + 3);
	shadowB.setAttribute("y", originY + frameHeight);
	shadowB.setAttribute("width", frameWidth - 3);
	shadowB.setAttribute("height", 3);
	shadowB.setAttribute("fill", viewFrameColor);
	shadowB.setAttribute("stroke", "none");
	shadowB.setAttribute("id", "anigenShadowB");
	shadowB.setAttribute("anigen:lock", "interface");

	shadowC.setAttribute("x", originX + frameWidth);
	shadowC.setAttribute("y", originY + frameHeight);
	shadowC.setAttribute("width", 3);
	shadowC.setAttribute("height", 3);
	shadowC.setAttribute("fill", viewFrameColor);
	shadowC.setAttribute("stroke", "none");
	shadowC.setAttribute("id", "anigenShadowC");
	shadowC.setAttribute("anigen:lock", "interface");

	frameRect.setAttribute("x", originX);
	frameRect.setAttribute("y", originY);
	frameRect.setAttribute("width", frameWidth);
	frameRect.setAttribute("height", frameHeight);
	frameRect.setAttribute("fill", "none");
	frameRect.setAttribute("stroke-width", this.zoom);
	frameRect.setAttribute("stroke", viewFrameColor);
	frameRect.setAttribute("id", "anigenFrame");
	frameRect.setAttribute("anigen:lock", "interface");
}