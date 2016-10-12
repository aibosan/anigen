/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Implements SVGPathSegList (https://www.w3.org/TR/SVG/paths.html#InterfaceSVGPathSegList) and expands with .toString() method
 */
function pathSegList() {
	this.arr = [];
	this.length = 0;
}

// removes all items
pathSegList.prototype.clear = function() {
	this.arr = [];
}

// throws DOMException if index is out of bounds
// returns item at index
pathSegList.prototype.getItem = function(index) {
	if(index < 0 || index >= this.arr.length) {	throw new DOMException(1); }
	
	return this.arr[index];
}

// inserts pathSeg object before given index
// throws DOMexception if index is out of bounds
// returns added item
pathSegList.prototype.insertItemBefore = function(newItem, index) {
	if(!(newItem instanceof pathSeg)) { return; }
	if(index < 0 || index >= this.arr.length) {	throw new DOMException(1); }
	
	this.arr.splice(index, 0, newItem);
	this.length = this.arr.length;
	return this.arr(index);
}

// replaces item at index with given item (not a clone)
// throws DOMException if index is out of bounds
// returns added item
pathSegList.prototype.replaceItem = function(newItem, index) {
	if(!(newItem instanceof pathSeg)) { return; }
	if(index < 0 || index >= this.arr.length) {	throw new DOMException(1); }
	
	this.arr[index] = newItem;
	return newItem;
}

// removes item at index
// throws DOMException if index is out of bounds
// returns removed item
pathSegList.prototype.removeItem = function(index) {
	if(index < 0 || index >= this.arr.length) {	throw new DOMException(1); }
	var item = this.arr.splice(index, 1)[0];
	this.length = this.arr.length;
	return item;
}

// appends pathSeg object
// return added item
pathSegList.prototype.appendItem = function(newItem) {
	if(!(newItem instanceof pathSeg)) { return; }
	
	this.arr.push(newItem);
	this.length = this.arr.length;
	return newItem;
}

// sums with another path list, adding each value to its respective counterpart
pathSegList.prototype.sum = function(other) {
	if(!(other instanceof pathSegList) || other.arr.length != this.arr.length) { return; }
	for(var i = 0; i < this.arr.length; i++) {
		this.arr[i].sum(other.arr[i]);
	}
	return this;
}

// returns string path data ("d")
pathSegList.prototype.toString = function() {
	return this.arr.join(' ');
}