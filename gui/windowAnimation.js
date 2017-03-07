/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Window UI element for editing animations
 */
function windowAnimation() {
	windowGeneric.call(this, 'keyframes');
	this.dragged = null;
	this.animation = null;
	this.selected = [];
	this.lastSelect = null;
	
	this.seed();
}

windowAnimation.prototype = Object.create(windowGeneric.prototype);
windowAnimation.prototype.constructor = windowAnimation;

windowAnimation.prototype.seed = function() {
	this.setHeading('Keyframes and timing (Ctrl+Shift+K)');
	this.setImage('hourglass_empty');
	
	this.imgRight.actions = [ "anigenManager.classes.windowAnimation.hide();anigenManager.classes.context.buttons.keyframes.setState(0);" ];
	
	this.tab1 = this.addTab('Keyframes');
	this.tab2 = this.addTab('Begin list');
	this.tab3 = this.addTab('Animated attributes');
	
	this.tab1.addEventListener('contextmenu', this.eventContextMenu, false);
	this.tab1.addEventListener('change', this.eventChange, false);
	this.tab1.addEventListener('click', this.eventClick, false);
	//this.tab1.addEventListener('dblclick', this.eventDblClick, false);
	
	this.tab1.addEventListener('dragstart', this.eventDragStart, false);
	this.tab1.addEventListener('dragover', this.eventDragOver, false);
	this.tab1.addEventListener('dragleave', this.eventDragLeave, false);
	this.tab1.addEventListener('drop', this.eventDrop, false);
	
	this.ui = {};
	
	this.ui.dur = build.input('number', null, {'min': '0', 'onchange': 'if(!anigenManager.classes.windowAnimation.animation){return;};anigenManager.classes.windowAnimation.animation.setDur(this.value, anigenManager.classes.windowAnimation.ui.keepTimes.checked, anigenManager.classes.windowAnimation.ui.adjustBegins.checked);anigenManager.classes.windowAnimation.animation.commit();anigenManager.classes.windowAnimation.refreshBegins();anigenManager.classes.windowAnimation.refreshKeyframes();'});
	this.ui.keepTimes = build.input('checkbox', null, { 'label': 'Keep times', 'title': 'Maintains times instead of percentage values. Overflowing values default to maximum time.'  });
	this.ui.keepTimes = this.ui.keepTimes.children[0];
	this.ui.adjustBegins = build.input('checkbox', null, { 'label': 'Adjust begins', 'title': 'Adjust begin times as duration changes.'  }),
	this.ui.adjustBegins = this.ui.adjustBegins.children[0];
//	this.ui.resetDur = build.button("←");
	
	this.ui.repeatCount = build.input('number', null, { 'min:': '0', 'onchange': 'if(!anigenManager.classes.windowAnimation.animation){return;};anigenManager.classes.windowAnimation.animation.setRepeatCount(this.value, true);anigenManager.classes.windowAnimation.animation.commit();anigenManager.classes.windowAnimation.refreshBegins();anigenManager.classes.windowAnimation.refreshKeyframes();'});
	this.ui.indefinite = build.input('checkbox', null, { 'label': 'Indefinite', 'title': 'Animation will repeat forever, or until halted by outside source.', 'onchange': 'if(!anigenManager.classes.windowAnimation.animation){return;};if(this.checked){anigenManager.classes.windowAnimation.animation.setRepeatCount("indefinite", true);this.parentNode.parentNode.previousElementSibling.children[0].setAttribute("disabled", "disabled");}else{anigenManager.classes.windowAnimation.animation.setRepeatCount(this.parentNode.parentNode.previousElementSibling.children[0].value, true);this.parentNode.parentNode.previousElementSibling.children[0].removeAttribute("disabled");};anigenManager.classes.windowAnimation.animation.commit();anigenManager.classes.windowAnimation.refreshBegins();anigenManager.classes.windowAnimation.refreshKeyframes();'});
	this.ui.indefinite = this.ui.indefinite.children[0];
//	this.ui.resetRepeat = build.button("←");
	
	var table = build.table([
		[ "Duration", this.ui.dur, this.ui.keepTimes.parentNode ],
		[ "Repeat count", this.ui.repeatCount, this.ui.indefinite.parentNode ]
	]);
	table.setAttribute('class', 'inputs');
	this.footer.appendChild(table);
	
	this.ui.fill = build.select([
		{ 'text': 'original', 'value': 'remove', 'title': 'After animation finishes, the element returns to its original state' },
		{ 'text': 'from animation', 'value': 'freeze', 'title': 'After animation finishes, the element keeps the last state the animation imposed upon it' }
	], { 'onchange': 'if(!anigenManager.classes.windowAnimation.animation){return;};anigenManager.classes.windowAnimation.animation.setFill(this.value);anigenManager.classes.windowAnimation.animation.commit();' });
	this.ui.additive = build.select([
		{ 'text': 'no', 'value': 'replace', 'title': 'Animation completely replaces values present in the element' },
		{ 'text': 'yes', 'value': 'sum', 'title': 'Animation adds to the values already present in the element' }
	], { 'onchange': 'if(!anigenManager.classes.windowAnimation.animation){return;};anigenManager.classes.windowAnimation.animation.setAdditive(this.value);anigenManager.classes.windowAnimation.animation.commit();' });
	this.ui.accumulate = build.select([
		{ 'text': 'no', 'value': 'none', 'title': 'Animation effects do not accumulate' },
		{ 'text': 'yes', 'value': 'sum', 'title': 'Animation effects cumulate with each repeat of the animation' }
	], { 'onchange': 'if(!anigenManager.classes.windowAnimation.animation){return;};anigenManager.classes.windowAnimation.animation.setAccumulate(this.value);anigenManager.classes.windowAnimation.animation.commit();' });
	this.ui.calcMode = build.select([
		{ 'value': 'linear', 'title': 'Change between key frames is always linear' },
		{ 'value': 'spline', 'title': 'Allows linear or non-linear change between key frames' },
		{ 'value': 'paced', 'title': 'Evenly paces between given values. Movement through path only' },
		{ 'value': 'discrete', 'title': 'Animation will jump from one value to the next without interpolation' }
	], { 'onchange': 'if(!anigenManager.classes.windowAnimation.animation){return;};anigenManager.classes.windowAnimation.animation.setCalcMode(this.value);anigenManager.classes.windowAnimation.animation.commit();anigenManager.classes.windowAnimation.refreshKeyframes();' });
	
	array = [
		[ 'Interpolation mode', this.ui.calcMode ],
		[ 'Post-animation state', this.ui.fill ],
		[ 'Additive', this.ui.additive ],
		[ 'Cumulative', this.ui.accumulate ]
	];
	
	table = build.table(array);
	table.setAttribute('class', 'begins');
	this.footer.appendChild(table);
}

windowAnimation.prototype.refreshInputs = function() {
	if(!this.animation) { return; }
	
	this.animation.getRepeatCount();
	this.animation.getDur();
	
	this.animation.getFill();
	this.animation.getAdditive();
	this.animation.getAccumulate();
	
	this.ui.dur.value = this.animation.dur.value;
//	this.ui.resetDur.setAttribute("onclick", "if(!windowAnimation.animation){return;};windowAnimation.animation.setDur('"+this.animation.dur+"', true, this.parentNode.previousElementSibling.children[0].children[0].checked);windowAnimation.animation.commit();windowAnimation.ui.dur.value = "+this.animation.dur.value+";windowAnimation.refreshBegins();windowAnimation.refreshKeyframes();");
	
	if(this.animation.repeatCount != 'indefinite') {
		this.ui.repeatCount.value = this.animation.repeatCount;
		this.ui.repeatCount.disabled = false;
		this.ui.indefinite.checked = false;
	} else {
		this.ui.repeatCount.value = 0;
		this.ui.repeatCount.disabled = true;
		this.ui.indefinite.checked = true;
	}
//	this.ui.resetRepeat.setAttribute("onclick", "if(!windowAnimation.animation){return;};windowAnimation.animation.setRepeatCount('"+this.animation.repeatCount+"', true);windowAnimation.animation.commit();windowAnimation.refresh();");
	
	var cMode = 0;
	switch(this.animation.getCalcMode()) {
		case 'spline': cMode = 1; break;
		case 'paced': cMode = 2; break;
		case 'discrete': cMode = 3; break;
	}
	this.ui.calcMode.setSelected(cMode);
	if(this.animation instanceof SVGAnimateMotionElement) {
		this.ui.calcMode.enableOption(2)
	} else {
		this.ui.calcMode.disableOption(2);
	}
	this.ui.fill.setSelected(this.animation.fill == 'freeze' ? 1 : 0);
	this.ui.additive.setSelected(this.animation.additive == 'sum' ? 1 : 0);
	this.ui.accumulate.setSelected(this.animation.accumulate == 'sum' ? 1 : 0);
}

windowAnimation.prototype.refreshKeyframes = function(dontEdit) {
	if(!this.animation) { return; }
	
	var scrolledTopParent = this.container.parentNode.scrollTop;
	var scrolledLeftParent = this.container.parentNode.scrollLeft;
	var scrolledTop = this.tab1.scrollTop;
	var scrolledLeft = this.tab1.scrollLeft;
	
	this.tab1.removeChildren();
	
	this.animation.getBeginList();
	this.animation.getKeyframes();
	this.animation.getDur();
	this.animation.getCalcMode();
	
	var headings = [ "", "Percent", "Time [s]" ];
	var type;
	
	if(this.animation instanceof SVGAnimateTransformElement) {
		switch(this.animation.getAttribute('type')) {
			case "rotate":
				type = 3;
				headings.push("Angle");
			case "translate":
				if(type == null) { type = 2; }
				headings.push("Axis X");
				headings.push("Axis Y");
				break;
			case "scale":
				type = 4;
				headings.push("Scale X [%]");
				headings.push("Scale Y [%]");
				break;
			case "skewX":
			case "skewY":
				type = 5;
				headings.push("Skew angle");
				break;
		}
	} else if(this.animation instanceof SVGAnimateMotionElement) {
		type = 1;
		headings.push("Distance [%]");
	} else if(this.animation instanceof animatedViewbox) {
		type = 7;
		headings.push("Axis X");
		headings.push("Axis Y");
		headings.push("Width");
		headings.push("Height");
	} else if(this.animation instanceof animationGroup) {
		type = 6;
		
		headings.push("State");
		headings.push("Intensity");
		headings.push("Preview");
		if(!svg.animationStates || !svg.animationStates[this.animation.groupName]) { return; }
		
		var chil = svg.animationStates[this.animation.groupName];
		var opt = [];
		for(var i = 0; i < chil.length; i++) {
			opt.push({'value': String(i), 'text': String(chil[i].name)});
		}
		var groupSelection = build.select(opt);
	} else {
		type = 0;
		headings.push("Value");
		var attrValues = svg.getAttributeValues(this.animation.getAttribute('attributeName'));
		
		var opt = [];
		var eve = {};
		for(var i = 0; i < attrValues.length; i++) {
			opt.push({'value': attrValues[i]});
			if(attrValues[i][0] == "<") {
				eve.onclick = "if(this.value.startsWith('<')) { this.nextElementSibling.removeClass('hidden'); } else { this.nextElementSibling.addClass('hidden'); }"
			}
		}
		var attrSelect = build.select(opt, eve);
	}
	
	if(this.animation.calcMode == "spline") {
		headings.push("Spline");
		
		var temp = new spline();
		var splineSelect = temp.getSelect();
		var optCustom = document.createElement('option');
			optCustom.setAttribute('value', -1);
			optCustom.appendChild(document.createTextNode('custom'));
		splineSelect.appendChild(optCustom);
		splineSelect.setAttribute('onchange', "if(this.value == '-1') { this.addClass('small');this.nextElementSibling.removeClass('hidden'); } else { this.removeClass('small');this.nextElementSibling.addClass('hidden'); }");
		
	}
	
	
	var array = [];
	
	var lastState;
	
	for(var i = 0; i < this.animation.keyframes.length; i++) {
		var subArray = [ '_' ];
		
		subArray.push(Math.round(this.animation.keyframes.getItem(i).time * 10000)/100 + '%');
		subArray.push(Math.round(this.animation.keyframes.getItem(i).time * this.animation.dur.value * 100)/100);
		
		switch(type) {
			case 1:		// motion
				var in1 = document.createElement('input');
					in1.setAttribute('type', 'number');
					in1.setAttribute('min', '0');
					in1.setAttribute('max', '100');
					in1.setAttribute('value', (Math.round(this.animation.keyframes.getItem(i).value * 10000)/100));
				subArray.push(in1);
				break;
			case 3:		// rotate
				var in1 = document.createElement('input');
					in1.setAttribute('type', 'number');
					in1.setAttribute('value', (Math.round(this.animation.keyframes.getItem(i).value.angle*100)/100));
				subArray.push(in1);
			case 2:		// translate
				var in2 = document.createElement('input');
					in2.setAttribute('type', 'number');
					in2.setAttribute('value', (Math.round(this.animation.keyframes.getItem(i).value.x*100)/100));
				subArray.push(in2);
				var in3 = document.createElement('input');
					in3.setAttribute('type', 'number');
					in3.setAttribute('value', (Math.round(this.animation.keyframes.getItem(i).value.y*100)/100));
				subArray.push(in3);
				break;
			case 4:		// scale
				var in2 = document.createElement('input');
					in2.setAttribute('type', 'number');
					in2.setAttribute('value', (Math.round(this.animation.keyframes.getItem(i).value.x*1000)/10));
				subArray.push(in2);
				var in3 = document.createElement('input');
					in3.setAttribute('type', 'number');
					in3.setAttribute('value', (Math.round(this.animation.keyframes.getItem(i).value.y*1000)/10));
				subArray.push(in3);
				break;
			case 5:		// skewX or skewY
				var in2 = document.createElement('input');
					in2.setAttribute('type', 'number');
					in2.setAttribute('value', (Math.round(this.animation.keyframes.getItem(i).value.angle*100)/100));
				subArray.push(in2);
				break;
			case 0:		// animate (generic)
				var customValue = (attrValues.indexOf(this.animation.keyframes.getItem(i).value) == -1);
				
				var inputValues = 0;
				var customIndex = 0;
				
				for(var j = 0; j < attrValues.length; j++) {
					if(attrValues[j].startsWith('<')) {
						customIndex = j;
						inputValues++;
					}
				}
				
				var cont = document.createElement('div');
				var in1 = document.createElement('input');
				
				if(attrValues.length > 1) {
					var cloneSelect = attrSelect.cloneNode(true);
					for(var j = 0; j < attrValues.length; j++) {
						if(!customValue && attrValues[j] == this.animation.keyframes.getItem(i).value) {
							cloneSelect.children[j].setAttribute('selected', 'true');
						}
						if(customValue && attrValues[j].startsWith('<')) {
							cloneSelect.children[j].setAttribute('selected', 'true');
						}
					}
					cont.appendChild(cloneSelect);
				}
				
				var valueSet = false;
				
				switch(attrValues[customIndex]) {
					case "<length>":
					case "<number>":
					case "<angle>":
						in1.setAttribute('title', 'Numeric value');
						in1.setAttribute("type", "number");
						break;
					case "<color>":
						in1.setAttribute("type", "color");
						in1.setAttribute('title', 'Color');
						
						try {
							in1.setAttribute("value", new color(this.animation.keyframes.getItem(i).value));
							valueSet = true;
						} catch(err) { }
						break;
					case "<fraction>":
						in1.setAttribute("type", "number");
						in1.setAttribute("min", "0");
						in1.setAttribute("max", "100");
						in1.setAttribute("value", this.animation.keyframes.getItem(i).value * 100);
						in1.setAttribute('title', 'Percentage');
						valueSet = true;
						break;
					default:
					case "<string>":
						in1 = document.createElement('textarea');
						in1.setAttribute('title', 'String');
						break;
				}
				
				if(this.animation.attribute == 'd') {
					in1.value = this.animation.keyframes.getItem(i).value.trim().replace(/\s+/g,' ');
				} else {
					if(!valueSet) {
						in1.value = this.animation.keyframes.getItem(i).value;
					}
				}
				
				if(!customValue) {
					in1.setAttribute('class', 'hidden');
				}
				
				cont.appendChild(in1);
				
				subArray.push(cont);
				break;
			case 6:		// animated group
				var preview;
				if(lastState == null || this.animation.keyframes.getItem(i).intensity == 1) {
					lastState = svg.animationStates[this.animation.groupName][this.animation.keyframes.getItem(i).value];
					preview = lastState ? lastState.preview.container.cloneNode(true) : document.createElement('div');
				} else {
					var newState = lastState.inbetween(svg.animationStates[this.animation.groupName][this.animation.keyframes.getItem(i).value], this.animation.keyframes.getItem(i).intensity);
					newState.group = lastState.group;
					lastState = newState;
					preview = newState.preview.container.cloneNode(true);
				}
				
				var sel = groupSelection.cloneNode(true);
				sel.setSelected(parseInt(this.animation.keyframes.getItem(i).value));
				subArray.push(sel);
				
				if(i > 0) {
					subArray.push(
						build.slider(this.animation.keyframes.getItem(i).intensity, {
							'min': 0, 'max': 1, 'step': 0.01 }, true, true)
					);
				} else {
					subArray.push(
						build.slider(this.animation.keyframes.getItem(i).intensity, { 
							'disabled': 'disabled',
							'min': 0, 'max': 1, 'step': 0.01 }, true, true)
					);
				}
				
				subArray.push(preview);
				break;
			case 7:		// animated viewbox
				subArray.push(build.input('number', this.animation.keyframes.getItem(i).value.x));
				subArray.push(build.input('number', this.animation.keyframes.getItem(i).value.y));
				subArray.push(build.input('number', this.animation.keyframes.getItem(i).value.width, {'min': '0' }));
				subArray.push(build.input('number', this.animation.keyframes.getItem(i).value.height, {'min': '0' }));
				break;
		}
		
		if(this.animation.calcMode == "spline") {
			var contSpline = document.createElement('div');
			
			if(i > 0 && this.animation.keyframes.getItem(i).spline) {
				var ins1 = build.input('number', this.animation.keyframes.getItem(i).spline.x1, { 'min': 0, 'max': 1, 'step': 0.05, 'pattern': '[0-9]*' });
				var ins2 = build.input('number', this.animation.keyframes.getItem(i).spline.y1, { 'min': 0, 'max': 1, 'step': 0.05, 'pattern': '[0-9]*' });
				var ins3 = build.input('number', this.animation.keyframes.getItem(i).spline.x2, { 'min': 0, 'max': 1, 'step': 0.05, 'pattern': '[0-9]*' });
				var ins4 = build.input('number', this.animation.keyframes.getItem(i).spline.y2, { 'min': 0, 'max': 1, 'step': 0.05, 'pattern': '[0-9]*' });
				var contSplineInput = document.createElement('span');
					contSplineInput.setAttribute('class', 'splineInput');
					contSplineInput.appendChild(ins1);
					contSplineInput.appendChild(ins2);
					contSplineInput.appendChild(ins3);
					contSplineInput.appendChild(ins4);
				
				var cloneSplineSelect = splineSelect.cloneNode(true);
				
				if(this.animation.keyframes.getItem(i).spline.type != null) {
					cloneSplineSelect.setSelected(this.animation.keyframes.getItem(i).spline.type);
					contSplineInput.addClass('hidden');
				} else {
					cloneSplineSelect.setSelected(cloneSplineSelect.children.length-1);
				}
				
				contSpline.appendChild(cloneSplineSelect);
				contSpline.appendChild(contSplineInput);
			}
			subArray.push(contSpline);
		}
		
		array.push(subArray);
	}
	
	var table = build.table(array, headings);
	table.setAttribute('class', 'keyframes');
	
	for(var i = 1; i < table.children.length; i++) {
		table.children[i].children[0].setAttribute('draggable', 'true');
		table.children[i].children[1].setAttribute('draggable', 'true');
		table.children[i].children[2].setAttribute('draggable', 'true');
	}
	
	this.tab1.appendChild(table);
	this.refreshSelection(dontEdit);
	
	this.container.parentNode.scrollTop = scrolledTopParent;
	this.container.parentNode.scrollLeft = scrolledLeftParent;
	this.tab1.scrollTop = scrolledTop;
	this.tab1.scrollLeft = scrolledLeft;
}

windowAnimation.prototype.refreshBegins = function() {
	if(!this.animation) { return; }
	
	var scrolledTopParent = this.container.parentNode.scrollTop;
	var scrolledLeftParent = this.container.parentNode.scrollLeft;
	var scrolledTop = this.tab2.scrollTop;
	var scrolledLeft = this.tab2.scrollLeft;
	
	this.tab2.removeChildren();
	
	var headings = [ "Begin time", "End time" ];
	var array = [];
	
	var beginList = this.animation.getBeginList();
	var duration = this.animation.getDur().value;
	
	var repeatCount = this.animation.getRepeatCount();
	var indefinite = false;
	if(isNaN(repeatCount)) {
		indefinite = true;
	} else {
		repeatCount = parseInt(repeatCount);
	}
	
	for(var i = 0; i < beginList.length; i++) {
		var iTime = document.createElement("input");
			iTime.setAttribute('type', 'number');
			iTime.setAttribute('value', beginList[i].value);
			iTime.setAttribute('onchange', 'if(!anigenManager.classes.windowAnimation.animation){return;};anigenManager.classes.windowAnimation.animation.setBegin('+i+', this.value, true);anigenManager.classes.windowAnimation.animation.commit();anigenManager.classes.windowAnimation.refresh();');
		
		var iRemove = document.createElement("button");
			iRemove.appendChild(document.createTextNode("Remove"));
			iRemove.setAttribute('onclick', 'if(!anigenManager.classes.windowAnimation.animation){return;};anigenManager.classes.windowAnimation.animation.removeBegin('+i+', true);anigenManager.classes.windowAnimation.animation.commit();anigenManager.classes.windowAnimation.refresh();');
		
		if(i < beginList.length-1) {
			iTime.setAttribute('max', beginList[i+1].value);
		}
		
		var subArray = [];
		subArray.push(iTime);
		subArray.push(indefinite ? 'never' : String(beginList[i].value + duration*(repeatCount+1)));
		subArray.push(iRemove);
		
		array.push(subArray);
	}
	
	var table = build.table(array, headings);
	table.setAttribute('class', 'begins');
	this.tab2.appendChild(table);
	
	var iNew = document.createElement("input");
		iNew.setAttribute('type', 'number');
		iNew.setAttribute('min', 0);
	
	var addBegin = document.createElement("button");
		addBegin.appendChild(document.createTextNode("Add"));
		addBegin.setAttribute('onclick', 'if(!anigenManager.classes.windowAnimation.animation){return;};anigenManager.classes.windowAnimation.animation.addBegin(this.previousElementSibling.value, true);anigenManager.classes.windowAnimation.animation.commit();anigenManager.classes.windowAnimation.refresh();');
		
	var cont = document.createElement('div');
		cont.appendChild(iNew);
		cont.appendChild(addBegin);
	if(this.ui && this.ui.adjustBegins) { cont.appendChild(this.ui.adjustBegins.parentNode); }
		cont.setAttribute('style', 'text-align: center;');
		
	this.tab2.appendChild(cont);
	
	this.container.parentNode.scrollTop = scrolledTopParent;
	this.container.parentNode.scrollLeft = scrolledLeftParent;
	this.tab2.scrollTop = scrolledTop;
	this.tab2.scrollLeft = scrolledLeft;
}

windowAnimation.prototype.refreshSelection = function(dontEdit) {
	if(!this.tab1 || !this.tab1.children[0]) { return; }
	for(var i = 1; i < this.tab1.children[0].children.length; i++) {
		if(this.selected.indexOf(i-1) != -1) {
			this.tab1.children[0].children[i].addClass('selected');
		} else {
			this.tab1.children[0].children[i].removeClass('selected');
		}
	}
	if(!dontEdit) {
		svg.ui.edit(svg.selected);
	}
}

windowAnimation.prototype.refreshAttributes = function() {
	if(this.animation instanceof animationGroup && !(this.animation instanceof animatedViewbox)) {
		this.unhideTab(2);
		
		var scrolledTopParent = this.container.parentNode.scrollTop;
		var scrolledLeftParent = this.container.parentNode.scrollLeft;
		var scrolledTop = this.tab3.scrollTop;
		var scrolledLeft = this.tab3.scrollLeft;
		
		this.tab3.removeChildren();
		
		var animatable = svg.getAnimatableAttributes('path');
		
		for(var i = 0; i < animatable.length; i++) {
			this.tab3.appendChild(
				build.input('checkbox', this.animation.animations[animatable[i]] != null, 
					{ 'label': animatable[i], 'onclick': 'if(this.checked){anigenManager.classes.windowAnimation.animation.animate("'+animatable[i]+'");}else{anigenManager.classes.windowAnimation.animation.unanimate("'+animatable[i]+'");};anigenManager.classes.windowAnimation.animation.commit();' }
				)
			);
		}
	
		this.container.parentNode.scrollTop = scrolledTopParent;
		this.container.parentNode.scrollLeft = scrolledLeftParent;
		this.tab3.scrollTop = scrolledTop;
		this.tab3.scrollLeft = scrolledLeft;
		
	} else {
		this.hideTab(2);
	}
}

windowAnimation.prototype.refresh = function(clearSelection) {
	if(clearSelection) { this.selected = []; }
	
	if(!svg.selected.isAnimation() && !svg.selected.hasAnimation() &&
		svg.selected.getAttribute('anigen:type') != 'animationGroup') { return; }
	
	var animation = null;
	
	if(svg.selected.getAttribute('anigen:type') == 'animationGroup') {
		if(!svg.selected.shepherd) {
			animation = new animationGroup(svg.selected);
		} else {
			animation = svg.selected.shepherd;
		}
	} else if(svg.selected.getAttribute('anigen:type') == 'animatedViewbox') {
		animation = svg.selected.shepherd;
	} else if(svg.selected.isAnimation()) {
		animation = svg.selected;
	} else {
		animation = svg.selected.getElementsByTagName('animate', false, true)[0];
	}
	
	if(animation == null) { return; }
	
	if(this.animation != animation) {
		this.selected = [];
	}
	this.animation = animation;
	
	this.refreshKeyframes();
	this.refreshBegins();
	this.refreshAttributes();
	this.refreshInputs();
	this.refreshSelection();
}


//	selects the row with given index
//	if index is already selected, deselects it instead
//	add is a boolean signifying index should be added to selection instead of being discarded
windowAnimation.prototype.select = function(index, event) {
	if(index == null) {
		this.selected = [];
	} else if(event.ctrlKey) {
		this.lastSelect = index;
		if(this.selected.indexOf(index) != -1) {
			this.selected.splice(this.selected.indexOf(index), 1);
		} else {
			this.selected.push(index);
			this.selected.sort(function(a,b){ return (a-b); });
		}
	} else if(event.shiftKey && this.selected[0] != index) {
		if(index > this.selected[0]) {
			var newSelected = [];
			
			var fromIndex = this.lastSelect != null ? this.lastSelect : this.selected[0];
			
			for(var i = fromIndex; i <= index; i++) {
				newSelected.push(i);
			}
			this.selected = newSelected;
		} else {
			var newSelected = [];
			
			var fromIndex = this.lastSelect != null ? this.lastSelect : this.selected[this.selected.length-1];
			
			for(var i = index; i <= fromIndex; i++) {
				newSelected.push(i);
			}
			this.selected = newSelected;
		}
		this.selected.sort(function(a,b){ return (a-b); });
	} else {
		if(this.selected.indexOf(index) != -1 && this.selected.length == 1) {
			this.selected = [];
			this.lastSelect = null;
		} else {
			this.selected = [ index ];
			this.lastSelect = index;
		}
	}
	this.refreshSelection();
	svg.ui.edit(this.animation);
}




windowAnimation.prototype.contextMenuEvaluate = function(option, index) {
	var anim = this.animation;
	var times = anim.getKeyframes();
	
	if(index == null) { return; }
	switch(option) {
		case "up":		// frame up
			if(this.selected.length == 0) {
				anim.moveValue(index, index-1);
			} else {
				var newSelection = [];
				var lastIndex = null;
				for(var i = 0; i < this.selected.length; i++) {
					if(lastIndex == this.selected[i]-1 || this.selected[i] == 0) {
						lastIndex = this.selected[i];
						newSelection.push(this.selected[i]);
					} else {
						anim.moveValue(this.selected[i], this.selected[i]-1, true);
						if(this.selected[i]-1 >= 0) { newSelection.push(this.selected[i]-1); }
					}
					
				}
				this.selected = newSelection;
				this.refreshSelection();
			}
			break;
		case "duplicate":		// duplicate
			if(this.selected.length == 0) {
				anim.duplicateValue(index);
			} else {
				var added = 0;
				var newSelection = [];
				for(var i = 0; i < this.selected.length; i++) {
					anim.duplicateValue(this.selected[i]+added);
					added++;
					newSelection.push(this.selected[i]+added);
				}
				this.selected = newSelection;
				this.refreshSelection();
			}
			break;
		case "down":		// frame down
			if(this.selected.length == 0) {
				anim.moveValue(index, index+1);
			} else {
				var newSelection = [];
				var lastIndex = null;
				for(var i = this.selected.length-1; i >= 0; i--) {
					if(lastIndex == this.selected[i]+1 || this.selected[i] == times.length-1) {
						lastIndex = this.selected[i];
						newSelection.push(this.selected[i]);
					} else {
						anim.moveValue(this.selected[i], this.selected[i]+1);
						if(this.selected[i]+1 != times.length) { newSelection.push(this.selected[i]+1); }
					}
					
				}
				this.selected = newSelection;
				this.refreshSelection();
			}
			
			break;
		case "inbetween":		// create inbetween
			if(this.animation instanceof animationGroup) {
				if(this.selected.length != 2 || this.selected[0]+1 != this.selected[1]) { break; }
				overlay.macroStateInbetween(this.animation.keyframes.getItem(this.selected[0]).value, this.animation.keyframes.getItem(this.selected[1]).value, this.selected[0]);
				return;
			}
			
			var operations = 0;
			var newSelect = [];
			for(var i = 0; i < this.selected.length-1; i++) {
				if(this.selected[i] == this.selected[i+1]-1) {
					anim.inbetween(this.selected[0]+operations, this.selected[1]+operations, 0.5);
					newSelect.push(this.selected[1]+operations);
					operations+=2;
				}
			}
			
			//anim.inbetween(this.selected[0], this.selected[1], 0.5);
			this.selected = newSelect;
			break;
		case "balance":		// balance keyFrames
			var canInbetween = false;
			for(var i = 0; i < anigenManager.classes.windowAnimation.selected.length-1; i++) {
				if(anigenManager.classes.windowAnimation.selected[i] == anigenManager.classes.windowAnimation.selected[i+1]-1) {
					canInbetween = true;
					break;
				}
			}
			if(!canInbetween || this.selected.length == 0) {
				anim.balanceFrames();
			} else {
				var intervals = [];
				var max;
				
				for(var i = 0; i < this.selected.length; i++) {
					if(max == null || max != this.selected[i]-1) {
						max = this.selected[i];
						intervals.push([ this.selected[i], this.selected[i] ]);
					} else {
						max = this.selected[i];
						intervals[intervals.length-1][1] = this.selected[i];
					}
				}
				
				for(var i = 0; i < intervals.length; i++) {
					anim.balanceFrames(intervals[i][0], intervals[i][1]);
				}
			}
			break;
		case "invert":		// invert values
			if(this.selected.length == 0) {
				anim.invertValues();
			} else {
				for(var i = 0; i < this.selected.length; i++) {
					anim.invertValues(this.selected[i]);
				}
			}
			break;
		case "delete":		// remove keyFrame
			if(this.selected.length == 0) {
				anim.removeValue(index);
			} else {
				for(var i = this.selected.length-1; i >= 0; i--) {
					anim.removeValue(this.selected[i]);
				}
			}
			this.selected = [];
			break;
	}
	anim.commit();
	anigenManager.classes.windowAnimation.refreshKeyframes();
	svg.ui.edit(svg.selected);
}

windowAnimation.prototype.setTime = function(index, value) {
	this.animation.getKeyframes();
	index = parseInt(index);
	value = parseFloat(value);
	if(index == null || value == null) { return; }
	
	var noSelect = this.selected.length <= 1;
	
	if((this.selected.length == 1 && this.selected[0] == index) || this.selected.indexOf(index) == -1) {
		this.selected = [];
	}
	
	if(this.selected.length == 0) {
		this.selected = [ index ];
	}
	var delta = value - this.animation.keyframes.getItem(index).time;
	var changedItems = [];
	for(var i = 0; i < this.selected.length; i++) {
		changedItems.push(this.animation.keyframes.getItem(this.selected[i]));
		this.animation.setTime(this.selected[i], this.animation.keyframes.getItem(this.selected[i]).time+delta);
	}
	
	this.animation.keyframes.sort();
	this.animation.commit();
	
	var newSelected = [];
	for(var i = 0; i < changedItems.length; i++) {
		for(var j = 0; j < this.animation.keyframes.length; j++) {
			if(this.animation.keyframes.getItem(j).time > changedItems[i].time) { break; }
			if(this.animation.keyframes.getItem(j) == changedItems[i]) {
				newSelected.push(j);
				break;
			}
		}
	}
	
	this.selected = noSelect ? [] : newSelected;
	
	this.refreshSelection();
	this.refreshKeyframes();
}



windowAnimation.prototype.eventContextMenu = function(event) {
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
	
	var targ = event.target;
	while(!(targ instanceof HTMLTableRowElement)) {
		targ = targ.parentNode;
	}
	if(!targ.rowIndex) { return; }
	
	popup.macroAnimationContextMenu(event, targ.rowIndex-1);
}
windowAnimation.prototype.eventChange = function(event) {
	var val = event.target.value;
	var anim = anigenManager.classes.windowAnimation.animation;
	
	var col;
	var row;
	
	var targ = event.target;
	while(!(targ instanceof HTMLTableRowElement) && targ.parentNode) {
		if(targ instanceof HTMLTableCellElement) { col = targ.cellIndex; }
		targ = targ.parentNode;
	}
	row = targ.rowIndex-1;
	col--;
	
	if(col == null || row == null || !anim) { return; }
	
	var splineRow;
	
	if(anim instanceof SVGAnimateTransformElement) {
		switch(anim.getAttribute('type')) {
			case 'scale':		// scale
				val = parseFloat(val)/100;
			case 'translate':
				splineRow = 4;
				if(col == 2) {
					if(anigenManager.classes.windowAnimation.selected.length == 0 || anigenManager.classes.windowAnimation.selected.indexOf(row) == -1) {
						anim.setPosition(row, val);
					} else {
						for(var i = 0; i < anigenManager.classes.windowAnimation.selected.length; i++) {
							anim.setPosition(anigenManager.classes.windowAnimation.selected[i], val);
						}
					}
				}
				if(col == 3) {
					if(anigenManager.classes.windowAnimation.selected.length == 0 || anigenManager.classes.windowAnimation.selected.indexOf(row) == -1) {
						anim.setPosition(row, null, val);
					} else {
						for(var i = 0; i < anigenManager.classes.windowAnimation.selected.length; i++) {
							anim.setPosition(anigenManager.classes.windowAnimation.selected[i], null, val);
						}
					}
				}
				break;
			case 'rotate':		// rotate
				splineRow = 5;
				if(col == 2) {
					if(anigenManager.classes.windowAnimation.selected.length == 0 || anigenManager.classes.windowAnimation.selected.indexOf(row) == -1) {
						anim.setAngle(row, val);
					} else {
						for(var i = 0; i < anigenManager.classes.windowAnimation.selected.length; i++) {
							anim.setAngle(anigenManager.classes.windowAnimation.selected[i], val);
						}
					}
				}
				if(col == 3) {
					if(anigenManager.classes.windowAnimation.selected.length == 0 || anigenManager.classes.windowAnimation.selected.indexOf(row) == -1) {
						anim.setPosition(row, val);
					} else {
						for(var i = 0; i < anigenManager.classes.windowAnimation.selected.length; i++) {
							anim.setPosition(anigenManager.classes.windowAnimation.selected[i], val);
						}
					}
				}
				if(col == 4) {
					if(anigenManager.classes.windowAnimation.selected.length == 0 || anigenManager.classes.windowAnimation.selected.indexOf(row) == -1) {
						anim.setPosition(row, null, val);
					} else {
						for(var i = 0; i < anigenManager.classes.windowAnimation.selected.length; i++) {
							anim.setPosition(anigenManager.classes.windowAnimation.selected[i], null, val);
						}
					}
				}
				break;
			case 'skewX':		// skewX
			case 'skewY':		// skewY
				splineRow = 3;
				if(col == 2) {
					if(anigenManager.classes.windowAnimation.selected.length == 0 || anigenManager.classes.windowAnimation.selected.indexOf(row) == -1) {
						anim.setAngle(row, val);
					} else {
						for(var i = 0; i < anigenManager.classes.windowAnimation.selected.length; i++) {
							anim.setAngle(anigenManager.classes.windowAnimation.selected[i], val);
						}
					}
				}
				break;
		}
	} else if(anim instanceof SVGAnimateMotionElement) {
		splineRow = 3;
		if(col == 2) {
			var value = parseFloat(val)/100;
			if(value < 0) { value = 0; }
			if(value > 1) { value = 1; }
			
			if(anigenManager.classes.windowAnimation.selected.length == 0 || anigenManager.classes.windowAnimation.selected.indexOf(row) == -1) {
				anim.setValue(row, value);
			} else {
				for(var i = 0; i < anigenManager.classes.windowAnimation.selected.length; i++) {
					anim.setValue(anigenManager.classes.windowAnimation.selected[i], value);
				}
			}
		}
	} else if(anim instanceof animatedViewbox) {
		splineRow = 6;
		if(col >= 2 && col < 6) {
			var value = parseFloat(val);
			anim.setValue(row, col-2, value);
		}
	} else if(anim instanceof animationGroup) {
		splineRow = 5;
		if(col == 2) {
			var value = parseInt(val);
			if(anigenManager.classes.windowAnimation.selected.length == 0 || anigenManager.classes.windowAnimation.selected.indexOf(row) == -1) {
				anim.setValue(row, value);
			} else {
				for(var i = 0; i < anigenManager.classes.windowAnimation.selected.length; i++) {
					anim.setValue(anigenManager.classes.windowAnimation.selected[i], value);
				}
			}
		}
		if(col == 3) {
			if(anigenManager.classes.windowAnimation.selected.length == 0 || anigenManager.classes.windowAnimation.selected.indexOf(row) == -1) {
				anim.setIntensity(row, val);
			} else {
				for(var i = 0; i < anigenManager.classes.windowAnimation.selected.length; i++) {
					anim.setIntensity(anigenManager.classes.windowAnimation.selected[i], val);
				}
			}
		}
	} else {		// animateElement
		splineRow = 3;
		if(col == 2) {
			if(val[0] == '<') {
				val = event.target.nextSibling.value;
			}
			if(event.target.nodeName.toLowerCase() == 'input' &&
				event.target.getAttribute('type') == 'number' &&
				event.target.getAttribute('min') == '0' &&
				event.target.getAttribute('max') == '100') {
					val = parseFloat(event.target.value) / 100;
				}
				
			if(anigenManager.classes.windowAnimation.selected.length == 0 || anigenManager.classes.windowAnimation.selected.indexOf(row) == -1) {
				anim.setValue(row, val, true);
			} else {
				for(var i = 0; i < anigenManager.classes.windowAnimation.selected.length; i++) {
					anim.setValue(anigenManager.classes.windowAnimation.selected[i], val, true);
				}
			}
		}
	}
	
	if(col == splineRow) {
		if(event.target instanceof HTMLSelectElement) {
			var splineType = parseInt(event.target.value);
			if(splineType == -1) {
				var data = [
					event.target.nextElementSibling.children[0].value,
					event.target.nextElementSibling.children[1].value,
					event.target.nextElementSibling.children[2].value,
					event.target.nextElementSibling.children[3].value
				];
				data = data.join(' ');
				if(anigenManager.classes.windowAnimation.selected.length == 0 || anigenManager.classes.windowAnimation.selected.indexOf(row) == -1) {
					anim.setSpline(row, data);
				} else {
					for(var i = 0; i < anigenManager.classes.windowAnimation.selected.length; i++) {
						anim.setSpline(anigenManager.classes.windowAnimation.selected[i], data);
					}
				}
			} else {
				if(anigenManager.classes.windowAnimation.selected.length == 0 || anigenManager.classes.windowAnimation.selected.indexOf(row) == -1) {
					anim.setSpline(row, splineType);
				} else {
					for(var i = 0; i < anigenManager.classes.windowAnimation.selected.length; i++) {
						anim.setSpline(anigenManager.classes.windowAnimation.selected[i], splineType);
					}
				}
				anigenManager.classes.windowAnimation.refreshKeyframes();
			}
		} else {
			var data = [
					event.target.parentNode.children[0].value,
					event.target.parentNode.children[1].value,
					event.target.parentNode.children[2].value,
					event.target.parentNode.children[3].value
				];
			data = data.join(' ');
			if(anigenManager.classes.windowAnimation.selected.length == 0 || anigenManager.classes.windowAnimation.selected.indexOf(row) == -1) {
				anim.setSpline(row, data);
			} else {
				for(var i = 0; i < anigenManager.classes.windowAnimation.selected.length; i++) {
					anim.setSpline(anigenManager.classes.windowAnimation.selected[i], data);
				}
			}
		}
	} else {
		anigenManager.classes.windowAnimation.refreshKeyframes();
	}
	
	anim.commit();
	svg.gotoTime();
	
	if(this.animation) {
		svg.ui.edit(this.animation.element);
	} else {
		svg.ui.edit(svg.selected);
	}
}

windowAnimation.prototype.eventDblClick = function(event) {
	var index;
	var targ = event.target;
	while(!(targ instanceof HTMLTableRowElement) && targ.parentNode) {
		if(targ instanceof HTMLTableCellElement) { col = targ.cellIndex; }
		targ = targ.parentNode;
	}
	index = targ.rowIndex-1;
	anigenManager.classes.windowAnimation.select(index, event);
}
windowAnimation.prototype.eventClick = function(event) {
	var anim = anigenManager.classes.windowAnimation.animation;
	var col;
	var index;
	var targ = event.target;
	while(!(targ instanceof HTMLTableRowElement) && targ.parentNode) {
		if(targ instanceof HTMLTableCellElement) { col = targ.cellIndex; }
		targ = targ.parentNode;
	}
	index = targ.rowIndex-1;
	col--;
	
	if(col == null || index == null || !anim || col > 1) { return; }
	
	if(col < 0) {	// selection
		anigenManager.classes.windowAnimation.select(index, event);
		return;
	}
	
	if(col > 1 || isNaN(col)) { return; }	// false click
	
	event.stopPropagation();
	
	var min, max, step, value;
	var attrOut = { 'onchange': '', 'onmousemove': '' };
	
	attrOut.onchange += 'var shep = anigenManager.classes.windowAnimation.animation;if(!shep){return;}';
	attrOut.onchange += 'if(isNaN(this.value;){return;}';
	
	if(!popup.isHidden()) { popup.hide(); return; }
	
	if(col == 0) {	// percentages
		min = index == 0 ? 0 : (anim.keyframes.getItem(index-1).time * 100);
		max = index+1 < anim.keyframes.length ? (anim.keyframes.getItem(index+1).time * 100) : 100;
		if(index == 0) { max = 0; }
		if(index == anim.keyframes.length-1) { min = 100; }
		attrOut.onchange += 'anigenManager.classes.windowAnimation.setTime('+index+', parseFloat(this.value)/100);';
	} else {	// actual time
		min = index == 0 ? 0 : (anim.keyframes.getItem(index-1).time * anim.dur.value);
		max = index+1 < anim.keyframes.length ? (anim.keyframes.getItem(index+1).time * anim.dur.value) : anim.dur.value;
		if(index == 0) { max = 0; }
		if(index == anim.keyframes.length-1) { min = anim.dur.value; }
		attrOut.onchange += 'anigenManager.classes.windowAnimation.setTime('+index+', parseFloat(this.value)/'+anim.dur.value+');';
	}
	
	attrOut.onmousemove += 'if(event.buttons!=1){return;}';
	attrOut.onmousemove += attrOut.onchange;
	
	step = (max-min)/100;
	value = col == 0 ? anim.keyframes.getItem(index).time * 100 : anim.keyframes.getItem(index).time * anim.dur.value;
	
	var actionYes = null;
	var actionNo = 'anigenManager.classes.windowAnimation.setTime('+index+', '+anim.keyframes.getItem(index).time+');';
	
	attrOut.min = min;
	attrOut.max = max;
	attrOut.step = step;
	
	popup.macroSlider(targ, value, attrOut, actionYes, actionNo, true);
}

windowAnimation.prototype.eventDragStart = function(event) {
	if(anigenManager.classes.windowAnimation.selected.length > 0) {
		event.preventDefault ? event.preventDefault() : event.returnValue = false;
		return false;
	}
	targ = event.target;
	while(targ.parentNode && !(targ instanceof HTMLTableRowElement)) {
		targ = targ.parentNode;
	}
	var index = targ.rowIndex-1;
	if(index == null || isNaN(index)) { return; }
	anigenManager.classes.windowAnimation.dragged = index;
}
windowAnimation.prototype.eventDragOver = function(event) {
	targ = event.target;
	while(targ.parentNode && !(targ instanceof HTMLTableRowElement)) {
		targ = targ.parentNode;
	}
	var index = targ.rowIndex-1;
	if(index == null || isNaN(index)) { return; }
	if(index > anigenManager.classes.windowAnimation.dragged) {
		targ.style.borderBottomWidth = '5px';
	}
	if(index < anigenManager.classes.windowAnimation.dragged) {
		targ.style.borderTopWidth = '5px';
	}
	event.preventDefault();
}
windowAnimation.prototype.eventDragLeave = function(event) {
	targ = event.target;
	while(targ.parentNode && !(targ instanceof HTMLTableRowElement)) {
		targ = targ.parentNode;
	}
	var index = targ.rowIndex-1;
	if(index == null || isNaN(index)) { return; }
	targ.removeAttribute('style');
}
windowAnimation.prototype.eventDrop = function(event) {
	targ = event.target;
	while(targ.parentNode && !(targ instanceof HTMLTableRowElement)) {
		targ = targ.parentNode;
	}
	var index = targ.rowIndex-1;
	if(index == null || isNaN(index)) { return; }
	anigenManager.classes.windowAnimation.animation.moveValue(anigenManager.classes.windowAnimation.dragged, index, true);
	anigenManager.classes.windowAnimation.dragged = null;
	targ.removeAttribute('style');
	anigenManager.classes.windowAnimation.refreshKeyframes();
}
windowAnimation.prototype.eventKeyDown = function(event) {
	if(event.target != document.body) { return; }
	switch(event.keyCode) {
		case 33:		// page up
			if(this.selected.length == 0) { return false; }
			this.contextMenuEvaluate('up', 0);
			return true;
		case 34:		// page down
			if(this.selected.length == 0) { return false; }
			this.contextMenuEvaluate('down', 0);
			return true;
		case 35:		// end
			if(this.selected.length == 0) { return false; }
			console.log('end - not implemented');
			return true;
		case 36:		// home
			if(this.selected.length == 0) { return false; }
			console.log('home - not implemented');
			return true;
		case 46:		// delete
			if(this.selected.length == 0) { return false; }
			this.contextMenuEvaluate('delete', 0);
			return true;
		case 65:		// a
			if(event.ctrlKey) {
				if(this.selected.length == this.animation.getKeyframes().length) {
					this.selected = [];
				} else {
					this.selected = [];
					for(var i = 0; i < this.animation.getKeyframes().length; i++) {
						this.selected.push(i);
					}
				}
				this.refreshSelection();
				return true;
			}
			return false;
		case 68:		// d
			if(this.selected.length == 0) { return false; }
			if(event.ctrlKey) {
				this.contextMenuEvaluate('duplicate', 0);
				return true;
			}
			return false;
			
	}
	return false;
}






