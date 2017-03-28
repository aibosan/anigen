/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		History element (representing a single step) for changing element's attributes
 */
function historyAttribute(targetId, attributesFrom, attributesTo, collapsible) {
	if(targetId == null || targetId.length == 0) { return null; }
	
	this.timestamp = Date.now();
	this.collapsible = collapsible || false;
	this.targetId = targetId;
	this.attributesFrom = attributesFrom || [];
	this.attributesTo = attributesTo || [];
	
	
	this.undo = function() {
		var el = document.getElementById(this.targetId);
		if(!el) { 
			log.error('<span class="tab"></span><span class="tab"></span>Target element <strong>'+this.targetId+'</strong> for attribute change is missing!', 1);
			return false;
		}
		var allNames = [];
		for(var i in this.attributesFrom) {
			allNames.push(i);
			if(this.attributesFrom[i] == null) {
				el.removeAttribute(i);
			} else {
				el.setAttribute(i, this.attributesFrom[i]);
			}
		}
		if(typeof el.commit === 'function') { el.commit(true); }
		if(el.shepherd && el.shepherd instanceof SVGAnimationElement) {
			el.shepherd.commit(true);
		}
		log.report('<span class="tab"></span><strong>'+this.targetId+'</strong> attributes <em>'+allNames.join(',')+'</em> reverted.', 1);
		
		return true;
	};
	
	this.redo = function() {
		var el = document.getElementById(this.targetId);
		if(!el) {
			log.report('<span class="tab"></span><span class="tab"></span>Target element <strong>'+this.targetId+'</strong> for attribute change is missing!</span>', 1);
			return false;
		}
		var allNames = [];
		for(var i in this.attributesTo) {
			allNames.push(i);
			if(this.attributesTo[i] == null) {
				el.removeAttribute(i);
			} else {
				el.setAttribute(i, this.attributesTo[i]);
			}
		}
		if(typeof el.commit === 'function') { el.commit(true); }
		if(el.shepherd && el.shepherd instanceof SVGAnimationElement) {
			el.shepherd.commit(true);
		}
		log.report('<span class="tab"></span><strong>'+this.targetId+'</strong> attributes <em>'+allNames.join(',')+'</em> remade.', 1);
		
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