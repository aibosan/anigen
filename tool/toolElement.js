/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Element selection tool
 */
function toolElement() {
	toolGroup.call(this);
}

toolElement.prototype = Object.create(toolGroup.prototype);

toolElement.prototype.mouseClick = function(event) {
	if(!svg || !(svg instanceof root)) { return; }
	if(event.button != 0) { return; }
	if(typeof event.target.isInsensitive !== 'function' || event.target.isInsensitive()) { return; }
	
	if(svg.selected == event.target) { svg.ui.selectionBox.showRotation = !svg.ui.selectionBox.showRotation; }
	svg.select(event.target);
}
