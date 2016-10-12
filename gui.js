/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Builds up the UI
 */

/* Top portion */
var infoEditor = new infoEditor();
infoEditor.refreshZoom();

var infoSelection = new infoSelection();
infoSelection.refresh();

var infoContext = new infoContext();

var containerMenu = document.createElement("div");
containerMenu.id = "anigenMenu";

var menu = new menu(containerMenu);

var windowAnimation = new windowAnimation();
var windowLayers = new windowLayers();

window.addEventListener('mouseover', anigenActual.eventMouseOver, false);

var timeline = new timeline();

var tree = new tree();


/* Page layout */
$('#anigenGUI').w2layout({
    name: 'layout',
    panels: [
        { type: 'top',  size: 112, resizable: false, content: [ infoEditor.container, containerMenu, infoSelection.container, infoContext.container ], style: "overflow: hidden"  },
        { type: 'left', size: 256, resizable: true, content: tree.container, style: "left:3px" },
        { type: 'main', style: "display: none" },	
/*        { type: 'preview', size: '50%', resizable: true, content: 'preview' }, */
        { type: 'right', size: 256, resizable: true, content: [ windowAnimation.container, windowLayers.container ], style: "overflow-x: hidden" },
        { type: 'bottom', size: 96, resizable: true, content: [ timeline.container ] }
    ],
    onResizing: anigenActual.eventResize,
	onResize: anigenActual.eventResizeDone
});

anigenActual.checkWindows();


var main = w2ui['layout'].el('main');
if(main) { main.parentNode.parentNode.removeChild(main.parentNode); }

infoContext.seed();
windowAnimation.seed();
windowLayers.seed();

/* Main event handling */
var main = document.getElementById("anigenCanvas");
if(main != null) {
    main.addEventListener("mousemove", anigenActual.eventMouseMove, false);
    main.addEventListener("mousedown", anigenActual.eventMouseDown, false);
    main.addEventListener("mouseup", anigenActual.eventMouseUp, false);
    main.addEventListener("click", anigenActual.eventClick, false);
    main.addEventListener("dblclick", anigenActual.eventDblClick, false);
    main.addEventListener("mousewheel", anigenActual.eventScroll, false);
    main.addEventListener("wheel", anigenActual.eventScroll, false);
}

var bot = w2ui['layout'].el('bottom');
if(bot) {
	//bot.addEventListener("mousedown", timeline.eventMouseDown, false);
	bot.addEventListener("mousemove", timeline.eventMouseMove, false);
	bot.addEventListener("mouseup", timeline.eventMouseUp, false);
	bot.addEventListener("mousewheel", timeline.eventMouseWheel, false);
}

window.addEventListener("contextmenu", anigenActual.eventContextMenu, false);
window.addEventListener("click", anigenActual.eventClickWindow, false);
window.addEventListener("change", anigenActual.eventChange, false);

window.addEventListener("beforeunload", anigenActual.eventNavigation, false);

window.addEventListener("dragover", anigenActual.eventPreventDefault, false);
window.addEventListener("drop", anigenActual.eventFileDrop, false);

/* Other */
var popup = new popup();
var overlay = new overlay();


if(anigenActual.isConfirmed()) {
    overlay.macroOpen();
} else {
    overlay.macroDisclaimer();
}

window.addEventListener('resize', anigenActual.eventResize, false);

anigenActual.settings.loadData();
anigenActual.settings.apply();