/**
 *  @author		Ondrej Benda
 *  @date		2011-2017
 *  @copyright	GNU GPLv3
 *	@brief		Vertical UI break
 */
function uiBreak(classes) {
	this.container = document.createElement('div')
	
	this.container.setAttribute('class', 'uiBreak');
	if(classes) { this.container.addClass(classes); }
	
	return this.container;
}



