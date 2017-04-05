/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Overlay UI element for messages and dialogues intended to block entire UI
 */
function overlay() {
    this.container = document.createElement("div");
    this.header = document.createElement("h1");
    this.content = document.createElement("div");
    this.buttonsTop = document.createElement("div");
	this.buttons = document.createElement("div");

	this.container.appendChild(this.buttonsTop);
    this.container.appendChild(this.header);
    this.container.appendChild(this.content);
    this.container.appendChild(this.buttons);

	var overlay = document.createElement('div')
		overlay.setAttribute('class', 'overlay');
		overlay.appendChild(this.container);
	document.body.appendChild(overlay);
	
	this.hidden = false;
	this.animate = false;
}

overlay.prototype.hide = function() {
	if(this.animate) {
		this.container.parentNode.style.transition = "opacity .25s ease-in 0s, height 0s linear 0.25s"; 
	}
	this.container.parentNode.style.opacity = 0;
	this.container.parentNode.style.height = "0%";
	this.hidden = true;
	document.activeElement.blur();
}
overlay.prototype.show = function() {
	if(this.animate) {
		this.container.parentNode.style.transition = "opacity .25s ease-in 0s, height 0s linear 0s"; 
	}
	this.container.parentNode.style.opacity = 1;
	this.container.parentNode.style.height = "100%";
	this.hidden = false;
}

overlay.prototype.reset = function() {
	this.hide();
	this.header.removeChildren();
	this.content.removeChildren();
	this.buttons.removeChildren();
	this.buttonsTop.removeChildren();
}

overlay.prototype.setHeader = function(text) {
	this.header.removeChildren();
	var span = document.createElement("span");
	span.appendChild(document.createTextNode(text));
	this.header.appendChild(span);
}

overlay.prototype.add = function(element) {
	this.content.appendChild(element);
	return element;
}

overlay.prototype.addButton = function(button, onlyOne) {
	this.buttons.appendChild(button);
	if(!onlyOne) {
		this.buttonsTop.appendChild(button.cloneNode(true));
	}
	return button;
}
overlay.prototype.addButtonOk = function(action, onlyOne) {
	var button = document.createElement("button");
	button.setAttribute("class", "black");
	if(action) {
		button.setAttribute("onclick", "overlay.hide();"+action);
	} else {
		button.setAttribute("onclick", "overlay.hide();");
	}
	button.appendChild(document.createTextNode("Ok"));
	return this.addButton(button, onlyOne);
}
overlay.prototype.addButtonCancel = function(action, onlyOne) {
	var button = document.createElement("button");
	if(action) {
		button.setAttribute("onclick", "overlay.hide();"+action);
	} else {
		button.setAttribute("onclick", "overlay.hide();");
	}
	button.appendChild(document.createTextNode("Cancel"));
	return this.addButton(button, onlyOne);
}


overlay.prototype.macroDisclaimer = function() {
	this.reset();
	this.setHeader("Welcome to aniGen");
	
	this.add(build.img("_png/logo_large_center.png", "aniGen logo", { 'class': 'logo' }));

	this.add(build.p("AniGen is a browser-based editor whose main focus is the creation and editing of SVG animations. It requires an SVG-capable browser and javascript to run. Cookies may be used in broswers which do not support local storage."));
	this.add(build.p("AniGen is free software available as is. It is distributable under GPLv3. The author holds no responsibility for any use of the software."));
	this.add(build.p("By using aniGen, you accept these terms and conditions."));

	this.addButtonOk('anigenActual.confirm();overlay.macroOpen();', true);
	this.addButtonCancel('location.href="http://google.com";', true).setAttribute('onclick', 'location.href="http://google.com";');
	
	this.show();
}

overlay.prototype.macroAbout = function() {
	this.reset();
	this.setHeader("About");
	
	this.add(build.img("_png/logo_large_center.png", "aniGen logo", { "class": "logo" } ));
	
	this.add(build.p([ "Current version: ", build.strong(anigenActual.version) ]));
	
	this.add(build.p([ 
		"AniGen is a free software available as is. Its source code is available at ",
		build.a("GitHub", "https://github.com/aibosan/anigen"),
		" and can be used and spread under GPLv3."
	]));
	
	this.add(build.p("Third-party libraries:"));
	
	this.add(build.a("Open Sans", "https://fonts.google.com/specimen/Open+Sans"));
	this.add(build.br());
	this.add(build.a("SVGRender", "https://github.com/adasek/svg-render"));
	this.add(build.br());
	this.add(build.a("Google Material Icons", "https://material.io/icons/"));
	
	this.add(build.p("Created by Ondřej 'Aibo' Benda."));
	
	this.addButtonOk(null, true);

	this.show();
}

overlay.prototype.macroDocument = function() {
	this.reset();
	this.setHeader("Page");
	
	this.add(build.table([
		[ "Width", build.input('number', svg.svgBox[2], { 'id': 'anigenInputWidth' }) ],
		[ "Height", build.input('number', svg.svgBox[3], { 'id': 'anigenInputHeight' }) ]
	]));
	
	this.addButtonOk("svg.setPageSize(document.getElementById('anigenInputWidth').value, document.getElementById('anigenInputHeight').value);", true);
	this.addButtonCancel(null, true);
	
	this.show();
}

overlay.prototype.macroSettings = function() {
	this.reset();
	this.setHeader("Settings");
	
	this.add(build.table([
		[ "Show element highlights",
			new uiButton(['check_box_outline_blank', 'check_box'], null, ['Red curve highlighting currently selected element.', 0], { 'class': 'md-24', 'state': anigenActual.settings.get('highlight') })],
		[ "Show progress curves",
			new uiButton(['check_box_outline_blank', 'check_box'], null, ['Green lines connecting positions of corresponding animation nodes.', 0], { 'class': 'md-24', 'state': anigenActual.settings.get('progressCurve') })],
		[ "Show nodes",
			new uiButton(['check_box_outline_blank', 'check_box'], null, ['Green lines connecting positions of corresponding animation nodes.', 0], { 'class': 'md-24', 'state': anigenActual.settings.get('nodes') })],
		[ "Show page border",
			new uiButton(['check_box_outline_blank', 'check_box'], null, null, { 'class': 'md-24', 'state': anigenActual.settings.get('canvasFrame') })],
		[ "Show rulers",
			new uiButton(['check_box_outline_blank', 'check_box'], null, null, { 'class': 'md-24', 'state': anigenActual.settings.get('rulers') })],
		[ "Refresh preview when camera is changed",
			new uiButton(['check_box_outline_blank', 'check_box'], null, ["Disabling can improve performance on some systems", 0], { 'class': 'md-24', 'state': anigenActual.settings.get('previewAutorefresh') })],
		[ "Automatically refresh selection box",
			new uiButton(['check_box_outline_blank', 'check_box'], null, ["Disabling can improve performance on some systems", 0], { 'class': 'md-24', 'state': anigenActual.settings.get('selectionboxAutorefresh') })],
		[ "Load animation states from entire document",
			new uiButton(['check_box_outline_blank', 'check_box'], null, ["Loads animation states from the entire document, automatically updating those in documents with new data", 0], { 'class': 'md-24', 'state': anigenActual.settings.get('loadDocumentStates') })]
			
	]));
	
	this.addButtonOk('anigenActual.settings.evaluateOverlay();', true);
	this.addButtonCancel(null, true);
	
	this.show();
}

overlay.prototype.macroOpen = function() {
	this.reset();
	this.setHeader("Open file");
	
	this.add(build.input("file", null, {
		'id': 'files', 'name': 'files[]', 'accept': 'image/svg+xml', 'onchange': 'svg.load(this);'
	}));
	
	var label = this.add(build.label("Choose an SVG file", "files"));
	
	this.add(build.br());
	
	if(typeof(Storage) !== "undefined" && localStorage.getItem("quicksaveFilename")) {
		this.add(new uiLink('folder_open', 'svg.loadLocal();overlay.hide();', localStorage.getItem("quicksaveFilename"), { 'title': 'Load saved file' }));
		this.add(new uiLink('delete', 'svg.removeLocal();overlay.macroOpen();', 'Delete', { 'title': 'Delete local file' }));
		this.add(build.br());
	}
	this.add(new uiLink('import_contacts', 'window.open("manual.html", "_blank");', 'Open manual'));
	
	if(!window.location.href.match(/^file:/)) {
		if(svg.svgElement) {
			this.add(new uiLink('call_split', 'window.open("../../index.html?redirect=false", "_blank");', 'Switch version', { 'title': 'Show different versions' })).children[0].addClass('turn-90');
		} else {
			this.add(new uiLink('call_split', 'window.location.href = "../../index.html?redirect=false";', 'Switch version', { 'title': 'Show different versions' })).children[0].addClass('turn-90');
		}
	}
	this.add(build.br());
	
	if(svg.svgElement != null) {
		this.addButtonCancel(null, true);
	}
	

	this.show();
}

overlay.prototype.macroAnimationStatesManager = function() {
	this.reset();
	this.setHeader("Animation states manager");
	
	for(var i in svg.animationStates) {
		this.add(build.h(i, 2, {
			'onclick': 'this.nextElementSibling.style.display = this.nextElementSibling.style.display ? null : "none";this.nextElementSibling.nextElementSibling.style.display = this.nextElementSibling.nextElementSibling.style.display ? null : "none";',
			'title': 'Hide/show this group'
		}));
		
		var stateDemo = new animationGroup(svg.animationStates[i][0], null, null, [ 'd' ]);
			stateDemo.demo();
		var stateDemoPreview = new imageSVG(stateDemo.element, { 'width': 300, 'height': 200 });
		
		this.add(stateDemoPreview.container);
		
		tArray = [];
		
		for(var j = 0; j < svg.animationStates[i].length; j++) {
			tRow = [];
			
			var preview = new imageSVG(svg.animationStates[i][j].element, { width: 150, height: 100 });
			
			tRow.push(build.input('text', svg.animationStates[i][j].name));
			tRow.push(build.button("←", { "onclick": "this.parentNode.previousSibling.children[0].value = '"+svg.animationStates[i][j].name+"';" }));
			tRow.push(preview.container);
			tRow.push(build.input('checkbox'));
			tRow.push(build.button('Inbetween...', { "onclick": "overlay.macroStateInbetween("+j+", "+j+", null, '"+i+"');" }));
			
			tArray.push(tRow);
		}
		
		
		this.add(build.table(tArray, [ "Name", "Revert", "Preview", "Delete" ]));
	}
	
	this.addButtonOk("svg.evaluateStatesManager();");
	this.addButtonCancel();
	
	this.show();
}

overlay.prototype.macroStateInbetween = function(value1, value2, firstValueIndex, groupName) {
	this.reset();
	this.setHeader("Animation states inbetween creation");
	
	var states;
	if(groupName) {
		if(!svg.animationStates[groupName]) { return; }
		states = svg.animationStates[groupName];
	} else {
		if(!(anigenManager.classes.windowAnimation.animation instanceof animationGroup) ||
			!anigenManager.classes.windowAnimation.animation.getAttribute('anigen:group') ||
			!svg.animationStates[anigenManager.classes.windowAnimation.animation.getAttribute('anigen:group')]) {
			return;
		}
		states = svg.animationStates[anigenManager.classes.windowAnimation.animation.getAttribute('anigen:group')];
		groupName = anigenManager.classes.windowAnimation.animation.getAttribute('anigen:group');
	}
	
	if(value1 == null) { value1 = 0; }
	if(value2 == null) { value2 = 0; }
	if(!states[value1] || !states[value2]) { return; }
	
	var tArray = [];
	
	var opt = [];
	for(var i = 0; i < states.length; i++) {
		opt.push({'value': String(i), 'text': String(states[i].name)});
	}
	var stateSelection1 = build.select(opt);
	stateSelection1.setAttribute('onchange', 'overlay.macroStateInbetweenRefresh("'+groupName+'", true);');
	
	var stateSelection2 = stateSelection1.cloneNode(true);
	
	stateSelection1.setSelected(parseInt(value1));
	stateSelection2.setSelected(parseInt(value2));
	
	tArray.push([
		stateSelection1,
		build.input('text', 'variant-'+states[value1].name),
		stateSelection2
	]);
	
	tArray.push([
		'',
		'',
		''
	]);
	tArray.push([
		'',
		[
		build.input('range', '0.5', {
			'min': 0,
			'max': 1,
			'step': 0.001,
			'onchange': 'overlay.macroStateInbetweenRefresh("'+groupName+'");this.nextElementSibling.value=this.value;',
			'onmousemove': 'if(!event.buttons){return;};overlay.macroStateInbetweenRefresh("'+groupName+'");this.nextElementSibling.value=this.value;'
		}),
		build.input('number', '0.5', {
			'step': 0.01,
			'onchange': 'overlay.macroStateInbetweenRefresh("'+groupName+'");this.previousElementSibling.value=this.value;'
		})
		],
		''
	]);
	
	this.add(build.table(tArray));
	
	this.addButtonOk("svg.evaluateGroupInbetween("+firstValueIndex+", '"+groupName+"', overlay.content.children[0].children[0].children[1].children[0].value, overlay.content.children[0].children[0].children[0].children[0].value, overlay.content.children[0].children[0].children[2].children[0].value, parseFloat(overlay.content.children[0].children[2].children[1].children[1].value));", true);
	this.addButtonCancel(null, true);
	
	this.macroStateInbetweenRefresh(groupName, true);
	this.show();
}

overlay.prototype.macroStateInbetweenRefresh = function(groupName, hard) {
	
					// table	//tr		//td		//el
//	this.content.children[0].children[0].children[0].children[0]
	
	var states = svg.animationStates[groupName];
	
	var state1Index = parseInt(this.content.children[0].children[0].children[0].children[0].value);
	var state2Index = parseInt(this.content.children[0].children[0].children[2].children[0].value);
	var ratio = parseFloat(this.content.children[0].children[2].children[1].children[1].value);
	
	if(state1Index == null || state2Index == null || ratio == null) {
		return;
	}
	
	if(hard) {
		var state1Preview = new imageSVG(states[state1Index].element, { width: 100, height: 100 });
		var state2Preview = new imageSVG(states[state2Index].element, { width: 100, height: 100 });
		this.content.children[0].children[1].children[0].removeChildren();
		this.content.children[0].children[1].children[0].appendChild(state1Preview.container);
		this.content.children[0].children[1].children[2].removeChildren();
		this.content.children[0].children[1].children[2].appendChild(state2Preview.container);
	}
	
	var inbetween = states[state1Index].inbetween(states[state2Index], ratio);
	var inbetweenPreview = new imageSVG(inbetween.element, { width: 250, height: 250 });
	this.content.children[0].children[1].children[1].removeChildren();
	this.content.children[0].children[1].children[1].appendChild(inbetweenPreview.container);
	
}

overlay.prototype.macroExport = function() {
	this.reset();
	this.setHeader("Export file");
	
	this.add(build.p("It's advised to save your work before exporting."))
	
	
	var beginning = anigenManager.classes.editor.clock.minTime || 0;
	var duration = anigenManager.classes.editor.clock.maxTime;
	if(!duration) {
		var raw = svg.svgElement.getElementsByTagName('animate', true, true);
		var allDur = [];
		
		
		for(var i = 0; i < raw.length; i++) {
			allDur.push(raw[i].getDur().seconds);
		}
		allDur.sort();
		
		var uniqueDur = [];
		var last = null;
		for(var i = 0; i < allDur.length; i++) {
			if(last == null || last < allDur[i]) {
				last = allDur[i];
				uniqueDur.push(last);
			}
		}
		
		duration = mmc(uniqueDur);
	}
	duration -= beginning;
	duration = String(duration);
	
	var nameCheck = "";
		nameCheck += 'var dur=parseFloat(document.getElementById("anigenInputDur").value);';
		nameCheck += 'var fps=parseFloat(document.getElementById("anigenInputFramerate").value);';
		nameCheck += 'var suffix=Math.floor(fps*dur)==1 ? "."+document.getElementById("anigenSelectType").value : ".zip";';
		nameCheck += 'var filename=document.getElementById("anigenInputName");';
		nameCheck += 'if(!filename.value.match(/\\+suffix+$/)) { filename.value = filename.value.replace(/\\..*$/,"")+suffix; }';
	
	var typeSelect = build.select([
		{ 'text': "PNGs", 'value': 'png' },
		{ 'text': "Static SVGs", 'value': 'svg' }
	]);
		typeSelect.style.width = "100%";
		typeSelect.setAttribute('id', 'anigenSelectType');
		typeSelect.setAttribute('onchange', nameCheck);
	
	var name;
	if(svg.svgElement.getAttribute('inkscape:export-filename')) {
		name = svg.svgElement.getAttribute('inkscape:export-filename');
		name = name.replace(/^.*[\\\/]/, '');
	} else {
		name = svg.fileName;
	}
	name = name.replace(/\..{3,4}$/, '.zip');
	
	var nameInput = build.input('text', name, { 'id': 'anigenInputName', 'onkeyup': 'var start=this.selectionStart;var finish=this.selectionEnd;var dir=this.selectionDirection;'+nameCheck+'this.setSelectionRange(start, finish, dir);' });
	
	var ratioButton = new uiButton([ 'lock_open', 'lock' ], null, [ 'Maintain aspect ratio', 'Disregard aspect ratio' ], {'class': 'md-24', 'state': 1});
	ratioButton.setAttribute('id', 'anigenInputRatio');
	var sizeTable = build.table([[
		build.input('number', svg.svgWidth, { 'id': 'anigenInputWidth', 'min': '0', 'step': 1, 'title': 'Width (px)',
			'onchange': 'if(document.getElementById("anigenInputRatio").shepherd.state!=1){return;}document.getElementById("anigenInputHeight").value=parseInt(this.value*(svg.svgHeight/svg.svgWidth));'
		}),
		ratioButton,
		build.input('number', svg.svgHeight, { 'id': 'anigenInputHeight', 'min': '0', 'step': 1, 'title': 'Height (px)',
			'onchange': 'if(document.getElementById("anigenInputRatio").shepherd.state!=1){return;}document.getElementById("anigenInputWidth").value=parseInt(this.value*(svg.svgWidth/svg.svgHeight));'
		})
	]]);
	
	var aaSelect = build.select([
		{ 'text': "None", 'value': '1' },
		{ 'text': "2x", 'value': '2' },
		{ 'text': "4x", 'value': '4' },
		{ 'text': "8x", 'value': '8' },
		{ 'text': "16x", 'value': '16' }
	]);
		aaSelect.style.width = "100%";
		aaSelect.setAttribute('id', 'anigenSelectAA');
		aaSelect.setAttribute('title', 'Image will be rendered in larger resolution and then scaled down, potentially improving quality at the cost of rendering speed. High multipliers can lead to browser running out of memory - save your work before you export with this setting!');
	
	
	this.add(build.table([
		[ "Begin at (seconds)", build.input('number', beginning, { 'id': 'anigenInputBegin', 'min': '0', 'step': '0.1' }), build.button("←", { "onclick": "this.parentNode.previousSibling.children[0].value = "+beginning+";" }) ],
		[ "Duration (seconds)", build.input('number', duration, { 'id': 'anigenInputDur', 'min': '0', 'onkeyup': nameCheck }),
			build.button("←", { "onclick": "this.parentNode.previousSibling.children[0].value = "+duration+";" }) ],
		[ "Frames per second", build.input('number', '30', { 'id': 'anigenInputFramerate', 'min': '0', 'onkeyup': nameCheck }),
			build.button("←", { "onclick": "this.parentNode.previousSibling.children[0].value = 30;" }) ],
		[ "Export size", sizeTable,
			build.button("←", { "onclick": "document.getElementById('anigenInputWidth').value=svg.svgWidth;document.getElementById('anigenInputHeight').value=svg.svgHeight;document.getElementById('anigenInputRatio').shepherd.setState(1);" }) ],
		[ "Output name", nameInput, build.button("←", { "onclick": "this.parentNode.previousSibling.children[0].value = '"+name+"';"+nameCheck }) ],
		[ "Output type", typeSelect, "" ],
		[ "Downsampling", aaSelect, "" ]
	]));
	
	var containerMore = document.createElement('div');
		containerMore.style.paddingTop = '1em';
		containerMore.appendChild(
			new uiLink([ 'check_box_outline_blank', 'check_box' ], null, 'Crisp edges', { 'id': 'anigenCrisp', 'title': 'Overrides native anti-aliasing, creating pixel-perfect, but jagged lines.' })
		);
		containerMore.appendChild(
			new uiLink([ 'check_box_outline_blank', 'check_box' ], null, 'Unlink elements', { 'state': 1, 'id': 'anigenUnlink', 'title': 'Unlink <use> elements before rendering.' })
		);
		containerMore.appendChild(
			new uiLink([ 'check_box_outline_blank', 'check_box' ], null, 'Verbose', { 'id': 'anigenVerbose', 'title': 'Additional rendering information will be shown in the console.' })
		);
		containerMore.appendChild(
			new uiLink([ 'check_box_outline_blank', 'check_box' ], null, 'Notification', { 'id': 'anigenNotification',  'title': 'Play sound when rendering is finished.' })
		);
		containerMore.appendChild(
			new uiLink('volume_up', 'anigenActual.bell();', null, { 'title': 'Test sound.' })
		);
	
	this.add(containerMore);
	
	var okAction = '';
		okAction += "svg.export({ 'begin': parseFloat(document.getElementById('anigenInputBegin').value),";
		okAction += "'dur': parseFloat(document.getElementById('anigenInputDur').value),";
		okAction += "'fps': parseFloat(document.getElementById('anigenInputFramerate').value),";
		okAction += "'scale': { 'x': document.getElementById('anigenInputWidth').value/svg.svgWidth, 'y': document.getElementById('anigenInputHeight').value/svg.svgHeight },";
		okAction += "'format': document.getElementById('anigenSelectType').value,";
		okAction += "'filename': document.getElementById('anigenInputName').value,";
		okAction += "'downsampling': parseInt(document.getElementById('anigenSelectAA').value),";
		okAction += "'crispedges': document.getElementById('anigenCrisp').shepherd.getState() == 1, ";
		okAction += "'verbose': document.getElementById('anigenVerbose').shepherd.getState() == 1,";
		okAction += "'unlink': document.getElementById('anigenUnlink').shepherd.getState() == 1";
		okAction += "});";
	
	this.addButtonOk(okAction, true);
	this.addButtonCancel(null, true);
	
	this.show();
}

overlay.prototype.macroExportBar = function() {
	this.reset();
	this.setHeader("Exporting");
	
	var progress = new progressBar({ 'id': 'anigenProgressBar' });
	this.add(progress.container);
	
	this.addButtonCancel('svg.svgrender.pause();anigenActual.exporting = false;anigenActual.resetTitle();document.getElementById("svgArea").removeChildren();svg.forceRefresh();', true);
	
	this.show();
	return progress;
}

overlay.prototype.macroEdit = function(target) {
	if(!target) { return; }
	
	this.reset();
	this.setHeader("Edit element");
	
	var tArray = [];
	
	for(var i = 0; i < target.attributes.length; i++) {
		if(target.attributes[i].name == "style") { continue; }
		
		var tRow = [];
		
		var attrOut = {};
		if(target.attributes[i].name == 'id') { attrOut.disabled = 'disabled'; }
		var descr = svg.getAttributeDesription(target.attributes[i].name);
		if(descr) { attrOut.title = descr; }
		
		tRow.push(build.input('text', target.attributes[i].name, attrOut));
		
		tRow.push(build.button("←", { 'onclick': "this.parentNode.previousSibling.children[0].value = '"+target.attributes[i].name+"';" }));
		
		tRow.push(build.input('text', target.attributes[i].value));
		
		tRow.push(build.button("←", { 'onclick': "this.parentNode.previousSibling.children[0].value = '"+target.attributes[i].value+"';" }));
		
		attrOut = {};
		if(target.attributes[i].name == 'id') { attrOut.disabled = 'disabled'; }
		
		tRow.push(build.input('checkbox', null, attrOut));
		
		if(target.attributes[i].value[0] == '#') {
			var linkId = target.attributes[i].value.substring(1);
			tRow.push(new uiButton('link', 'overlay.hide();svg.select("'+linkId+'");', 'Select linked object', { 'class': document.getElementById(linkId) ? 'inline' : 'inline disabled' }));
		} else if(target.attributes[i].value.startsWith('url(')) {
			var linkId = target.attributes[i].value.replace(/^url\([^#]*#|[\"]?\)$/g, '');
			tRow.push(new uiButton('link', 'overlay.hide();svg.select("'+linkId+'");', 'Select linked object', { 'class': document.getElementById(linkId) ? 'inline' : 'inline disabled' }));
		}
		
		tArray.push(tRow);
	}
	
	tArray.push([ build.input('text', null, { 'title': 'New attribute' } ), "", build.input('text', null, { 'title': 'New value' } ), "", "" ]);
	
	this.add(build.table(tArray, [ "Attribute", "Revert", "Value", "Revert", "Delete" ]));
	
	
	
	tArray = [];
	
	for(var i = 0; i < target.style.length; i++) {
		var tRow = [];
		
		var attrOut = {};
		var descr = svg.getAttributeDesription(target.style[i]);
		if(descr) { attrOut.title = descr; }
		
		tRow.push(build.input('text', target.style[i], attrOut));
		
		tRow.push(build.button("←", { 'onclick': "this.parentNode.previousSibling.children[0].value = '"+target.style[i]+"';" }));
		
		tRow.push(build.input('text', target.style[target.style[i]]));
		
		//tRow.push(build.input('text', target.style[target.style[i]]));
		
		tRow.push(build.button("←", { 'onclick': "this.parentNode.previousSibling.children[0].value = '"+target.style[target.style[i]]+"';" }));
		
		tRow.push(build.input('checkbox'));
		
		if(target.style[target.style[i]][0] == '#') {
			var linkId = target.style[target.style[i]].substring(1);
			tRow.push(new uiButton('link', 'overlay.hide();svg.select("'+linkId+'");', 'Select linked object', { 'class': document.getElementById(linkId) ? 'inline' : 'inline disabled' }));
		} else if(target.style[target.style[i]].startsWith('url(')) {
			var linkId = target.style[target.style[i]].replace(/^url\([^#]*#|[\"]?\)$/g, '');
			tRow.push(new uiButton('link', 'overlay.hide();svg.select("'+linkId+'");', 'Select linked object', { 'class': document.getElementById(linkId) ? 'inline' : 'inline disabled' }));
		}
		
		tArray.push(tRow);
	}
	
	tArray.push([ build.input('text', null, { 'title': 'New CSS attribute' } ), "", build.input('text', null, { 'title': 'New value' } ), "", "" ]);
	
	this.add(build.table(tArray, [ "CSS Attribute", "Revert", "Value", "Revert", "Delete" ]));
	
	this.addButtonOk("svg.evaluateEditOverlay();");
	this.addButtonCancel();
	
	this.show();
}

overlay.prototype.test = function() {
	this.reset();
	this.setHeader("Test");
	
	this.add(new splineEditor(240, '.25 .25 .25 1', { 'move': 'console.log(this.value, ":)");' }));
	
	this.addButtonOk(null, true);

	this.show();
}


