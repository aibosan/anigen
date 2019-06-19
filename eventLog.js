function eventLog() {
	this.container = document.createElement('div');
	this.container.setAttribute('class', 'eventLog');
	
	this.lastEntry = null;
	this.lastDate = null;
	
	this.report('Event log initialized.');
	
	this.keep = false;
	
	this.verbosity = 0;			// how much stuff to report
		// recommendation:	0: necessary (copy/pasting, etc.)
		// 					1: clustered (individual history steps in small detail)
		// 					2: extreme (individual events)

	this.container.addEventListener("wheel", this.eventScroll, false);
	
	window.addEventListener('error', function(event) {
		if(!event.error) { return; }
		if(event.error.stack) {
			var parts = event.error.stack.split(/\r?\n/);
				for(var i = 0; i < parts.length; i++) {
					if(i > 0) {
						logger.error('<span class="tab"></span>' + parts[i].replace(/http.*\//, '<span class="black">').replace(/\)$/, '</span>)'));
					} else {
						logger.error(parts[i]);
					}
				}
			logger.heightTo(parts.length);
		} else {
			logger.error(event.error.message);
			logger.error('<span class="tab"></span>at <span class="black">' + event.filename.replace(/^.*\//, '') + ':' + event.lineno + '</span>');
			logger.heightTo(2);
		}
	  
	}, false);
}


eventLog.prototype.report = function(text, verbosity, inClass) {
	if(verbosity && verbosity > this.verbosity) { return; }
	
	this.lastEntry = text;
	var entry = document.createElement('p');
	if(inClass) { entry.setAttribute('class', inClass); }
	this.lastDate = new Date();
	
	var time = '[';
		time += ('00'+String(this.lastDate.getHours())).slice(-2);
		time += ':';
		time += ('00'+String(this.lastDate.getMinutes())).slice(-2);
		time += ':';
		time += ('00'+String(this.lastDate.getSeconds())).slice(-2);
		time += '.';
		time += ('000'+String(this.lastDate.getMilliseconds())).slice(-3);
		time += '] ';
	
	var timeSpan = document.createElement('span');
		timeSpan.setAttribute('class', 'time');
		timeSpan.appendChild(document.createTextNode(time));
		
	entry.appendChild(timeSpan);
	entry.innerHTML += text;
		
	this.container.appendChild(entry);
	
	this.scrollDown();
}

eventLog.prototype.error = function(text, verbosity) {
	this.report(text, verbosity, 'error');
}

eventLog.prototype.warn = function(text, verbosity) {
	this.report(text, verbosity, 'warn');
}

eventLog.prototype.clear = function() {
	while(this.container.children[0]) {
		this.container.removeChild(this.container.children[0]);
	}
}


eventLog.prototype.scrollDown = function() {
	this.container.scrollTop = this.container.scrollHeight;
}

eventLog.prototype.eventScroll = function(event) {
	var scrollTo = logger.container.scrollTop;
	if((event.deltaY || event.deltaX) < 0) {
		scrollTo -= 24;
	} else {
		scrollTo += 24;
	}
	if(scrollTo < 0) { scrollTo = 0; }
	if(scrollTo >= logger.container.scrollHeight-logger.container.clientHeight) {
		scrollTo = logger.container.scrollHeight-logger.container.clientHeight;
	}
	logger.container.scrollTop = scrollTo;
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
}

eventLog.prototype.heightTo = function(rows) {
	if(!anigenManager || !anigenManager.named || !anigenManager.named.bottom) {
		return;
	}
	
	var desired = 24*rows;
	
	if(anigenManager.named.bottom.height == desired) { return; }
	
	anigenManager.named.bottom.setY(anigenManager.named.bottom.y + anigenManager.named.bottom.height - desired);
	anigenManager.named.bottom.refresh();
	anigenManager.named.left.refresh();
	anigenManager.named.right.refresh();
}

window.logger = new eventLog();

