/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for HTML "select" element
 */
 
HTMLSelectElement.prototype.setSelected = function(index) {
	index = parseInt(index);
	if(index == null || isNaN(index)) { return; }
	if(index < 0 || index >= this.children.length) { throw new DOMException(1); }
	for(var i = 0; i < this.children.length; i++) {
		if(index == i) {
			this.children[i].setAttribute('selected', 'selected');
			this.value = this.children[i].value;
		} else {
			this.children[i].removeAttribute('selected');
		}
	}
}

HTMLSelectElement.prototype.enableOption = function(index) {
	if(index == null) { return; }
	if(index < 0 || index >= this.children.length) { throw new DOMException(1); }
	this.children[index].removeAttribute('disabled');
}

HTMLSelectElement.prototype.disableOption = function(index) {
	if(index == null) { return; }
	if(index < 0 || index >= this.children.length) { throw new DOMException(1); }
	this.children[index].setAttribute('disabled', 'disabled');
}