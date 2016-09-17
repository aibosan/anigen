/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Object in timeline UI
 *	@warning	Currently not in user
 *	@todo		Use or get rid of
 */
function timelineObject(target, floor) {
	if(!target ||
		!(	target instanceof animate || target instanceof animateTransform ||
			target instanceof animateMotion || target instanceof animationGroup)) { return; }
	
	this.left = 0;
	this.right = 0;
	this.preferedRow = null;
	
	this.refresh = function() {
		this.element.style.left = (timeline.unitWidth * this.left * timeline.zoom) + "px";
		this.element.style.width = (timeline.unitWidth * (this.right-this.left) * timeline.zoom) + "px";
		this.element.style.fontSize = (timeline.unitHeight * timeline.zoom * 0.25) + "px";
		this.sliderLeft.style.width = (timeline.unitWidth * timeline.zoom * 0.2) + "px";
		this.sliderRight.style.width = (timeline.unitWidth * timeline.zoom * 0.2) + "px";
	};
	
	this.takeValues = function() {
		console.log(this.animation);
		this.animation.getBeginList();
		this.animation.getDur();
		this.left = this.animation.beginList[0].value;
		this.right = this.animation.beginList[0].value + this.animation.dur.value;
		this.refresh();
	};
	
	// CONSTRUCTOR
	
	this.animation = target;
	this.animation.timelineObject = this;
	
    this.element = document.createElement('div');
	this.element.shepherd = this;
	
	this.middle = document.createElement('div');
	this.element.appendChild(this.middle);
	
	this.idContainer = document.createElement('span');
	this.idContainer.appendChild(document.createTextNode(this.animation.element.id));
	this.middle.appendChild(this.idContainer);
	this.middle.appendChild(document.createElement('br'));
	
	this.idContainer.shepherd = this.animation.element;
	this.idContainer.setAttribute('onclick', 'svg.select(this.shepherd);');
	
	this.sliderLeft = document.createElement('div');
	this.sliderLeft.setAttribute('class', 'sliderLeft');
	this.element.appendChild(this.sliderLeft);
	
	this.sliderRight = document.createElement('div');
	this.sliderRight.setAttribute('class', 'sliderRight');
	this.element.appendChild(this.sliderRight);
		
	this.middle.setAttribute('draggable', 'true');
	this.middle.setAttribute('ondragstart', 'timeline.eventDragStart(event);');
	
	this.sliderRight.addEventListener("mousedown", timeline.eventMouseDown, false);
	this.sliderLeft.addEventListener("mousedown", timeline.eventMouseDown, false);
	
	this.takeValues();
	
	this.element.setAttribute('class', 'timelineObject');
	
		/*	0 - animate		1 - motion		2 - translate
			3 - rotate		4 - scale		5 - skewX
			6 - skewY		7 - animtion group					*/
	switch(this.animation.type) {
		case 0:
			this.element.addClass('timelineAnimate');
			this.middle.appendChild(document.createTextNode("(Attribute: " + this.animation.attribute + ")"));
			break;
		case 1:
			this.element.addClass('timelineMotion');
			this.middle.appendChild(document.createTextNode("(Motion along path)"));
			break;
		case 2:
			this.element.addClass('timelineTranslate');
			this.middle.appendChild(document.createTextNode("(Translate)"));
			break;
		case 3:
			this.element.addClass('timelineRotate');
			this.middle.appendChild(document.createTextNode("(Rotate)"));
			break;
		case 4:
			this.element.addClass('timelineScale');
			this.middle.appendChild(document.createTextNode("(Scale)"));
			break;
		case 5:
			this.element.setAttribute('class', 'timelineObject timelineSkewX');
			this.middle.appendChild(document.createTextNode("(Horizontal skew)"));
			break;
		case 6:
			this.element.setAttribute('class', 'timelineObject timelineSkewY');
			this.middle.appendChild(document.createTextNode("(Vertical skew)"));
			break;
		case 7:
			this.element.setAttribute('class', 'timelineObject timelineAnimationGroup');
			this.middle.appendChild(document.createTextNode("(Animated group: " + this.animation.groupName + ")"));
			break;
	}
	
	this.refresh();
	
	// CONSTRUCTOR ENDS
	
	this.refreshId = function() {
		this.idContainer.removeChildren();
		this.idContainer.appendChild(document.createTextNode(this.animation.element.id));
	};
	
	this.passValues = function(round) {
		var newDur = Math.round((this.right-this.left)*round)/round;
		this.left = Math.round(this.left*round)/round;
		this.right = Math.round(this.right*round)/round;
		this.refresh();
		this.animation.setBegin(0, this.left);
		this.animation.setDur(newDur);
		windowAnimation.refresh();
	};
	
	
}