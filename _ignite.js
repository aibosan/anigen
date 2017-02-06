/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Sets namespace global variables and instances of the core classes (root, anigenActual, and uiManager)
 */
var svgNS = "http://www.w3.org/2000/svg";
var xlinkNS = "http://www.w3.org/1999/xlink";
var sodipodiNS = "http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd";
var anigenNS = "http://www.anigen.org/namespace";

new root();
new anigenActual();
new uiManager().seedAnigen();