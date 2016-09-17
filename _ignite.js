/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Sets namespace global variables and instances of the core classes (root and anigenActual)
 */
var svgNS = "http://www.w3.org/2000/svg";
var xlinkNS = "http://www.w3.org/1999/xlink";
var sodipodiNS = "http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd";
var anigenNS = "http://www.anigen.org/namespace";

var svg = new root();

var anigenActual = new anigenActual();

window.addEventListener("keydown", anigenActual.eventKeyDown, false);
window.addEventListener("resize", anigenActual.eventResize, false);
window.addEventListener("mousewheel", wheelPreventDefault, false);
window.addEventListener("wheel", wheelPreventDefault, false);

function wheelPreventDefault(evt)
{
    if(evt.ctrlKey || evt.altKey || evt.shiftKey) {
        evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
    }
}