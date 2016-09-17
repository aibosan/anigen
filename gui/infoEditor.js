/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Editor's section with information about time and zoom
 */
function infoEditor() {
    this.container = document.createElement("div");
    this.container.id = "anigeninfoEditor";

	this.pauseButton = new buttonToggle(
		["svg.svgElement.unpauseAnimations();", "svg.svgElement.pauseAnimations();"],
		['pause_black.png', 'triangle_right_black.png'],
		0,
		['Unpause animations', 'Pause animations']);
	this.container.appendChild(this.pauseButton.container);
	
	this.hideIcon = new icon("stopwatch_black.png", true);
    this.hideIcon.img.setAttribute("onclick", "infoEditor.clock.toggle();");
    this.hideIcon.img.setAttribute('title', 'Hide/show clock');
    this.container.appendChild(this.hideIcon.img);
	
    this.clock = new clock();
    this.clock.display();
    this.container.appendChild(this.clock.container);

    this.zoomIcon = new icon("magnifier_black.png", true);
    this.zoomIcon.img.setAttribute("onclick", "svg.zoom = 1; svg.refreshUI(true);");
    this.zoomIcon.img.setAttribute('title', 'Reset zoom');
    this.container.appendChild(this.zoomIcon.img);
    this.zoomValue = document.createElement("span");
    this.container.appendChild(this.zoomValue);
}

infoEditor.prototype.refreshZoom = function() {
	this.zoomValue.removeChildren();
	this.zoomValue.appendChild(document.createTextNode(svg.getZoomReadable()));
}

infoEditor.prototype.refreshPause = function() {
	if(svg.svgElement.animationsPaused()) {
		this.pauseButton.setState(0);
	} else {
		this.pauseButton.setState(1);
	}
}