/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		HTML <progress>-like bar created using <div> elements
 */
function progressBar(attributes) {
	this.container = document.createElement('div');
	this.container.setAttribute('class', 'progress');
	
	this.bar = document.createElement('div');
	this.container.appendChild(this.bar);
	
	this.labelCenter = document.createElement('div');
	this.container.appendChild(this.labelCenter);
	
	this.min = null;
	this.max = null;
	this.value = null;
	
	if(attributes) {
		for(var i in attributes) {
			this.container.setAttribute(i, attributes[i]);
		}
	}
	
	this.container.shepherd = this;
}

progressBar.prototype.refresh = function(label) {
	if(this.min == null || this.max == null || this.value == null) { return; }
	this.bar.setAttribute('style', 'width:' + 100*(this.value-this.min)/(this.max-this.min)+"%;");
	if(label) {
		this.setLabel(label);
	} else {
		this.setLabel(Math.round(100*(this.value-this.min)/(this.max-this.min))+"%");
	}
	
}

progressBar.prototype.setMin = function(min) {
	this.min = min;
	this.refresh();
}

progressBar.prototype.setMax = function(max) {
	this.max = max;
	this.refresh();
}

progressBar.prototype.setLabel = function(text) {
	this.labelCenter.innerHTML = text;
}

progressBar.prototype.setValue = function(value, label) {
	this.value = value;
	this.refresh(label);
}

progressBar.prototype.setIndefinite = function(bool) {
	if(bool) {
		this.container.addClass('indefinite');
	} else {
		this.container.removeClass('indefinite');
	}
}



