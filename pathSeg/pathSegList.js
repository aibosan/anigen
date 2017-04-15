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
	this.length = 0;
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


pathSegList.prototype.transform = function(matrix) {
	if(!matrix || !(matrix instanceof SVGMatrix)) { return; }
	for(var i = 0; i < this.arr.length; i++) {
		this.arr[i] = this.arr[i].transform(matrix);
	}
	return this;
}


// returns string path data ("d")
pathSegList.prototype.toString = function() {
	return this.arr.join(' ');
}

// returns total length
pathSegList.prototype.getLength = function(lastPoint, segments) {
	segments = segments || 10000;	// why not
	var sum = 0;
	var last = null;
	var lastM = null;
	for(var i = 0; i < this.arr.length; i++) {
		if(this.arr[i] instanceof pathSegMoveto) { lastM = this.arr[i]; }
		if(!last) {
			last = { 'x': (this.arr[i].x || 0), 'y': (this.arr[i].y || 0) };
			continue;
		}
		sum += this.arr[i].getLength(last, segments, lastM);
		
		if(lastPoint != null && lastPoint == i) { return sum; }
		
		if(this.arr[i].x != null) { last.x = this.arr[i].x; }
		if(this.arr[i].y != null) { last.y = this.arr[i].y; }
	}
	return sum;
}

pathSegList.prototype.getPointAtLength = function(distance, segments) {
	var index = this.getPathSegAtLength(distance, segments);
	
	if(index == 0) { 
		return { 'x': this.arr[0].x, 'y': this.arr[0].y };
	}
	
	distance -= this.getLength(index-1);
	var segLength = this.arr[index].getLength(this.arr[index-1], segments);
	return this.arr[index].getValue((distance/segLength), this.arr[index-1]);
}

pathSegList.prototype.getPathSegAtLength = function(distance, segments) {
	var sum = 0;
	var last = null;
	var lastM;
	for(var i = 0; i < this.arr.length; i++) {
		if(sum > distance) { return i; }
		if(this.arr[i] instanceof pathSegMoveto) { lastM = this.arr[i]; }
		if(!last) {
			last = { 'x': this.arr[i].x || 0, 'y': this.arr[i].y || 0 };
			continue;
		}
		sum += this.arr[i].getLength(last, segments, lastM);
		
		if(this.arr[i].x != null) { last.x = this.arr[i].x; }
		if(this.arr[i].y != null) { last.y = this.arr[i].y; }
	}
	return (this.arr.length-1);
}