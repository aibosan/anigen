/**
 *  @author		Ondrej Benda
 *  @date		2011-2017
 *  @copyright	GNU GPLv3
 *	@brief		Editor's section with information about time and zoom
 */
function infoEditor(timeline) {
    this.container = document.createElement("div");
	this.container.addClass('editor');

	this.zoomIcon = new uiButton(
		'settings_overscan',
		'svg.zoom = 1; svg.refreshUI(true);',
		'Reset zoom'
	);
	this.zoomIcon = this.zoomIcon.shepherd;
	this.container.appendChild(this.zoomIcon.container);

	this.zoomOutIcon = new uiButton(
		'zoom_out',
		'svg.zoom -= .5; svg.refreshUI(true);',
		'Zoom out (Ctrl + -)'
	);
	this.zoomOutIcon = this.zoomOutIcon.shepherd;
	this.container.appendChild(this.zoomOutIcon.container);

    this.zoomValue = document.createElement("span");
    this.container.appendChild(this.zoomValue);

	this.refreshZoom();

	this.zoomInIcon = new uiButton(
		'zoom_in',
		'svg.zoom += .5; svg.refreshUI(true);',
		'Zoom in (Ctrl + +)'
	);
	this.zoomInIcon = this.zoomInIcon.shepherd;
	this.container.appendChild(this.zoomInIcon.container);

    this.spacing = document.createElement("span");
    this.spacing.style.cssText = "width : 4em;";
    this.container.appendChild(this.spacing);

	this.hideClockIcon = new uiButton(
		'timer',
		'anigenManager.classes.editor.clock.toggle();',
		'Hide/show clock'
	);
	this.hideClockIcon = this.hideClockIcon.shepherd;
	this.container.appendChild(this.hideClockIcon.container);

    this.clock = new clock(timeline);
    this.clock.display();
    this.container.appendChild(this.clock.container);

	this.rewindButton = new uiButton(
		[ 'restore'],
		[ 'svg.gotoTime(anigenManager.classes.editor.clock.minTime || 0);'],
		[ 'Rewind animations (Alt + Pause)']
	);
	this.rewindButton = this.rewindButton.shepherd;
	this.container.appendChild(this.rewindButton.container);

    this.spacing = document.createElement("span");
    this.spacing.style.cssText = "width : 1em;";
    this.container.appendChild(this.spacing);

	this.keyframeBackButton = new uiButton(
		[ 'arrow_back'],
		[ 'var trg = svg.selected.shepherd || svg.selected;if(typeof trg.getClosest === "function") { svg.gotoTime(trg.getClosest().previous.time); }'],
		[ 'Previous keyframe (Ctrl + ←)']
	);
	this.keyframeBackButton = this.keyframeBackButton.shepherd;
	this.container.appendChild(this.keyframeBackButton.container);

	this.fastRewindButton = new uiButton(
		[ 'fast_rewind'],
		[ 'svg.seek(-0.1*1);'],
		[ 'Seek Back (-)']
	);
	this.fastRewindButton = this.fastRewindButton.shepherd;
	this.container.appendChild(this.fastRewindButton.container);

	this.pauseButton = new uiButton(
		[ 'pause', 'play_arrow' ],
		[ 'svg.pauseToggle(false);', 'svg.pauseToggle(true);' ],
		[ 'Pause animations (Space)', 'Play animations (Space)' ]
	);
	this.pauseButton = this.pauseButton.shepherd;
	this.container.appendChild(this.pauseButton.container);

	this.fastForwardButton = new uiButton(
		[ 'fast_forward'],
		[ 'svg.seek(0.1*1);'],
		[ 'Seek Forward (+)']
	);
	this.fastForwardButton = this.fastForwardButton.shepherd;
	this.container.appendChild(this.fastForwardButton.container);

	this.keyframeForwardButton = new uiButton(
		[ 'arrow_forward'],
		[ 'var trg = svg.selected.shepherd || svg.selected;if(typeof trg.getClosest === "function") { svg.gotoTime(trg.getClosest().next.time); }'],
		[ 'Next keyframe (Ctrl + →)']
	);
	this.keyframeForwardButton = this.keyframeForwardButton.shepherd;
	this.container.appendChild(this.keyframeForwardButton.container);
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