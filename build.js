/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Shorthand "constant class" for building HTML objects
 */
function build() {
	
}

build.table = function(array, headings, rowAttributes) {
	var table = document.createElement('table');
	if(headings) {
		var trh = document.createElement('tr');
		for(var i = 0; i < headings.length; i++) {
			var th = document.createElement('th');
			if(typeof headings[i] === 'string') {
				th.appendChild(document.createTextNode(headings[i]));
			} else {
				th.appendChild(headings[i]);
			}
			trh.appendChild(th);
		}
		table.appendChild(trh);
	}
	for(var i = 0; i < array.length; i++) {
		var tr = document.createElement('tr');
		for(var j = 0; j < array[i].length; j++) {
			if(array[i][j] == null) {
				var lastChild = tr.children[tr.children.length-1];
				if(lastChild.getAttribute('colspan')) {
					lastChild.setAttribute('colspan', parseInt(lastChild.getAttribute('colspan'))+1);
				} else {
					lastChild.setAttribute('colspan', '2');
				}
				continue;
			}
			var td = document.createElement('td');
			if(Array.isArray(array[i][j])) {
				for(var k = 0; k < array[i][j].length; k++) {
					if(array[i][j][k] instanceof Node) {
						td.appendChild(array[i][j][k]);
					} else {
						td.appendChild(document.createTextNode(array[i][j][k]));
					}
				}
			} else if(array[i][j] instanceof Node) {
				td.appendChild(array[i][j]);
			} else {
				td.appendChild(document.createTextNode(array[i][j]));
			}
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}
	
	if(rowAttributes) {
		for(var i = 0; i < table.children.length; i++) {
			for(var j in rowAttributes[i]) {
				table.children[i].setAttribute(j, rowAttributes[i][j]);
			}
		}
	}
	
	return table;
}

build.select = function(options, attributes) {
	var sel = document.createElement('select');
	for(var i in attributes) {
		sel.setAttribute(i, attributes[i]);
	}
	for(var i = 0; i < options.length; i++) {
		var opt = document.createElement('option');
		
		if(options[i].text) {
			opt.appendChild(document.createTextNode(options[i].text));
		} else if(options[i].value) {
			opt.appendChild(document.createTextNode(options[i].value));
		}
		
		if(options[i].value != null) { opt.setAttribute('value', options[i].value); }
		if(options[i].selected) { opt.setAttribute('selected', 'true'); }
		if(options[i].disabled) { opt.setAttribute('disabled', 'true'); }
		if(options[i].label) { opt.setAttribute('label', options[i].label); }
		if(options[i].title) { opt.setAttribute('title', options[i].title); }
		
		sel.appendChild(opt);
	}
	return sel;
}

build.button = function(text, attributes) {
	var butt = document.createElement('button');
	butt.appendChild(document.createTextNode(text));
		
	for(var i in attributes) {
		butt.setAttribute(i, attributes[i]);
	}
	return butt;	// kek
}

build.input = function(type, value, attributes) {
	var inp = document.createElement('input');
		inp.setAttribute('type', type);
	
	if(value != null) {
		if(type == 'checkbox' && value != false) {
			inp.setAttribute('checked', 'checked');
		} else {
			inp.setAttribute('value', value);
		}
	}
	
	for(var i in attributes) {
		if(i == 'label') { continue; }
		inp.setAttribute(i, attributes[i]);
	}
	
	if(type == 'checkbox' && attributes && attributes.label) {
		var label = document.createElement('label');
			label.appendChild(inp);
			label.appendChild(document.createTextNode(attributes.label));
			label.setAttribute('class', 'checkbox');
		if(attributes.title) { label.setAttribute('title', attributes.title); }
		return label;
	}
	
	return inp;
}

build.label = function(text, typeAttr, attributes) {
	var label = document.createElement('label');
	if(typeAttr) { label.setAttribute('for', typeAttr); }
	label.appendChild(document.createTextNode(text));
	
	for(var i in attributes) {
		label.setAttribute(i, attributes[i]);
	}
	return label;
}

build.img = function(src, alt, attributes) {
	var img = document.createElement('img');
		img.setAttribute('src', src);
	
	for(var i in attributes) {
		img.setAttribute(i, attributes[i]);
	}
	return img;
}

build.p = function(input) {
	var p = document.createElement('p');
	if(typeof input === 'string') {
		p.appendChild(document.createTextNode(input));
	} else if(Array.isArray(input)) {
		for(var i = 0; i < input.length; i++) {
			if(typeof input[i] === 'string') {
				p.appendChild(document.createTextNode(input[i]));
			} else {
				p.appendChild(input[i]);
			}
		}
	} else {
		p.appendChild(input);
	}
	return p;
}

build.strong = function(text) {
	var strong = document.createElement("strong");
	if(typeof text === "string") {
		strong.appendChild(document.createTextNode(text));
	} else {
		strong.appendChild(text);
	}
	return strong;
}

build.a = function(text, href, attributes) {
	var a = document.createElement('a');
		a.setAttribute('href', href);
	a.appendChild(document.createTextNode(text));
	
	for(var i in attributes) {
		a.setAttribute(i, attributes[i]);
	}
	return a;
}

build.br = function() {
	return document.createElement("br");
}

build.h = function(text, level, attributes) {
	if(!level || isNaN(level) || level <= 0 || level > 6) { level = 1; }
	var h = document.createElement('h'+level);
	h.appendChild(document.createTextNode(text));
	for(var i in attributes) {
		h.setAttribute(i, attributes[i]);
	}
	return h;
}

build.icon = function(picture) {
	var span = document.createElement("span");
	span.addClass("w2ui-icon");
	span.addClass("icon-"+picture);
	return span;
}

build.slider = function(value, attributes, numericInput, soft) {
	if(numericInput) {
		var attrInput = { 'onchange': 'this.previousElementSibling.value = this.value;' };
		if(attributes.onchange) { attrInput.onchange += attributes.onchange; }			
		if(attributes && attributes.min && !soft) { attrInput.min = attributes.min; }
		if(attributes && attributes.max && !soft) { attrInput.max = attributes.max; }
		if(attributes && attributes.step) { attrInput.step = attributes.step; }
		
		var field = build.input('number', value, attrInput);
		
		if(attributes.onchange) {
			attributes.onchange = 'this.nextElementSibling.value = this.value;' + attributes.onchange;
		} else {
			attributes.onchange = 'this.nextElementSibling.value = this.value;';
		}
		if(attributes.onmousemove) {
			attributes.onmousemove = 'if(!event.buttons){return;};this.nextElementSibling.value = this.value;' + attributes.onmousemove;
		} else {
			attributes.onmousemove = 'if(!event.buttons){return;};this.nextElementSibling.value = this.value;';
		}
		
		var slider = build.input('range', value, attributes);
		
		
		var container = document.createElement('span');
		container.setAttribute('class', 'slider');
		container.appendChild(slider);
		container.appendChild(field);
		return container;
	} else {
		return build.input('range', value, attributes);
	}
}

