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
}

windowAnimation.prototype = Object.create(windowGeneric.prototype);
windowAnimation.prototype.constructor = windowAnimation;

windowAnimation.prototype.seed = function() {
	this.setHeading('Keyframes and timing (Ctrl+Shift+K)');
	this.setImage('hourglass', 'white');
	this.imgRight.setAttribute('onclick', "windowAnimation.hide();w2ui['anigenContext'].uncheck('buttonAnimation');");
	
	this.tab1 = this.addTab('Keyframes');
	this.tab2 = this.addTab('Begin list');
	this.tab3 = this.addTab('Animated attributes');
	
	this.tab1.addEventListener('contextmenu', windowAnimation.eventContextMenu, false);
	this.tab1.addEventListener('change', windowAnimation.eventChange, false);
	this.tab1.addEventListener('click', windowAnimation.eventClick, false);
	
	this.tab1.addEventListener('dragstart', windowAnimation.eventDragStart, false);
	this.tab1.addEventListener('dragover', windowAnimation.eventDragOver, false);
	this.tab1.addEventListener('dragleave', windowAnimation.eventDragLeave, false);
	this.tab1.addEventListener('drop', windowAnimation.eventDrop, false);
	
	var table = build.table([
		[ "Duration", build.input('number', null, {'min': '0', 'onchange': 'if(!windowAnimation.animation){return;};windowAnimation.animation.setDur(this.value, true, this.parentNode.nextElementSibling.children[0].children[0].checked);windowAnimation.refreshBegins();windowAnimation.refreshKeyframes();'}),
			build.input('checkbox', null, { 'label': 'Keep times', 'title': 'Maintains times instead of percentage values. Overflowing values default to maximum time.'  }), build.button("←") ],
		[ "Repeat count", build.input('number', null, { 'min:': '0', 'onchange': 'if(!windowAnimation.animation){return;};windowAnimation.animation.setRepeatCount(this.value, true);windowAnimation.refreshBegins();windowAnimation.refreshKeyframes();'}),
			build.input('checkbox', null, { 'label': 'Indefinite', 'title': 'Animation will repeat forever, or until halted by outside source.', 'onchange': 'if(!windowAnimation.animation){return;};if(this.checked){windowAnimation.animation.setRepeatCount("indefinite", true);this.parentNode.parentNode.previousElementSibling.children[0].setAttribute("disabled", "disabled");}else{windowAnimation.animation.setRepeatCount(this.parentNode.parentNode.previousElementSibling.children[0].value, true);this.parentNode.parentNode.previousElementSibling.children[0].removeAttribute("disabled");};windowAnimation.refreshBegins();windowAnimation.refreshKeyframes();'
			}), build.button("←") ]
	]);
	table.setAttribute('class', 'inputs');
	this.footer.appendChild(table);
	
	var iFill = build.select([
		{ 'text': 'original', 'value': 'remove', 'title': 'After animation finishes, the element returns to its original state' },
		{ 'text': 'from animation', 'value': 'freeze', 'title': 'After animation finishes, the element keeps the last state the animation imposed upon it' }
	], { 'onchange': 'if(!windowAnimation.animation){return;};windowAnimation.animation.setFill(this.value, true);' });
	var iAdditive = build.select([
		{ 'text': 'no', 'value': 'replace', 'title': 'Animation completely replaces values present in the element' },
		{ 'text': 'yes', 'value': 'sum', 'title': 'Animation adds to the values already present in the element' }
	], { 'onchange': 'if(!windowAnimation.animation){return;};windowAnimation.animation.setAdditive(this.value, true);' });
	var iAccumulate = build.select([
		{ 'text': 'no', 'value': 'none', 'title': 'Animation effects do not accumulate' },
		{ 'text': 'yes', 'value': 'sum', 'title': 'Animation effects cumulate with each repeat of the animation' }
	], { 'onchange': 'if(!windowAnimation.animation){return;};windowAnimation.animation.setAccumulate(this.value, true);' });
	var iCalcMode = build.select([
		{ 'value': 'linear', 'title': 'Change between key frames is always linear' },
		{ 'value': 'spline', 'title': 'Allows linear or non-linear change between key frames' },
		{ 'value': 'paced', 'title': 'Evenly paces between given values. Movement through path only' },
		{ 'value': 'discrete', 'title': 'Animation will jump from one value to the next without interpolation' }
	], { 'onchange': 'if(!windowAnimation.animation){return;};windowAnimation.animation.setCalcMode(this.value, true);windowAnimation.refreshKeyframes();' });
	
	array = [
		[ 'Interpolation mode', iCalcMode ],
		[ 'Post-animation state', iFill ],
		[ 'Additive', iAdditive ],
		[ 'Cumulative', iAccumulate ]
	];
	
	table = build.table(array);
	table.setAttribute('class', 'begins');
	this.footer.appendChild(table);
}

windowAnimation.prototype.refreshInputs = function() {
	if(!this.animation) { return; }
	
	this.animation.getRepeatCount();
	this.animation.getDur();
	
	this.footer.children[0].children[0].children[1].children[0].value = this.animation.dur.value;
	this.footer.children[0].children[0].children[3].children[0].setAttribute("onclick", "if(!windowAnimation.animation){return;};windowAnimation.animation.setDur('"+this.animation.dur+"', true, this.parentNode.previousElementSibling.children[0].children[0].checked);this.parentNode.previousElementSibling.previousElementSibling.children[0].value = "+this.animation.dur.value+";windowAnimation.refreshBegins();windowAnimation.refreshKeyframes();");
	
	if(this.animation.repeatCount != 'indefinite') {
		this.footer.children[0].children[1].children[1].children[0].value = this.animation.repeatCount;
		this.footer.children[0].children[1].children[1].children[0].disabled = false;
		this.footer.children[0].children[1].children[2].children[0].children[0].checked = false;
	} else {
		this.footer.children[0].children[1].children[1].children[0].value = 0;
		this.footer.children[0].children[1].children[1].children[0].disabled = true;
		this.footer.children[0].children[1].children[2].children[0].children[0].checked = true;
	}
	this.footer.children[0].children[1].children[3].children[0].setAttribute("onclick", "if(!windowAnimation.animation){return;};windowAnimation.animation.setRepeatCount('"+this.animation.repeatCount+"', true);windowAnimation.refresh();");
	
	
	
	
	var cMode = 0;
	switch(this.animation.getCalcMode()) {
		case 'spline': cMode = 1; break;
		case 'paced': cMode = 2; break;
		case 'discrete': cMode = 3; break;
	}
	this.footer.children[1].children[0].children[1].children[0].setSelected(cMode);
	if(this.animation instanceof SVGAnimateMotionElement) {
		this.footer.children[1].children[0].children[1].children[0].enableOption(2)
	} else {
		this.footer.children[1].children[0].children[1].children[0].disableOption(2);
	}
	this.footer.children[1].children[1].children[1].children[0].setSelected(this.animation.getAttribute('fill') == 'freeze' ? 1 : 0);
	this.footer.children[1].children[2].children[1].children[0].setSelected(this.animation.getAttribute('additive') == 'sum' ? 1 : 0);
	this.footer.children[1].children[3].children[1].children[0].setSelected(this.animation.getAttribute('accumulate') == 'sum' ? 1 : 0);
}

windowAnimation.prototype.refreshKeyframes = function() {
	if(!this.animation) { return; }
	
	var scrolledTopParent = this.container.parentNode.scrollTop;
	var scrolledLeftParent = this.container.parentNode.scrollLeft;
	var scrolledTop = this.tab1.scrollTop;
	var scrolledLeft = this.tab1.scrollLeft;
	
	this.tab1.removeChildren();
	
	this.animation.getBeginList();
	this.animation.getValues();
	this.animation.getTimes();
	this.animation.getSplines();
	this.animation.getDur();
	
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
	} else if(this.animation instanceof animationGroup) {
		type = 6;
		headings.push("State");
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
				eve.onclick = "if(this.value != '"+attrValues[i]+"') { this.nextElementSibling.removeClass('hidden'); } else { this.nextElementSibling.addClass('hidden'); }"
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
	
	for(var i = 0; i < this.animation.times.length; i++) {
		var subArray = [ '_' ];
		
		subArray.push(Math.round(this.animation.times[i] * 10000)/100 + '%');
		subArray.push(Math.round(this.animation.times[i] * this.animation.dur.value * 100)/100);
		
		switch(type) {
			case 1:		// motion
				var in1 = document.createElement('input');
					in1.setAttribute('type', 'number');
					in1.setAttribute('min', '0');
					in1.setAttribute('max', '100');
					in1.setAttribute('value', (Math.round(this.animation.values[i] * 10000)/100));
				subArray.push(in1);
				break;
			case 3:		// rotate
				var in1 = document.createElement('input');
					in1.setAttribute('type', 'number');
					in1.setAttribute('value', (Math.round(this.animation.values[i].angle*100)/100));
				subArray.push(in1);
			case 2:		// translate
				var in2 = document.createElement('input');
					in2.setAttribute('type', 'number');
					in2.setAttribute('value', (Math.round(this.animation.values[i].x*100)/100));
				subArray.push(in2);
				var in3 = document.createElement('input');
					in3.setAttribute('type', 'number');
					in3.setAttribute('value', (Math.round(this.animation.values[i].y*100)/100));
				subArray.push(in3);
				break;
			case 4:		// scale
				var in2 = document.createElement('input');
					in2.setAttribute('type', 'number');
					in2.setAttribute('value', (Math.round(this.animation.values[i].x*1000)/10));
				subArray.push(in2);
				var in3 = document.createElement('input');
					in3.setAttribute('type', 'number');
					in3.setAttribute('value', (Math.round(this.animation.values[i].y*1000)/10));
				subArray.push(in3);
				break;
			case 5:		// skewX or skewY
				var in2 = document.createElement('input');
					in2.setAttribute('type', 'number');
					in2.setAttribute('value', (Math.round(this.animation.values[i].angle*100)/100));
				subArray.push(in2);
				break;
			case 0:		// animate (generic)
				var in1;
				var cloneSelect;
				
				var customValue = (attrValues.indexOf(this.animation.values[i]) == -1);
				
				if(attrValues.length > 1) {
					cloneSelect = attrSelect.cloneNode(true);
					for(var j = 0; j < attrValues.length; j++) {
						if(!customValue && attrValues[j] == this.animation.values[i]) {
							cloneSelect.children[j].setAttribute('selected', 'true');
						}
					}
				} else {
					if(this.animation.attribute == 'd') {
						in1 = document.createElement('input');
						in1.setAttribute('type', 'text');
						in1.setAttribute('value', this.animation.values[i].trim().replace(/\s+/g,' '));
						customValue = true;
					} else {
						in1 = document.createElement('input');
						in1.setAttribute('value', this.animation.values[i]);
						
						switch(attrValues[0]) {
							case "<string>":
								in1.setAttribute("type", "text");
								in1.setAttribute('title', 'String');
								break;
							case "<length>":
							case "<number>":
							case "<angle>":
								in1.setAttribute('title', 'Numeric value');
								in1.setAttribute("type", "number");
								break;
							case "<color>":
								in1.setAttribute("type", "color");
								in1.setAttribute('title', 'Color');
								break;
							case "<fraction>":
								in1.setAttribute("type", "number");
								in1.setAttribute("min", "0");
								in1.setAttribute("max", "100");
								in1.setAttribute("value", this.animation.values[i] * 100);
								in1.setAttribute('title', 'Percentage');
								break;
						}
					}
					if(!customValue) {
						in1.setAttribute('class', 'hidden');
					}
				}
				
				var cont = document.createElement('div');
				if(cloneSelect) { cont.appendChild(cloneSelect); }
				if(in1) { cont.appendChild(in1); }
				
				subArray.push(cont);
				break;
			case 6:		// animation group
				var state = svg.animationStates[this.animation.groupName][this.animation.values[i]];
				var sel = groupSelection.cloneNode(true);
				sel.setSelected(parseInt(this.animation.values[i]));
				subArray.push(sel);
				
				var preview = new imageSVG(state.element, { width: 100, height: 50 });
				subArray.push(preview.container);
				break;
		}
		
		if(this.animation.calcMode == "spline") {
			var contSpline = document.createElement('div');
			
			if(i > 0 && this.animation.splines && this.animation.splines[i-1]) {
				var ins1 = build.input('number', this.animation.splines[i-1].x1, { 'min': 0, 'max': 1, 'step': 0.05, 'pattern': '[0-9]*' });
				var ins2 = build.input('number', this.animation.splines[i-1].y1, { 'min': 0, 'max': 1, 'step': 0.05, 'pattern': '[0-9]*' });
				var ins3 = build.input('number', this.animation.splines[i-1].x2, { 'min': 0, 'max': 1, 'step': 0.05, 'pattern': '[0-9]*' });
				var ins4 = build.input('number', this.animation.splines[i-1].y2, { 'min': 0, 'max': 1, 'step': 0.05, 'pattern': '[0-9]*' });
				var contSplineInput = document.createElement('span');
					contSplineInput.setAttribute('class', 'splineInput');
					contSplineInput.appendChild(ins1);
					contSplineInput.appendChild(ins2);
					contSplineInput.appendChild(ins3);
					contSplineInput.appendChild(ins4);
				
				var cloneSplineSelect = splineSelect.cloneNode(true);
				
				if(this.animation.splines[i-1].type != null) {
					cloneSplineSelect.setSelected(this.animation.splines[i-1].type);
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
	this.refreshSelection();
	
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
			iTime.setAttribute('onchange', 'if(!windowAnimation.animation){return;};windowAnimation.animation=windowAnimation.animation.setBegin('+i+', this.value, true);windowAnimation.refreshBegins();');
		
		var iRemove = document.createElement("button");
			iRemove.appendChild(document.createTextNode("Remove"));
			iRemove.setAttribute('onclick', 'if(!windowAnimation.animation){return;};windowAnimation.animation=windowAnimation.animation.removeBegin('+i+', true);windowAnimation.refreshBegins();');
		
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
		addBegin.setAttribute('onclick', 'if(!windowAnimation.animation){return;};windowAnimation.animation=windowAnimation.animation.addBegin(this.previousElementSibling.value, true);windowAnimation.refreshBegins();');
		
	var cont = document.createElement('div');
		cont.appendChild(iNew);
		cont.appendChild(addBegin);
		cont.setAttribute('style', 'text-align: center;');
		
	this.tab2.appendChild(cont);
	
	this.container.parentNode.scrollTop = scrolledTopParent;
	this.container.parentNode.scrollLeft = scrolledLeftParent;
	this.tab2.scrollTop = scrolledTop;
	this.tab2.scrollLeft = scrolledLeft;
}

windowAnimation.prototype.refreshSelection = function() {
	if(!this.tab1 || !this.tab1.children[0]) { return; }
	for(var i = 1; i < this.tab1.children[0].children.length; i++) {
		if(this.selected.indexOf(i-1) != -1) {
			this.tab1.children[0].children[i].addClass('selected');
		} else {
			this.tab1.children[0].children[i].removeClass('selected');
		}
	}
}

windowAnimation.prototype.refreshAttributes = function() {
	if(this.animation instanceof animationGroup) {
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
					{ 'label': animatable[i], 'onclick': 'if(this.checked){windowAnimation.animation.animate("'+animatable[i]+'");}else{windowAnimation.animation.unanimate("'+animatable[i]+'");};' }
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
			this.selected.sort();
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
		this.selected.sort();
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




windowAnimation.prototype.eventContextMenu = function(event) {
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
	
	var targ = event.target;
	while(!(targ instanceof HTMLTableRowElement)) {
		targ = targ.parentNode;
	}
	if(!targ.rowIndex) { return; }
	
	popup.macroAnimationContextMenu(event, targ.rowIndex-1, windowAnimation.animation.isInvertible());
}

windowAnimation.prototype.contextMenuEvaluate = function(option, index) {
	var anim = this.animation;
	var times = anim.getTimes();
	
	if(index == null) { return; }
	switch(option) {
		case "up":		// frame up
			if(this.selected.length == 0) {
				anim.moveValue(index, index-1, true);
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
				anim.duplicateValue(index, true);
			} else {
				var added = 0;
				var newSelection = [];
				for(var i = 0; i < this.selected.length; i++) {
					anim.duplicateValue(this.selected[i]+added, true);
					added++;
					newSelection.push(this.selected[i]+added);
				}
				this.selected = newSelection;
				this.refreshSelection();
			}
			break;
		case "down":		// frame down
			if(this.selected.length == 0) {
				anim.moveValue(index, index+1, true);
			} else {
				var newSelection = [];
				var lastIndex = null;
				for(var i = this.selected.length-1; i >= 0; i--) {
					if(lastIndex == this.selected[i]+1 || this.selected[i] == times.length-1) {
						lastIndex = this.selected[i];
						newSelection.push(this.selected[i]);
					} else {
						anim.moveValue(this.selected[i], this.selected[i]+1, true);
						if(this.selected[i]+1 != times.length) { newSelection.push(this.selected[i]+1); }
					}
					
				}
				this.selected = newSelection;
				this.refreshSelection();
			}
			
			break;
		case "balance":		// balance keyFrames
			if(this.selected.length == 0) {
				anim.balanceFrames(null, null, true);
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
					anim.balanceFrames(intervals[i][0], intervals[i][1], true);
				}
			}
			break;
		case "invert":		// invert values
			if(this.selected.length == 0) {
				anim.invertValues(null, true);
			} else {
				for(var i = 0; i < this.selected.length; i++) {
					anim.invertValues(this.selected[i], true);
				}
			}
			break;
		case "delete":		// remove keyFrame
			if(this.selected.length == 0) {
				anim.removeValue(index, true);
			} else {
				for(var i = this.selected.length-1; i >= 0; i--) {
					if(this.selected[i] == 0 || this.selected[i] == times.length-1) { continue; }
					anim.removeValue(this.selected[i], true);
				}
			}
			this.selected = [];
			break;
	}
	windowAnimation.refreshKeyframes();
}

windowAnimation.prototype.eventChange = function(event) {
	console.log('change');
	var val = event.target.value;
	var anim = windowAnimation.animation;
	
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
					if(windowAnimation.selected.length == 0 || windowAnimation.selected.indexOf(row) == -1) {
						anim.setX(row, val, true);
					} else {
						for(var i = 0; i < windowAnimation.selected.length; i++) {
							anim.setX(windowAnimation.selected[i], val, true);
						}
					}
				}
				if(col == 3) {
					if(windowAnimation.selected.length == 0 || windowAnimation.selected.indexOf(row) == -1) {
						anim.setY(row, val, true);
					} else {
						for(var i = 0; i < windowAnimation.selected.length; i++) {
							anim.setY(windowAnimation.selected[i], val, true);
						}
					}
				}
				break;
			case 'rotate':		// rotate
				splineRow = 5;
				if(col == 2) {
					if(windowAnimation.selected.length == 0 || windowAnimation.selected.indexOf(row) == -1) {
						anim.setAngle(row, val, true);
					} else {
						for(var i = 0; i < windowAnimation.selected.length; i++) {
							anim.setAngle(windowAnimation.selected[i], val, true);
						}
					}
				}
				if(col == 3) {
					if(windowAnimation.selected.length == 0 || windowAnimation.selected.indexOf(row) == -1) {
						anim.setX(row, val, true);
					} else {
						for(var i = 0; i < windowAnimation.selected.length; i++) {
							anim.setX(windowAnimation.selected[i], val, true);
						}
					}
				}
				if(col == 4) {
					if(windowAnimation.selected.length == 0 || windowAnimation.selected.indexOf(row) == -1) {
						anim.setY(row, val, true);
					} else {
						for(var i = 0; i < windowAnimation.selected.length; i++) {
							anim.setY(windowAnimation.selected[i], val, true);
						}
					}
				}
				break;
			case 'skewX':		// skewX
			case 'skewY':		// skewY
				splineRow = 3;
				if(col == 2) {
					if(windowAnimation.selected.length == 0 || windowAnimation.selected.indexOf(row) == -1) {
						anim.setAngle(row, val, true);
					} else {
						for(var i = 0; i < windowAnimation.selected.length; i++) {
							anim.setAngle(windowAnimation.selected[i], val, true);
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
			
			if(windowAnimation.selected.length == 0 || windowAnimation.selected.indexOf(row) == -1) {
				anim.setValue(row, value, true);
			} else {
				for(var i = 0; i < windowAnimation.selected.length; i++) {
					anim.setValue(windowAnimation.selected[i], value, true);
				}
			}
		}
	} else if(anim instanceof animationGroup) {
		splineRow = 4;
		if(col == 2) {
			var value = parseInt(val);
			if(windowAnimation.selected.length == 0 || windowAnimation.selected.indexOf(row) == -1) {
				anim.setValue(row, value, true);
			} else {
				for(var i = 0; i < windowAnimation.selected.length; i++) {
					anim.setValue(windowAnimation.selected[i], value, true);
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
				
			if(windowAnimation.selected.length == 0 || windowAnimation.selected.indexOf(row) == -1) {
				anim.setValue(row, val, true);
			} else {
				for(var i = 0; i < windowAnimation.selected.length; i++) {
					anim.setValue(windowAnimation.selected[i], val, true);
				}
			}
		}
	}
	
	if(col == splineRow) {
		if(event.target instanceof HTMLSelectElement) {
			if(event.target.value == "-1") {
				var data = [
					event.target.nextElementSibling.children[0].value,
					event.target.nextElementSibling.children[1].value,
					event.target.nextElementSibling.children[2].value,
					event.target.nextElementSibling.children[3].value
				];
				data = data.join(' ');
				if(windowAnimation.selected.length == 0 || windowAnimation.selected.indexOf(row) == -1) {
					anim.setSplineData(row-1, data, true);
				} else {
					for(var i = 0; i < windowAnimation.selected.length; i++) {
						if(windowAnimation.selected[i] == 0) { continue; }
						anim.setSplineData(windowAnimation.selected[i]-1, data, true);
					}
				}
			} else {
				if(windowAnimation.selected.length == 0 || windowAnimation.selected.indexOf(row) == -1) {
					anim.setSplineType(row-1, event.target.value, true);
				} else {
					for(var i = 0; i < windowAnimation.selected.length; i++) {
						if(windowAnimation.selected[i] == 0) { continue; }
						anim.setSplineType(windowAnimation.selected[i]-1, event.target.value, true);
					}
				}
				windowAnimation.refreshKeyframes();
			}
		} else {
			var data = [
					event.target.parentNode.children[0].value,
					event.target.parentNode.children[1].value,
					event.target.parentNode.children[2].value,
					event.target.parentNode.children[3].value
				];
			data = data.join(' ');
			if(windowAnimation.selected.length == 0 || windowAnimation.selected.indexOf(row) == -1) {
				anim.setSplineData(row-1, data, true);
			} else {
				for(var i = 0; i < windowAnimation.selected.length; i++) {
					if(windowAnimation.selected[i] == 0) { continue; }
					anim.setSplineData(windowAnimation.selected[i]-1, data, true);
				}
			}
		}
	} else {
		windowAnimation.refreshKeyframes();
	}
	svg.gotoTime();
	
	if(this.animation) {
		svg.ui.edit(this.animation.element);
	} else {
		svg.ui.edit(svg.selected);
	}
}
windowAnimation.prototype.eventClick = function(event) {
	var anim = windowAnimation.animation;
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
		windowAnimation.select(index, event);
		return;
	}
	
	event.stopPropagation();
	
	if(index == 0 || index == anim.times.length-1) { return; }
	
	var min, max, step, value;
	var attrOut = { 'onchange': '', 'onmousemove': '' };
	
	attrOut.onchange += 'var shep = windowAnimation.animation;if(!shep){return;}';
	
	if(!popup.isHidden()) { popup.hide(); return; }
	
	if(col == 0) {	// percentages
		min = index == 0 ? 0 : (anim.times[index-1] * 100);
		max = index+1 < anim.times.length ? (anim.times[index+1] * 100) : 100;
		if(index == 0) { max = 0; }
		if(index == anim.times.length-1) { min = 100; }
		attrOut.onchange += 'shep.setTime('+index+', parseFloat(this.value)/100, true);';
	} else {	// actual time
		min = index == 0 ? 0 : (anim.times[index-1] * anim.dur.value);
		max = index+1 < anim.times.length ? (anim.times[index+1] * anim.dur.value) : anim.dur.value;
		if(index == 0) { max = 0; }
		if(index == anim.times.length-1) { min = anim.dur.value; }
		attrOut.onchange += 'shep.setTime('+index+', parseFloat(this.value)/'+anim.dur.value+', true);';
	}
	attrOut.onchange += 'windowAnimation.refreshKeyframes();';
	
	attrOut.onmousemove += 'if(event.buttons!=1){return;}';
	attrOut.onmousemove += attrOut.onchange;
	
	step = (max-min)/100;
	value = col == 0 ? anim.times[index] * 100 : anim.times[index] * anim.dur.value;
	
	var actionYes = null;
	var actionNo = 'var shep = windowAnimation.animation;if(!shep){return;}shep.setTime('+index+', '+anim.times[index]+', true);windowAnimation.refreshKeyframes();';
	
	attrOut.min = min;
	attrOut.max = max;
	attrOut.step = step;
	
	popup.macroSlider(targ, value, attrOut, actionYes, actionNo, true);
}
windowAnimation.prototype.eventDragStart = function(event) {
	if(windowAnimation.selected.length > 0) {
		event.preventDefault ? event.preventDefault() : event.returnValue = false;
		return false;
	}
	targ = event.target;
	while(targ.parentNode && !(targ instanceof HTMLTableRowElement)) {
		targ = targ.parentNode;
	}
	var index = targ.rowIndex-1;
	if(index == null || isNaN(index)) { return; }
	windowAnimation.dragged = index;
}
windowAnimation.prototype.eventDragOver = function(event) {
	targ = event.target;
	while(targ.parentNode && !(targ instanceof HTMLTableRowElement)) {
		targ = targ.parentNode;
	}
	var index = targ.rowIndex-1;
	if(index == null || isNaN(index)) { return; }
	if(index > windowAnimation.dragged) {
		targ.style.borderBottomWidth = '5px';
	}
	if(index < windowAnimation.dragged) {
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
	windowAnimation.animation.moveValue(windowAnimation.dragged, index, true);
	windowAnimation.dragged = null;
	targ.removeAttribute('style');
	windowAnimation.refreshKeyframes();
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
		case 65:
			if(event.ctrlKey) {
				if(this.selected.length == this.animation.getTimes().length) {
					this.selected = [];
				} else {
					this.selected = [];
					for(var i = 0; i < this.animation.getTimes().length; i++) {
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






