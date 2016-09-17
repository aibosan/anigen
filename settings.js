/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Holds and handles aniGen settings
 */
function settings() {
	this.data = {
		'tree':	false,
		'timeline': false,
		'keyframes': false,
		'layers': false,
		
		'windowsWidth': 256,
		'treeWidth': 256,
		'timelineHeight': 96
	}
	
	this.loadData = function() {
		var data = getData('anigenSettings');
		if(!data) { return; }
		data = data.split(';');
		
		this.data.tree = data[0] && data[0] != '0' ? true : false;
		this.data.timeline = data[1] && data[1] != '0' ? true : false;
		this.data.keyframes = data[2] && data[2] != '0' ? true : false;
		this.data.layers = data[3] && data[3] != '0' ? true : false;
		
		this.data.windowsWidth = parseInt(data[4]);
		this.data.treeWidth = parseInt(data[5]);
		this.data.timelineHeight = parseInt(data[6]);
		
		if(this.data.windowsWidth > window.innerWidth/2) { this.data.windowsWidth = window.innerWidth/2; }
		if(this.data.treeWidth > window.innerWidth/2) { this.data.treeWidth = window.innerWidth/2; }
		if(this.data.timelineHeight > window.innerHeight/2) { this.data.timelineHeight = window.innerHeight/2; }
	};
	
	this.saveData = function() {
		var serialized = [
			(this.data.tree ? '1' : '0'),
			(this.data.timeline ? '1' : '0'),
			(this.data.keyframes ? '1' : '0'),
			(this.data.layers ? '1' : '0'),
			
			this.data.windowsWidth,
			this.data.treeWidth,
			this.data.timelineHeight
		];
			
		setData('anigenSettings', serialized.join(';'));
	};
	
	this.get = function(data) {
		return this.data[data];
	};
	
	this.set = function(data, value) {
		this.data[data] = value;
		this.saveData();
	};
	
	this.apply = function() {
		if(this.data.tree) { 
			w2ui['layout'].show('left', true);
			w2ui['anigenContext'].check('buttonTree');
		} else {
			w2ui['layout'].hide('left', true);
			w2ui['anigenContext'].uncheck('buttonTree');
		}
		
		if(this.data.timeline) { 
			w2ui['layout'].show('bottom', true);
			w2ui['anigenContext'].check('buttonTimeline');
		} else {
			w2ui['layout'].hide('bottom', true);
			w2ui['anigenContext'].uncheck('buttonTimeline');
		}
		
		var keyframesDisabled = w2ui['anigenContext'].get('buttonAnimation').disabled;
		w2ui['anigenContext'].enable('buttonAnimation');
		
		if(this.data.keyframes) { 
			windowAnimation.show();
			w2ui['anigenContext'].check('buttonAnimation');
		} else {
			windowAnimation.hide();
			w2ui['anigenContext'].uncheck('buttonAnimation');
		}
		
		if(keyframesDisabled) {
			w2ui['anigenContext'].disable('buttonAnimation');
		}
		
		if(this.data.layers) { 
			windowLayers.show();
			w2ui['anigenContext'].check('buttonLayers');
		} else {
			windowLayers.hide();
			w2ui['anigenContext'].uncheck('buttonLayers');
		}
		
		w2ui['layout'].sizeTo('right', this.data.windowsWidth);
		w2ui['layout'].sizeTo('left', this.data.treeWidth);
		w2ui['layout'].sizeTo('bottom', this.data.timelineHeight);
	};

}