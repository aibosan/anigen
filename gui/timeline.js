/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Animation timeline UI element
 *	@warning	Currently not in user
 *	@todo		Update and use or get rid of
 */
function timeline() {
    this.container = document.createElement('div');
	this.container.setAttribute('class', 'timeline');
	
	this.redline = document.createElement('div');
	this.redline.setAttribute('class', 'redline');
	
	this.blueline = document.createElement('div');
	this.blueline.setAttribute('class', 'blueline');
	
	this.container.appendChild(this.redline);
	this.container.appendChild(this.blueline);
	
	this.unitWidth = 80;
	this.unitHeight = 50;
    this.zoom = 1;
	this.field = [ ];
	
	this.draggedElement = null;
	this.draggedRow = null;
	this.lastEvent = null;
	
	this.adjustRedline = function() {
		if(!svg.svgElement) { return; }
		this.redline.style.left = svg.svgElement.getCurrentTime() * this.unitWidth * this.zoom + 'px';
//		this.redline.style.height = this.container.scrollHeight + 'px';
		this.redline.style.height = '100%';
	};
	
	this.adjustBlueline = function() {
		if(!svg.svgElement || !infoEditor.clock.maxTime) { return; }
		this.blueline.style.left = infoEditor.clock.maxTime * this.unitWidth * this.zoom + 'px';
//		this.blueline.style.height = this.container.scrollHeight + 'px';
		this.blueline.style.height = '100%';
	};
	
	this.adjustRedline();
	
	
	this.rebuildRow = function(index) {
		if(index == null) { index = this.field.length-1; }
		if(this.container.children.length <= index) { return; }
		this.container.children[index].removeChildren();
		for(var i = 0; i < this.field[index].length; i++) {
			this.container.children[index].appendChild(this.field[index][i].element);
			this.field[index][i].refreshId();
		}
	}
	
	this.addRow = function(index) {
		var row = document.createElement('div');
		row.setAttribute('ondrop', 'timeline.eventDrop(event);');
		
		row.style.height = this.zoom * this.unitHeight + "px";
		row.style.paddingTop = 0.1 * this.zoom * this.unitHeight + "px";
		row.style.paddingBottom = 0.1 * this.zoom * this.unitHeight + "px";
		if(index == null || !this.container.children[index] || this.container.children[index] == this.redline || this.container.children[index] == this.blueline) {
			this.container.insertBefore(row, this.redline);
		} else {
			this.container.insertBefore(row, this.container.children[index]);
		}
	};
	
	this.removeRow = function(index) {
		if(index == null || !this.container.children[index] || this.container.children[index] == this.redline || this.container.children[index] == this.blueline) {
			return;
		}
		this.container.removeChild(this.container.children[index]);
	};
	
	this.add = function(timObj) {
		var toRow, toCol;
		
		for(var row = 0; row < this.field.length; row++) {
			for(var col = 0; col < this.field[row].length; col++) {
				if(col == 0) {
					if(this.field[row][col].left >= timObj.right) {
						toRow = row;
						toCol = col;
						break;
					}
				} else if(col == this.field[row].length-1) {
					if(this.field[row][col].right <= timObj.left) {
						toRow = row;
						toCol = col+1;
						break;
					}
				} else {
					if(this.field[row][col].right <= timObj.left &&
						this.field[row][col+1].left >= timObj.right) {
						toRow = row;
						toCol = col+1;
						break;
					}
				}
			}
			if(toRow != null && toCol != null) { break; }
		}
		if(toRow == null && toCol == null) {
			// no room - make new row
			this.field.push([ timObj ]);
			this.addRow();
			this.rebuildRow();
		} else {
			// room - add to row and rebuild it
			this.field[toRow].splice(toCol, 0, timObj);
			this.rebuildRow(toRow);
		}
	};
	
	this.clear = function() {
		this.field = [ ];
		this.container.removeChildren();
		this.container.appendChild(this.redline);
		this.container.appendChild(this.blueline);
	};
	
	this.refresh = function() {
		for(var i = 0; i < this.field.length; i++) {
			if(this.field[i].length == 0) {
				this.field.splice(i, 1);
				i--;
			}
		}
		
		for(var i = 0; i < this.container.children.length; i++) {
			if(this.container.children[i].getAttribute('class')) { break; }
			if(i >= this.field.length) {
				this.removeRow(i);
			} else {
				this.rebuildRow(i);
			}
		}
		
		for(var i = 0; i < this.container.children.length; i++) {
			if(this.container.children[i].getAttribute('class')) { break; }
			if(this.container.children[i].children.length == 0) {
				this.container.removeChild(this.container.children[i]);
				i--;
			}
		}
	};
	
	this.redraw = function() {
		for(var i = 0; i < this.container.children.length; i++) {
			if(this.container.children[i].getAttribute('class')) { break; }
			this.container.children[i].style.height = this.zoom * this.unitHeight + "px";
			this.container.children[i].style.paddingTop = 0.1 * this.zoom * this.unitHeight + "px";
			this.container.children[i].style.paddingBottom = 0.1 * this.zoom * this.unitHeight + "px";
		}
		
		for(var i = 0; i < this.field.length; i++) {
			for(var j = 0; j < this.field[i].length; j++) {
				this.field[i][j].refresh();
			}
		}
		
		this.adjustRedline();
		this.adjustBlueline();
	};
	
	this.rebuild = function(hard) {
		return;
		
		if(hard) {
			this.clear();
		}
		
		var deletions = [];
		
		for(var i = 0; i < this.field.length; i++) {
			for(var j = 0; j < this.field[i].length; j++) {
				if(!this.field[i][j].animation.element.isChildOf(svg.svgElement)) {
					deletions.push(this.field[i][j]);
					this.field[i].splice(j, 1);
					j--;
				}
			}
		}
		
		var additions = [];
		
		/*
        for(var i = 0; i < svg.animations.length; i++) {
			if(this.field.length == 0 || !svg.animations[i].timelineObject) {
				var obj = svg.animations[i].timelineObject || new timelineObject(svg.animations[i]);
				additions.push(obj);
			}
        }
		*/
		/*
		for(var i = 0; i < svg.animationGroups.length; i++) {
            if(this.field.length == 0 || !svg.animationGroups[i].timelineObject) {
				var obj = svg.animationGroups[i].timelineObject || new timelineObject(svg.animationGroups[i]);
				additions.push(obj);
			}
        }
		*/
		
		for(var i = 0; i < additions.length; i++) {
			this.add(additions[i]);
		}
		
		this.adjustRedline();
		this.refresh();
    };
	
	this.moveToRow = function(timObj, fromRow, toRow) {
		if(fromRow == toRow) { return; }
		
		var afterCol = 0;
		var displaced = 0;
		
		for(var col = 0; col < this.field[toRow].length; col++) {
			if(this.field[toRow][col].right <= timObj.left) { 
				afterCol = col+1;
			} else if(this.field[toRow][col].left < timObj.right) {
				displaced++;
			}
		}
		
		this.field[fromRow].splice(this.field[fromRow].indexOf(timObj), 1);
		
		if(displaced > 0) {
			var newRowObjects = this.field[toRow].splice(afterCol, displaced);
			this.field[toRow].splice(afterCol, 0, timObj);
			if(this.field[fromRow].length == 0) {
				this.field[fromRow] = newRowObjects;
			} else {
				if(toRow > fromRow) {
					this.field.splice(toRow+1, 0, newRowObjects);
				} else {
					this.field.splice(toRow, 0, newRowObjects);
				}
				this.addRow(toRow);
			}
		} else {
			this.field[toRow].splice(afterCol, 0, timObj);
			if(this.field[fromRow].length == 0) {
				this.field.splice(fromRow, 1);
			}
		}
		
		this.refresh();
	};

	this.zoomTo = function(zoomIn) {
		if(zoomIn) {
			this.zoom *= Math.sqrt(2);
		} else {
			this.zoom *= 1/Math.sqrt(2);
		}
		if(Math.abs(this.zoom - 1) < 0.1) { this.zoom = 1; }
		this.redraw();
	};
	
	this.eventDragStart = function(evt) {
		this.draggedElement = evt.target.parentNode;
		this.draggedRow = this.draggedElement.parentNode;
	};
	
	this.eventDrop = function(evt) {
		if(this.draggedElement == null || this.draggedRow == null) { return; }
		var targ = evt.target;
		while(targ.parentNode && targ.parentNode.getAttribute('class') != 'timeline') {
			targ = targ.parentNode;
		}
		
		var fromRow;
		var toRow;
		
		for(var i = 0; i < targ.parentNode.children.length; i++) {
			if(targ.parentNode.children[i] == this.draggedRow) {
				fromRow = i;
			}
			if(targ.parentNode.children[i] == targ) {
				toRow = i;
			}
			if(toRow != null && fromRow != null) { break; }
		}
		
		this.moveToRow(this.draggedElement.shepherd, fromRow, toRow);
		
		this.draggedElement = null;
		this.draggedRow = null;
	};
	
	this.eventSliderDrag = function(evt) {
		evt.stopPropagation();
	};
	
	this.eventMouseDown = function(evt) {
		if(evt.target.getAttribute('class') != 'sliderLeft' && evt.target.getAttribute('class') != 'sliderRight') { return; }
		timeline.draggedElement = evt.target;
		timeline.lastEvent = evt;
		
	};
	
	this.eventMouseMove = function(evt) {
		if(!timeline.lastEvent || !timeline.draggedElement) { return; }
		var dX = (evt.clientX - timeline.lastEvent.clientX)/(timeline.zoom*timeline.unitWidth);
		if(timeline.draggedElement.getAttribute('class') == 'sliderRight') {
			timeline.draggedElement.parentNode.shepherd.right += dX;
		} else {
			timeline.draggedElement.parentNode.shepherd.left += dX;
			timeline.draggedElement.parentNode.shepherd.right += dX;
		}
		if(evt.ctrlKey) {
			timeline.draggedElement.parentNode.shepherd.passValues(10);
		} else {
			timeline.draggedElement.parentNode.shepherd.passValues(100);
		}
		timeline.draggedElement.parentNode.shepherd.refresh();
		timeline.lastEvent = evt;
	};
	
	this.eventMouseUp = function(evt) {
		if(!timeline.lastEvent || !timeline.draggedElement) { return; }
		if(evt.ctrlKey) {
			timeline.draggedElement.parentNode.shepherd.passValues(10);
		} else {
			timeline.draggedElement.parentNode.shepherd.passValues(100);
		}
		timeline.lastEvent = null;
	};
	
	this.eventMouseWheel = function(evt) {
		if(evt.ctrlKey) {
			timeline.zoomTo((evt.wheelDelta > 0));
        }
	};
}