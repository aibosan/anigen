/**
 *  @author		Ondrej Benda
 *  @date		2017
 *  @copyright	GNU GPLv3
 *	@brief		Window UI element for editing colors
 */
function windowColors() {
	windowGeneric.call(this, 'colors');
	
	this.seed();
}

windowColors.prototype = Object.create(windowGeneric.prototype);
windowColors.prototype.constructor = windowColors;

windowColors.prototype.seed = function() {
	this.setHeading('Fill and stroke');
	this.setImage('format_paint');
	
	this.imgRight.actions = [ "anigenManager.classes.windowColors.hide();anigenManager.classes.context.buttons.colors.setState(0);" ];
	
	this.tab1 = this.addTab('Fill');
	this.tab2 = this.addTab('Stroke paint');
	this.tab3 = this.addTab('Stroke style');
	
	this.ui = {};
	
	this.ui.strokeWidth = build.input('number', 0, { 'min': 0, 'step': 0.01,
		'onchange': 'svg.selected.setAttributeHistory({ "strokeWidth": this.value });'
	});
	this.ui.strokeMiterLimit = build.input('number', 0, { 'min': 0, 'max': 50, 'step': 0.01,
		'onchange': 'svg.selected.setAttributeHistory({ "strokeMiterlimit": this.value });'
	});
	
	this.ui.strokeJoin = build.select([		
		{ 'text': 'Miter join', 'value': 'miter' },
		{ 'text': 'Round join', 'value': 'round' },
		{ 'text': 'Bevel join', 'value': 'bevel' }
	], { 'onchange': 'svg.selected.setAttributeHistory({ "strokeLinejoin": this.value });' });
	
	this.ui.strokeCap = build.select([		
		{ 'text': 'Butt cap', 'value': 'butt' },
		{ 'text': 'Round cap', 'value': 'round' },
		{ 'text': 'Square cap', 'value': 'square' }
	], { 'onchange': 'svg.selected.setAttributeHistory({ "strokeLinecap": this.value });' });
	
	
	var strokeTable = build.table([
		[ 'Stroke width', this.ui.strokeWidth ],
		[ 'Join', this.ui.strokeJoin ],
		[ 'Miter limit', this.ui.strokeMiterLimit ],
		[ 'Cap', this.ui.strokeCap ]
	]);
	strokeTable.addClass('inputs');
	
	this.tab3.appendChild(strokeTable);
	
	
	this.tab4 = this.addTab('Stop color');
	
	this.tab5 = this.addTab('Disabled');
	var disabledWarning = document.createElement('strong');
		disabledWarning.appendChild(document.createTextNode('This element is not styllable.'));
	
	this.tab5.appendChild(disabledWarning);
	
	
	var opacityAction = 'svg.selected.setAttributeHistory({"opacity": this.value/100});this.parentNode.nextElementSibling.children[0].value = this.value;';
	var opacityInputAction = 'svg.selected.setAttributeHistory({"opacity": this.value/100});this.parentNode.previousElementSibling.children[0].value = this.value;';
	
	this.ui.opacitySlider = build.input('range', 0, { 'min': 0, 'max': 100, 'step': 0.01,
		'onchange': opacityAction,
		'onmousemove': 'if(window.event.buttons==1){'+opacityAction+'}'
	});
	this.ui.opacityInput = build.input('number', 0, { 'min': 0, 'max': 100,
		'onchange': opacityInputAction
	});
	
	var blurAction = 'svg.selected.setBlur(this.value/100);this.parentNode.nextElementSibling.children[0].value = this.value;';
	var blurInputAction = 'svg.selected.setBlur(this.value/100);this.parentNode.previousElementSibling.children[0].value = this.value;';
	
	this.ui.blurSlider = build.input('range', 0, { 'min': 0, 'max': 100, 'step': 0.01,
		'onchange': blurAction,
		'onmousemove': 'if(window.event.buttons==1){'+blurAction+'}'
	});
	this.ui.blurInput = build.input('number', 0, { 'min': 0, 'max': 100,
		'onchange': blurInputAction
	});
	
	var table = build.table([
		[ 'Blur', this.ui.blurSlider, this.ui.blurInput ],
		[ 'Opacity', this.ui.opacitySlider, this.ui.opacityInput ]
		
	]);
	
	table.setAttribute('class', 'opacity');
	this.footer.appendChild(table);
}

windowColors.prototype.refresh = function() {
	var type = 0;
	
	if(svg.selected instanceof SVGGElement ||
		svg.selected instanceof SVGPathElement ||
		svg.selected instanceof SVGRectElement ||
		svg.selected instanceof SVGCircleElement ||
		svg.selected instanceof SVGEllipseElement ||
		svg.selected instanceof SVGLineElement ||
		svg.selected instanceof SVGPolylineElement ||
		svg.selected instanceof SVGPolygonElement ||
		svg.selected instanceof SVGTextElement ||
		svg.selected instanceof SVGTSpanElement ||
		svg.selected instanceof SVGMarkerElement ||
		svg.selected instanceof SVGCursorElement
	) { type = 1; }
	if(svg.selected instanceof SVGStopElement) {
		type = 2;
	}
	
	
	if(type == 1) {	// fill and stroke
		this.refreshTab(this.tab1, 'fill', 'fillOpacity');
		this.refreshTab(this.tab2, 'stroke', 'strokeOpacity');
		this.refreshStroke();
		this.unhideTab(0);
		this.unhideTab(1);
		this.unhideTab(2);
		this.hideTab(3);
		this.hideTab(4);
	} else if(type == 2) {	// stop color
		this.refreshTab(this.tab4, 'stop-color', null, true);
		this.hideTab(0);
		this.hideTab(1);
		this.hideTab(2);
		this.unhideTab(3);
		this.showTab(3);
		this.hideTab(4);
	} else {	// nothing
		this.hideTab(0);
		this.hideTab(1);
		this.hideTab(2);
		this.hideTab(3);
		this.unhideTab(4);
		this.showTab(4);
	}
	
	this.refreshInputs(type != 1);
}

windowColors.prototype.refreshInputs = function(disable) {
	this.ui.opacityInput.value = this.ui.opacitySlider.value = (parseFloat(svg.selected.style.opacity) || 1)*100;
	//this.ui.blurInput.value = this.ui.blurSlider.value = Math.round(svg.selected.getBlur()*10000)/100;
	this.ui.blurInput.value = this.ui.blurSlider.value = (svg.selected.getBlur()*100).toFixed(2);
	
	if(disable) {
		this.ui.opacityInput.setAttribute('disabled', 'disabled');
		this.ui.opacitySlider.setAttribute('disabled', 'disabled');
		this.ui.blurInput.setAttribute('disabled', 'disabled');
		this.ui.blurSlider.setAttribute('disabled', 'disabled');
	} else {
		this.ui.opacityInput.removeAttribute('disabled');
		this.ui.opacitySlider.removeAttribute('disabled');
		this.ui.blurInput.removeAttribute('disabled');
		this.ui.blurSlider.removeAttribute('disabled');
	}
}

windowColors.prototype.refreshTab = function(tab, appliesTo, alphaChannel, onlyFlatColor) {
	var target = svg.selected;
	if(!target) { return; }
	
	tab = tab || this.tab1;
	appliesTo = appliesTo || 'fill';
	
	tab.removeChildren();
	
	var isCSS = target.style.hasOwnProperty(appliesTo);
	
	var targetValue = isCSS ? target.style[appliesTo] : target.getAttribute(appliesTo);
	var linked = null;
	
	var radioState = null;
	
	if(isCSS && !onlyFlatColor) {
		if(!targetValue || targetValue == "inherit") {
			radioState = 5;
		} else if(targetValue == 'none') {
			radioState = 0;
		} else if(targetValue.startsWith('url(')) {
			var fillId = targetValue.replace(/^url\([^#]*#|[\"]?\)$/g, '');	// extracts id from url
			linked = document.getElementById(fillId);
			if(!linked) {
				radioState = 2;	// new link
			} else if(linked instanceof SVGGradientElement) {	// gradient
				radioState = 3;
			} else if(linked  instanceof SVGPatternElement) {	// pattern
				radioState = 4;
			} else {
				radioState = 2;
			}
		} else {
			radioState = 1;
		}
		
		if(targetValue == 'url("#link")') { radioState = 2; }
		if(targetValue == 'url("#gradient")') { radioState = 3; }
		if(targetValue == 'url("#pattern")') { radioState = 4; }
	
			
		var radios = [
			new uiButton('close', 'svg.selected.setAttributeHistory({"'+appliesTo+'": "none"});anigenManager.classes.windowColors.refresh();', 'No paint', { 'radio': true, 'toggle': true, 'state': radioState == 0 ? 1 : 0 }),
			new uiButton('brush', 'svg.selected.setAttributeHistory({"'+appliesTo+'": "#000000"});anigenManager.classes.windowColors.refresh();', 'Solid color', { 'radio': true, 'toggle': true, 'state': radioState == 1 ? 1 : 0 }),
			new uiButton('gradient', "svg.selected.setAttributeHistory({'"+appliesTo+"': 'url(\"#gradient\")'});anigenManager.classes.windowColors.refresh();", 'Gradient', { 'radio': true, 'toggle': true, 'state': radioState == 3 ? 1 : 0 }),
			new uiButton('texture', "svg.selected.setAttributeHistory({'"+appliesTo+"': 'url(\"#pattern\")'});anigenManager.classes.windowColors.refresh();", 'Pattern', { 'radio': true, 'toggle': true, 'state': radioState == 4 ? 1 : 0 }),
			new uiButton('link', "svg.selected.setAttributeHistory({'"+appliesTo+"': 'url(\"#link\")'});anigenManager.classes.windowColors.refresh();", 'Generic linked object', { 'radio': true, 'toggle': true, 'state': radioState == 2 ? 1 : 0 }),
			new uiButton('file_upload', 'svg.selected.setAttributeHistory({"'+appliesTo+'": "inherit"});anigenManager.classes.windowColors.refresh();', 'Inherited', { 'radio': true, 'toggle': true, 'state': radioState == 5 ? 1 : 0 }),
		];
		
		var fillRuleButton =
			new uiButton([ 'cloud_circle', 'lens' ], [
				'svg.selected.setAttributeHistory({"fillRule": "nonzero"});',
				'svg.selected.setAttributeHistory({"fillRule": "evenodd"});' ],
				[
				'Path self-intersections and subpaths create hole in the fill (fill-rule: evenodd)',
				'Fill is solid unless a subpath is counterdirectional (fill-rule: nonzero'
				],
				{ 'state': target.style.fillRule == 'evenodd' ? 0 : 1, 'display': appliesTo == 'fill' ? null : 'none' }
			);
		fillRuleButton.style.float = "right";
		
		
		var radiosContainer = document.createElement('div');
		radiosContainer.style.fontSize = "24px";
		
		for(var i = 0; i < radios.length; i++) {
			radios[i].style.float = "left";
			radios[i].shepherd.setRadioChain(i == radios.length-1 ? radios[0] : radios[i+1]);
			radiosContainer.appendChild(radios[i]);
		}
		radiosContainer.appendChild(fillRuleButton);
		
		if(linked) {
			var selectLink = new uiButton('link', 'svg.select("'+linked.id+'");', 'Select linked element.');
			selectLink.style.float = "right";
			radiosContainer.appendChild(selectLink);
		}
		
		tab.appendChild(radiosContainer);
		
		
		if(radioState == 3 || radioState == 4) {	// gradient
		
			var matched;
			if(radioState == 3) {
				matched = svg.defs.getElementsByTagName('gradient', false, true);
			} else {
				matched = svg.defs.getElementsByTagName('pattern', false, true);
			}
			
			var array = [];
			var attributes = [ {} ];
			
			for(var i = 0; i < matched.length; i++) {
				matchedType = matched[i] instanceof SVGLinearGradientElement ? 'linear' : 'radial';
				if(matched[i] instanceof SVGPatternElement) { matchedType = "pattern"; }
				
				array.push([
					new gradientPreview(matched[i], { 'width': "100%", 'height': "24px" }).container,
					matched[i].getAttribute("id"),
					matchedType
				]);
				attributes.push({ "onclick": "svg.selected.setAttributeHistory({'"+appliesTo+"': 'url(\"#"+matched[i].getAttribute("id")+"\")'});anigenManager.classes.windowColors.refresh();"})
				if(linked && matched[i].id == linked.id) {
					attributes[attributes.length-1].class = 'selected';
				}
			}
			
			var table = build.table(array, [ 'preview', 'id', 'type' ], attributes);
			table.setAttribute('class', 'gradients');
		
			tab.appendChild(table);
			
			radioState = 3;
		} else if(radioState == 2) {	// link
			var linkInput = build.input('text', '', { 'title': 'Target identifier',
				'onkeyup': 'if(document.getElementById(this.value)) { this.setAttribute("class", "green"); } else { this.setAttribute("class", "red"); }'
			});
			var linkSubmit = build.button('Link', { 
				'onclick': "if(this.previousElementSibling.hasClass('green')){var tmp='url(\"#';tmp+=this.previousElementSibling.value;tmp+='\")';console.log(tmp);svg.selected.setAttributeHistory({'"+appliesTo+"': tmp});}"
			});
			
			var cont = document.createElement('div');
			cont.appendChild(linkInput);
			cont.appendChild(linkSubmit);
			
			tab.appendChild(cont);
		}
	} else {
		radioState = 1;
	}
	
	if(radioState == 1) {
		var array = [];
		
		if(alphaChannel) {
			var isAlphaCSS = target.style.hasOwnProperty(alphaChannel);
			var alphaValue = isAlphaCSS ? target.style[alphaChannel] : target.getAttribute(alphaChannel);
			if(alphaValue == null || alphaValue.length == 0) { alphaValue = '1'; }
			
			var actionColor = 'svg.selected.setAttributeHistory({"'+appliesTo+'": this.value});';
			actionColor += 'var textHex = this.parentNode.nextElementSibling.nextElementSibling.children[0];textHex.value = this.value.substr(1) + textHex.value.substr(6, 2);';
				
			
			array.push(build.input('color', new color(targetValue), { 'onchange': actionColor }));
			
			alphaValue = alphaValue.indexOf('%') > -1 ? parseFloat(alphaValue)/100 : parseFloat(alphaValue);
			var alphaHex = (alphaValue*255).toString(16);
				alphaHex = String("00" + alphaHex).slice(-2);
			
			var actionSlider = 'svg.selected.setAttributeHistory({"'+alphaChannel+'": this.value/255});';
			actionSlider += 'var textHex=this.parentNode.nextElementSibling.children[0];textHex.value=textHex.value.substr(0,6)+String("00"+parseInt(this.value).toString(16)).slice(-2);'
			
			array.push(build.input('range', alphaValue*255, { 'min': 0, 'max': 255, 'step': 1,
				'onmousemove': 'if(window.event.buttons==1){'+actionSlider+'}', 'onchange': actionSlider
			}));
			
			
			var actionHex = 'this.value=(this.value+"00000000").substr(0,8);var col = new color("#"+this.value);'
			
			actionHex += 'svg.selected.setAttributeHistory({"'+appliesTo+'": col.getHex()});';
			actionHex += 'svg.selected.setAttributeHistory({"'+alphaChannel+'": col.a/255});';
			actionHex += "this.parentNode.previousElementSibling.previousElementSibling.children[0].value=col.getHex();"
			
			array.push(build.input('text', new color(targetValue).toString().substr(1)+alphaHex, {
				'title': 'RGBA value',
				'onchange': actionHex
				
			}));
		} else {
			var actionColor = 'svg.selected.setAttributeHistory({"'+appliesTo+'": this.value});'
			actionColor += 'this.parentNode.nextElementSibling.children[0].value = this.value.substr(1);';
			
			array.push(build.input('color', new color(targetValue), { 'onchange': actionColor }));
			
			var actionHex = 'this.value=(this.value+"000000").substr(0,6);var col = new color("#"+this.value);'
			
			actionHex += 'svg.selected.setAttributeHistory({"'+appliesTo+'": col.getHex()});';
			
			actionHex += "this.parentNode.previousElementSibling.children[0].value=col.getHex();"
			
			array.push(build.input('text', new color(targetValue).toString().substr(1), {
				'title': 'RGB value',
				'onchange': actionHex
				
			}));
		}
		
		var table = build.table([array]);
		
		tab.appendChild(table);
		
		//var alphaInput = build.input()
	}
		
}

windowColors.prototype.refreshStop = function() {
	
}

windowColors.prototype.refreshStroke = function() {
	if(!svg || !svg.selected) { return; }
	this.ui.strokeWidth.value = svg.selected.style.strokeWidth;
	this.ui.strokeMiterLimit.value = svg.selected.style.strokeMiterlimit;
	
	switch(svg.selected.style.strokeLinejoin) {
		case 'round': this.ui.strokeJoin.setSelected(1); break;
		case 'bevel': this.ui.strokeJoin.setSelected(2); break;
		default: this.ui.strokeJoin.setSelected(0); break;
	}
	
	switch(svg.selected.style.strokeLinecap) {
		case 'round': this.ui.strokeCap.setSelected(1); break;
		case 'sqare': this.ui.strokeCap.setSelected(2); break;
		default: this.ui.strokeCap.setSelected(0); break;
	}
}


