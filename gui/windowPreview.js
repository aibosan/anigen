/**
 *  @author		Ondrej Benda
 *  @date		2017
 *  @copyright	GNU GPLv3
 *	@brief		Window for showing SVG preview as a popup.
 */
function windowPreview() {
	this.popup = null;
	this.ratio = 1;
	this.paused = false;
}

windowPreview.prototype.seed = function(soft) {
	if(!svg) { return; }
	if(soft && (!this.popup || this.popup.closed)) { return; }
	
	this.svg = svg.transferOut(null, { 'clean': false, 'unlink': false, 'wipeNotes': true, 'regenerate': true });
	
	if(!this.popup || this.popup.closed) {
		var specs = "";
			specs += 'width='+this.svgWidth+',height='+this.svgHeight+',';
			specs += 'left='+window.screenX+',top='+window.screenY;
		
		this.popup = window.open('', "AniGenPreview", specs);
		
		this.popup.document.title = svg.fileName+' preview';
		
		this.popup.document.body.style.margin = "0";
		this.popup.document.body.style.padding = "0";
		this.popup.document.body.style.backgroundColor = "black";
		this.popup.document.body.style.position = "relative";
		this.popup.document.body.style.width = "100%";
		this.popup.document.body.style.height = "100%";
		
		this.popup.addEventListener('keydown', this.eventKeyDown.bind(this), false);
		this.popup.addEventListener('wheel', this.eventWheel.bind(this), false);
	} else {
		while(this.popup.document.body.children[0]) {
			this.popup.document.body.removeChild(this.popup.document.body.children[0]);
		}
	}
	
	this.container = document.createElement('div');
	this.container.appendChild(this.svg);
	
	this.container.style.position = "absolute";
	this.container.style.backgroundColor = "white";
	this.container.style.top = "50%";
	this.container.style.left = "50%";
	this.container.style.transform = "translate(-50%,-50%)";
	
	this.svg.setAttribute('width', '100%');
	this.svg.setAttribute('height', '100%');
	
	this.popup.document.body.appendChild(this.container);
	
	if(!this.paused) {
		this.svg.unpauseAnimations();
	}
	
	this.refresh(null, true);
}

windowPreview.prototype.refresh = function(soft, resizeWindow) {
	if(!svg) { return; }
	if(soft && (!this.popup || this.popup.closed)) { return; }
	
	if(!this.popup || this.popup.closed) {
		this.seed();
		return;
	}
	
	var widthDesired = svg.svgWidth*this.ratio;
	var heightDesired = svg.svgHeight*this.ratio;
	
	var widthAddition = this.popup.outerWidth-this.popup.innerWidth;
	var heightAddition = this.popup.outerHeight-this.popup.innerHeight;
	
	this.container.style.width = widthDesired+'px';
	this.container.style.height = heightDesired+'px';
	
	if(resizeWindow) {
		this.popup.resizeTo(widthDesired+widthAddition+1, heightDesired+heightAddition+1);
	}
}

windowPreview.prototype.eventWheel = function(event) {
	if(event.ctrlKey) {
		event.preventDefault ? event.preventDefault() : event.returnValue = false;
		
		if(event.deltaY < 0) {
			this.ratio *= Math.sqrt(2);
		} else {
			this.ratio *= 1/Math.sqrt(2);
		}
		if(Math.abs(this.ratio - 1) < 0.1) { this.ratio = 1; }
		this.refresh(null, event.altKey);
	}
}

windowPreview.prototype.eventKeyDown = function(event) {
	if(event.key == 'F12') {
		return;
	}
	
	switch(event.key) {
		case 'Pause':
		case ' ':
			if(event.altKey) {
				this.svg.setCurrentTime(0);
			} else {
				if(this.svg.animationsPaused()) {
					this.svg.unpauseAnimations()
					this.paused = true;
				} else {
					this.svg.pauseAnimations()
					this.paused = false;
				}
			}
			break;
		case 'Enter':
			if(event.altKey) {
				this.ratio = 1;
			}
			this.refresh(null, true);
			break;
		case '+':		// plus
			var ratio = this.svg.animationsPaused() ? 1 : 10;
			if(event.shiftKey) {
				this.svg.setCurrentTime(this.svg.getCurrentTime()+1*ratio);
			} else if(event.altKey) {
				this.svg.setCurrentTime(this.svg.getCurrentTime()+0.01*ratio);
			} else {
				this.svg.setCurrentTime(this.svg.getCurrentTime()+0.1*ratio);
			}
			break;
		case '-':		// minus
			var ratio = this.svg.animationsPaused() ? 1 : 10;
			if(event.shiftKey) {
				this.svg.setCurrentTime(this.svg.getCurrentTime()-1*ratio);
			} else if(event.altKey) {
				this.svg.setCurrentTime(this.svg.getCurrentTime()-0.01*ratio);
			} else {
				this.svg.setCurrentTime(this.svg.getCurrentTime()-0.1*ratio);
			}
			break;
		case 'F5':
			this.paused = false;
			this.seed();
			break;
	}
	
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
}