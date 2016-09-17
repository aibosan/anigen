/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		History element (representing a single step) for changing element's attributes
 */
function historyAttribute(targetId, attributesFrom, attributesTo, collapsible) {
	this.timestamp = Date.now();
	this.collapsible = collapsible || false;
	
	this.targetId = targetId;
	this.attributesFrom = attributesFrom || [];
	this.attributesTo = attributesTo || [];
	
	
	this.undo = function() {
		var el = document.getElementById(this.targetId);
		if(!el) { return false; }
		for(var i in this.attributesFrom) {
			if(this.attributesFrom[i] == null) {
				el.removeAttribute(i);
			} else {
				el.setAttribute(i, this.attributesFrom[i]);
			}
		}
		if(el.shepherd && el.shepherd instanceof SVGAnimationElement) {
			el.shepherd.commitAll(true);
		}
		return true;
	};
	
	this.redo = function() {
		var el = document.getElementById(this.targetId);
		if(!el) { return false; }
		for(var i in this.attributesTo) {
			if(this.attributesTo[i] == null) {
				el.removeAttribute(i);
			} else {
				el.setAttribute(i, this.attributesTo[i]);
			}
		}
		if(el.shepherd && el.shepherd instanceof SVGAnimationElement) {
			el.shepherd.commitAll(true);
		}
		return true;
	};
	
	this.devour = function(other) {
		if(!(other instanceof historyAttribute)) { return false; }
		
		if(other.timestamp >= this.timestamp) {
			for(var i in other.attributesTo) {
				this.attributesTo[i] = other.attributesTo[i];
			}
			for(var i in other.attributesFrom) {
				if(this.attributesFrom[i] == null) {
					this.attributesFrom[i] = other.attributesFrom[i];
				}
			}
			this.timestamp = other.timestamp;
		} else {
			for(var i in other.attributesFrom) {
				this.attributesFrom[i] = other.attributesFrom[i];
			}
			for(var i in other.attributesTo) {
				if(this.attributesTo[i] == null) {
					this.attributesTo[i] = other.attributesTo[i];
				}
			}
		}
		
		return true;
		
	};
}