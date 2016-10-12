/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Editor's main toolbar
 */
function infoContext() {
    this.container = document.createElement("div");
    this.container.id = "anigeninfoContext";
}

infoContext.prototype.seed = function() {
	$('#anigeninfoContext').w2toolbar({
		name: 'anigenContext',
		items: [
			{ type: 'radio', hint: 'Group selection (F1)', group: '1', id: 'toolSelect', img: 'icon-tool-select-black', checked: anigenActual.tool == 1 },
			{ type: 'radio', hint: 'Element selection (F2)', group: '1', id: 'toolPrecise', img: 'icon-tool-precise-black', checked: anigenActual.tool == 2 },
			{ type: 'radio', hint: 'Zoom (F3)', group: '1', id: 'toolMagnifier', img: 'icon-magnifier-black', checked: anigenActual.tool == 3 },
			{ type: 'radio', hint: 'Attribute picker (F7)', group: '1', id: 'toolPicker', img: 'icon-tool-picker-black', checked: anigenActual.tool == 4 },

			{ type: 'break' },

			{ type: 'menu', hint: 'Animate element', id: 'menuAnimate', img: 'icon-gear-black',
			items: [
				{id: 'translate', img: 'icon-animate-translate-black', text: 'Translate'},
				{id: 'motion', img: 'icon-animate-motion-black', text: 'Move through path'},
				{id: 'rotate', img: 'icon-animate-rotate-black', text: 'Rotate'},
				{id: 'scale', img: 'icon-animate-scale-black', text: 'Scale'},
				{id: 'skewX', img: 'icon-animate-skewx-black', text: 'Skew horizontally'},
				{id: 'skewY', img: 'icon-animate-skewy-black', text: 'Skew vertically'},
				{id: 'attribute', img: 'icon-animate-attribute-black', text: 'Animate attribute'}
			]
			},
			{ type: 'button', hint: 'Edit attributes', id: 'buttonEdit', img: 'icon-edit-black'},
			
			{ type: 'menu', hint: 'Show child nodes', id: 'menuChildren', img: 'icon-triangle-down-black', items: null },
			
			{ type: 'button', hint: 'Select parent (Alt+Up)', id: 'buttonParent', img: 'icon-triangle-up-black'},
			/*{ type: 'button', hint: 'Delete', id: 'buttonDelete', img: 'icon-trash-black'},*/

			{ type: 'break' },

			{ type: 'button', hint: 'Jump to previous keyframe (Ctrl+Left)', id: 'buttonPrevious', img: 'icon-player-previous'},
			{ type: 'button', hint: 'Jump to next keyframe (Ctrl+Right)', id: 'buttonNext', img: 'icon-player-next'},

			{ type: 'spacer' },
			
			{ type: 'check',  id: 'buttonTree', img: 'icon-tree-white', checked: false, hint: 'Show XML tree (Ctrl+Shift+X)' },
			/*
			{ type: 'check',  id: 'buttonTimeline', img: 'icon-stopwatch-white', checked: false, hint: 'Show animation timeline', disabled: true },
			*/
			{ type: 'check',  id: 'buttonAnimation', img: 'icon-hourglass-white', checked: false, hint: 'Show animation keyframes (Ctrl+Shift+K)', disabled: true },
			{ type: 'check',  id: 'buttonLayers', img: 'icon-layers-white', checked: false, hint: 'Show layers (Ctrl+Shift+L)' }
		],
		onClick: infoContext.handle
	});
};

infoContext.prototype.refresh = function() {
	var childNodes = null;
	
	/*
	if(svg.animations.length == 0) {
		if(svg.animationGroups == null) {
			w2ui['anigenContext'].disable('buttonTimeline');
			w2ui['layout'].hide('bottom', true);
		} else {
			var total = 0;
			for(var i in svg.animationGroups) {
				total += svg.animationGroups[i].length;
				if(total > 0) { break; }
			}
			if(total > 0) {
				w2ui['anigenContext'].enable('buttonTimeline');
				if(w2ui['anigenContext'].get('buttonTimeline').checked) {
					w2ui['layout'].show('bottom', true);
				}
			} else {
				w2ui['anigenContext'].disable('buttonTimeline');
				w2ui['layout'].hide('bottom', true);
			}
		}
	} else {
		w2ui['anigenContext'].enable('buttonTimeline');
		if(w2ui['anigenContext'].get('buttonTimeline').checked) {
			w2ui['layout'].show('bottom', true);
		}
	}
	*/
	
	if(svg.selected != null) {
		var prevTime, nextTime;
		if(svg.selected instanceof SVGAnimationElement) {
			prevTime = svg.selected.getPreviousTime();
			nextTime = svg.selected.getNextTime();
		} else if(svg.selected.shepherd && (svg.selected.shepherd instanceof animationGroup || svg.selected.shepherd instanceof animatedViewbox)) {
			prevTime = svg.selected.shepherd.getPreviousTime();
			nextTime = svg.selected.shepherd.getNextTime();
		}
		if(prevTime != null) {
			w2ui['anigenContext'].enable('buttonPrevious');
		} else {
			w2ui['anigenContext'].disable('buttonPrevious');
		}
		if(nextTime != null) {
			w2ui['anigenContext'].enable('buttonNext');
		} else {
			w2ui['anigenContext'].disable('buttonNext');
		}
		
		childNodes = [];
		
		for (var i = 0; i < svg.selected.children.length; i++) {
			if(svg.selected.children[i].getAttribute("anigen:lock") == 'interface') { continue; }
			if(svg.selected.children[i].getAttribute("anigen:lock") == 'skip') {
				for(var j = 0; j < svg.selected.children[i].children.length; j++) {
					childNodes.push({
						type: 'text',
						text: "<span class='nodeName'>&lt;" + svg.selected.children[i].children[j].nodeName + "&gt;</span> " + svg.selected.children[i].children[j].id,
						id: svg.selected.children[i].children[j].id
					});
				}
				continue;
			}
			svg.selected.children[i].generateId();
			childNodes.push({
				type: 'text',
				text: "<span class='nodeName'>&lt;" + svg.selected.children[i].nodeName + "&gt;</span> " + svg.selected.children[i].id,
				id: svg.selected.children[i].id
			});
		}
		
		w2ui['anigenContext'].enable('menuAnimate', 'buttonEdit', 'buttonParent');
		w2ui['anigenContext'].set('menuChildren', { items: childNodes });
		
		if(childNodes.length == 0) {
			w2ui['anigenContext'].disable('menuChildren');
		} else {
			w2ui['anigenContext'].enable('menuChildren');
		}
		
		if(svg.selected.nodeName.toLowerCase() == 'svg') {
			w2ui['anigenContext'].disable('menuAnimate', 'buttonParent');
		}
	} else {
		w2ui['anigenContext'].disable('menuAnimate', 'buttonEdit', 'select', 'buttonParent');
	}
};


// event handling
infoContext.prototype.handle = function(event) {

	switch(event.target) {
		case "toolSelect": anigenActual.tool = 1; break;
		case "toolPrecise": anigenActual.tool = 2; break;
		case "toolMagnifier": anigenActual.tool = 3; break;
		case "toolPicker": anigenActual.tool = 4; break;

		case "menuAnimate:translate": svg.createAnimation(svg.selected, 2, null, { select: true }, null); break;
		case "menuAnimate:motion": svg.createAnimation(svg.selected, 1, null, { select: true }, null); break;
		case "menuAnimate:rotate": svg.createAnimation(svg.selected, 3, null, { select: true }, null); break;
		case "menuAnimate:scale": svg.createAnimation(svg.selected, 4, null, { select: true }, null); break;
		case "menuAnimate:skewX": svg.createAnimation(svg.selected, 5, null, { select: true }, null); break;
		case "menuAnimate:skewY": svg.createAnimation(svg.selected, 6, null, { select: true }, null); break;
		case "menuAnimate:attribute": 
			var targ = document.getElementById('tb_anigenContext_item_menuAnimate');
			
			var animatable = svg.getAnimatableAttributes(svg.selected.nodeName);
			
			var optionsArray = [ ];
			for(var i = 0; i < animatable.length; i++) {
				optionsArray.push({ id: i, text: animatable[i], value: animatable[i], title: svg.getAttributeDesription(animatable[i]) });
			}
			
			popup.macroAnimateTypes(targ, svg.selected);
			break;

		case "buttonEdit": overlay.macroEdit(svg.selected); break;
		case "buttonParent": svg.select(svg.selected.getViableParent()); break;
		/*
		case "buttonDelete": 
			popup.confirmation(event.originalEvent.target, "Delete element?", "svg.delete(svg.selected)", null);
		break;
		*/

		case "buttonPrevious": 
			if(svg.selected instanceof SVGAnimationElement) {
				svg.gotoTime(svg.selected.getPreviousTime());
			} else if(svg.selected.shepherd && svg.selected.shepherd instanceof animationGroup) {
				svg.gotoTime(svg.selected.shepherd.getPreviousTime());
			}
			break;
		case "buttonNext":
			if(svg.selected instanceof SVGAnimationElement) {
				svg.gotoTime(svg.selected.getNextTime());
			} else if(svg.selected.shepherd && svg.selected.shepherd instanceof animationGroup) {
				svg.gotoTime(svg.selected.shepherd.getNextTime());
			}
			break;
		case "buttonTree": 
			w2ui['layout'].toggle('left', true);
			anigenActual.settings.set('tree', !(anigenActual.settings.get('tree')));
			break;
		case "buttonTimeline":
			w2ui['layout'].toggle('bottom', true);
			anigenActual.settings.set('timeline', !(anigenActual.settings.get('timeline')));
			break;
		case "buttonAnimation":
			windowAnimation.toggle();
			break;
		case "buttonLayers":
			windowLayers.toggle();
			break;

		default:
			if(event.target.match('menuChildren:')) {
				svg.select(document.getElementById(event.target.substr(13)));
			}
		
		/*
		event.preventDefault ? event.preventDefault() : event.returnValue = false;
		*/
	}
};