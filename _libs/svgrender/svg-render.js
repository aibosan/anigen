/* 
 * @copyright Adam Benda, 2016
 * 
 */


/* global Blob, File, SVGSVGElement, EventTarget */

/**
 * @classdesc SVG Rendering library
 * @class
 */
var SVGRender = function () {


};
/**
 * Loads one SVG image from various source.
 * Will wipe out previously loaded image
 * @param {SVGSVGElement |  Blob | File | String} svg - svg element or its source
 * @returns {undefined}
 * 
 * @public
 **/
SVGRender.prototype.load = function (svg) {
    /**
     * Loading from a file is asynchronous = do not call render() untill file is loaded.
     * @type {Boolean}
     * @private
     */
    this.loaded = false;
    /**
     * Signalizes that computation was interrupted/paused
     * @type Boolean
     */
    this.interrupted = false;
    /**
     * Signalizes that computation finished sucessfully
     * @type Boolean
     */
    this.finished = false;
    if (Blob.prototype.isPrototypeOf(svg) || File.prototype.isPrototypeOf(svg)) {
//to be read with FileReader
        if (!svg.type || svg.type !== "image/svg+xml") {
            throw "Wrong file/blob type, should be image/svg+xml, is " + svg.type;
        }

        /**
         * File reader of input File / Blob
         * @type {FileReader}
         * @private
         */
        this.reader = new FileReader();
        this.reader.readAsDataURL(svg);
        this.reader.onload = function () {
            //File was loaded from input to dataURI

            //http://stackoverflow.com/questions/11335460/how-do-i-parse-a-data-url-in-node
            var svgCodeB64 = this.reader.result;
            var regex = /^data:.+\/(.+);base64,(.*)$/;
            var matches = svgCodeB64.match(regex);
            var data = matches[2];
            var svgCode = atob(data);
            this.load.bind(this)(svgCode);
            //Call load function again - but with svg source loaded from file
            return;
        }.bind(this);
        return;
    } else if (typeof svg === "string") {
        //svg xml code
        var svgCode = svg;
        //var svgCode = this.result.replace(/<?xml[^>]*/,"").replace(/<!DOCTYPE[^>]*/,"");

        //We are using document from global namespace
        //todo: cleanup afterwards
        this.svgDivElement = document.createElement('div');
        this.svgDivElement.innerHTML = svgCode;
        var svgElement = this.svgDivElement.children[0];
        document.body.appendChild(this.svgDivElement);
        this.svgDivElement.style.visibility = 'hidden';
        this.load(svgElement);
        return;
    } else if (SVGSVGElement.prototype.isPrototypeOf(svg)) {

        /**
         * SVG element present in document.
         * @type {SVGSVGElement}
         * @private
         */
        this.svgElement = svg;
        this.loaded = true;
        return;
    } else {
        throw "Unknown svg type in svg-render!";
    }
};
/**
 * Start rendering
 * @param {Object} options - contains numbers FPS, time, imagesCount and function progressSignal
 * @param {function} callback
 * @returns {undefined}
 * 
 * @public
 */
SVGRender.prototype.render = function (options, callback) {
    if (!options) {
        options = {};
    }
	
	this.beginTime = new Date();
	
    /**
     * Will be called after rendering is finished
     * @type {function}
     */
    this.callback = callback;
    if (!this.callback) {
        this.callback = function () {};
    }

    if (!this.loaded) {
        //todo: more elegant solution
        setTimeout(this.render.bind(this, options, callback), 100);
        return;
    }

    /**
     * Function to be called repeatedly when frame is rendered.
     * has two parameters; count(total #frames) and doneCount(#frames rendered) 
     * @type {function}
     * @private
     */
    this.progressSignal = (options.progressSignal || function () {});
    /**
     * begin time (seconds)
     * @type {number}
     * @private
     */
    this.beginMS = (options.begin * 1000 || 0); //default begin time


    /**
     * Frames per Second
     * @type {number}
     * @private
     */
    this.FPS = (options.FPS || 60); //default FPS


    /**
     * total time in miliseconds
     * @type {number}
     * @private
     */
    this.timeMS = (options.time * 1000 || 1000);
    /**
     * Number of frames to render
     * @type {number}
     * @private
     */
    this.imagesCount = Math.round(this.FPS * this.timeMS / 1000);
    if (options.imagesCount && options.imagesCount !== this.imagesCount) {
        //imagesCount was given
        if (options.time && options.FPS) {
            //FPS+time were also given and the tree given parameters are contradicting
            throw "Conflicting parameters FPS,time,imagesCount";
        } else if (options.time) {
            this.FPS = this.imagesCount * 1000 / this.timeMS;
        } else if (options.FPS) {
            this.timeMS = this.imagesCount * 1000 / this.FPS;
        }
    }

    /**
     * Time in miliseconds from the animation start time.
     * @type {int}
     * @private
     */
    this.SVGtime = 0; //in miliseconds

    /**
     * Number of already rendered images
     * @type {int}
     * @public
     */
    this.imagesDoneCount = 0;
    /**
     * Array of all rendered images in png format
     * @type {base64}
     * @public
     */
    this.images = [];
    /**
     * Array of all rendered images in png format
     * @type {number}
     * @private
     */
    this.nextFrame = setTimeout(this.renderNextFrame.bind(this), 0);
    /**
     * Canvas to draw on (optional - drawing is invisible if not provided)
     * @type {HTMLCanvasElement}
     * @private
     */
    this.canvas = (options.canvas || document.createElement('canvas')); //default begin time

};

/**
 * Goes through DOM tree of given HTMLElement and removes specific tags 
 * @param {HTMLElement} htmlElement
 * @param {String[]} tags
 * @return {integer} - number of elements removed
 * 
 * @private
 */
SVGRender.prototype.filterOut = function (htmlElement, tags, lvl) {
    var ret = 0;
    var lvlString = "";
    for (var i = 0; i < lvl; i++) {
        lvlString += " ";
    }
    for (var i = 0; i < htmlElement.childNodes.length; i++) {
        if (tags.indexOf(htmlElement.childNodes[i].tagName) >= 0) {
            htmlElement.removeChild(htmlElement.childNodes[i]);
            ret++;
            i = -1;
        } else {
            //call filterOut recursively
            ret += this.filterOut(htmlElement.childNodes[i], tags, lvl + 1);
        }
    }
    return ret;
};

/**
 * Render next frame and schedule next run of render next frame
 * @returns {undefined}
 * @private
 */
SVGRender.prototype.renderNextFrame = function () {
    if (!this.svgElement) {
        throw "Cannot render - no svgElement loaded!";
    }

    if (this.interrupted) {
        //rendering was stopped
        //(this.nextFrame timeout should have been removed already!)
//        throw "this.nextFrame timeout should have been removed already!";
        return;
    }


    this.SVGtime = this.beginMS + Math.round(1000 * this.imagesDoneCount) / (this.FPS);
    
	var clone = this.svgElement.cloneNode(true);
	this.svgElement.parentNode.appendChild(clone);
	clone.setCurrentTime(this.SVGtime / 1000);
	clone.consumeAnimations(true);

	var svgString = (new XMLSerializer()).serializeToString(clone);
	clone.parentNode.removeChild(clone);
	

    this.svgImage = new Image();
    this.svgImage.onload = function () {

        tmpCanvasx = this.canvas.getContext('2d');
        this.canvas.width = this.svgImage.width;
        this.canvas.height = this.svgImage.height;
        tmpCanvasx.clearRect(0, 0, this.svgImage.width, this.svgImage.height);
        tmpCanvasx.drawImage(this.svgImage, 0, 0);
        //image now in tmpCanvas

        //signalize progress 
        if (this.progressSignal && typeof this.progressSignal === "function") {
            this.progressSignal(this.imagesDoneCount, this.imagesCount, this.beginTime);
        }

        this.images[this.imagesDoneCount++] = this.canvas.toDataURL("image/png").replace(/^data:.+\/(.+);base64,/, "");
        if (this.imagesDoneCount < this.imagesCount) {
            this.nextFrame = setTimeout(this.renderNextFrame.bind(this), 0);
        } else {
            this.finished = true;
            this.callback();
        }
    }.bind(this);
    this.svgImage.src = "data:image/svg+xml;base64," + btoa("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n\
        <!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">" + unescape(encodeURIComponent(svgString)));
};
/**
 * Pause rendering
 * @returns {undefined}
 */
SVGRender.prototype.pause = function () {
    this.interrupted = true;
    clearTimeout(this.nextFrame);
    this.nextFrame = null;
};
/**
 * Resumes rendering
 * @returns {undefined}
 */
SVGRender.prototype.resume = function () {
    if (this.finished || !this.interrupted) {
        //not needed
        return;
    }

    this.interrupted = false;
    if (!this.nextFrame) {
        //next frame is not scheduled
        this.nextFrame = setTimeout(this.renderNextFrame.bind(this), 0);
    }
};



SVGElement.prototype.consumeAnimations = SVGElement.prototype.consumeAnimations || function(recursive) {
	var candidates = [];
	for(var i = 0; i < this.children.length; i++) {
		if(this.children[i] instanceof SVGAnimationElement) {
			candidates.push(this.children[i]);
		}
	}
	
	var transform = this.getTransform();
	
	for(var i = 0; i < candidates.length; i++) {
		if(candidates[i] instanceof SVGAnimateTransformElement) {
			this.removeChild(candidates[i]);
			continue;
		}
		if(candidates[i] instanceof SVGAnimateMotionElement) {
			this.removeChild(candidates[i]);
			continue;
		}
		if(candidates[i] instanceof SVGAnimateElement) {
			var attr = candidates[i].getAttribute('attributeName');
			
			var val = candidates[i].getCurrentValue();
			if(val) {
				// indicates XML animation
				this.setAttribute(attr, val);
			} else {
				// CSS style
				var styles = window.getComputedStyle(this);
				if(styles[attr] != null) {
					// exists in styles
					this.style[attr] = styles[attr];
				}
			}
			this.removeChild(candidates[i]);
			continue;
		}
	}
	
	if(transform) {
		this.setAttribute('transform', transform);
	}
	
	if(recursive) {
		for(var i = 0; i < this.children.length; i++) {
			if(!(this.children[i] instanceof SVGAnimationElement)) {
				this.children[i].consumeAnimations(recursive);
			}
		}
	}
}

SVGElement.prototype.getTransform = SVGElement.prototype.getTransform || function() {
	if(!(typeof this.getCTM === 'function')) {
		return null;
	}
	if(!this.parentNode || !(typeof this.parentNode.getCTM === 'function')) {
		return this.getCTM();
	}
	
	return this.parentNode.getCTM().inverse().multiply(this.getCTM());
}

SVGAnimationElement.prototype.getCTM = SVGAnimationElement.prototype.getCTM || function() {
	if(this.parentNode && typeof this.parentNode.getCTM === 'function') {
		return this.parentNode.getCTM();
	} else {
		return null;
	}
}

SVGMatrix.prototype.toString = function () {
    return "matrix(" + this.a + " " + this.b + " " + this.c + " " + this.d + " " + this.e + " " + this.f + ")";
};


/**
 * Gets value of XML attribute this animation imposes upon its parent, or null if it's CSS
 * @param Number time
 * @returns {String|Object}
 */
SVGAnimationElement.prototype.getCurrentValue = SVGAnimationElement.prototype.getCurrentValue || function(time) {
	if(this.getAttribute('attributeName') == 'd') {
		var progress = this.getCurrentProgress(time);
		var times = this.getAttribute('keyTimes').split(';');
		var values = this.getAttribute('values').split(';');
		
		var timeBefore, timeAfter;
		var before, after;
		
		if(progress == null) {
			return null;
		}
		
		for(var i = 0; i < times.length; i++) {
			if(parseFloat(times[i]) == progress) {
				timeBefore = progress;
				before = i;
				break;
			} else if(parseFloat(times[i]) < progress) {
				timeBefore = parseFloat(times[i]);
				before = i;
			} else if(timeAfter == null) {
				timeAfter = parseFloat(times[i]);
				after = i;
				break;
			}
		}
		
		if(timeBefore == progress) {
			var temp = document.createElementNS("http://www.w3.org/2000/svg", "path");
				temp.setAttribute('d', values[before]);
			return temp.getPathData().baseVal;
		}
		
		if(after == null) {
			if(this.getAttribute('fill') == 'freeze') {
				var temp = document.createElementNS("http://www.w3.org/2000/svg", "path");
					temp.setAttribute('d', values[before]);
				return temp.getPathData().baseVal;
			} else {
				return null;
			}
			
		}
		
		var ratio = (progress-timeBefore)/(timeAfter-timeBefore);
		
		var pathBefore = document.createElementNS("http://www.w3.org/2000/svg", "path");
		var pathAfter = document.createElementNS("http://www.w3.org/2000/svg", "path");
		
		pathBefore.setAttribute('d', values[before]);
		pathAfter.setAttribute('d', values[after]);
		
		var splines = this.getSplines();
		
		if(splines && splines[before]) {
			ratio = splines[before].getValue(ratio);
		}
		
		return pathBefore.inbetween(pathAfter, ratio);
		
	} else {
		try {
			return this.parentNode[this.getAttribute('attributeName')].animVal.value;
		} catch(e) {
			return null;
		}
	}
}


// obsolete
SVGRender.prototype.importStyle = function (el, data) {
    if (!data) {
        return;
    }

    var matrix = this.svgElement.createSVGMatrix();

    if (data.ctm !== undefined) {
        matrix = matrix.multiply(data.ctm);
    }

    if (data.transform !== undefined) {
        matrix = matrix.multiply(data.transform);
    }


    el.setAttribute('transform', matrix);

    for (var i = 0; i < el.children.length; i++) {
        //recursive
        this.importStyle(el.children[i], data.children[i]);
    }

     for (var n = 0; n < data.value.length; n++) {
     el.style.setProperty(data.value[n].name,
     data.value[n].value,
     data.value[n].priority
     );
     }
};

// obsolete
/**
 * Deep-copy element (recursive)
 * @param {Array|String|Number|Boolean|Object} src
 * @returns {Array|String|Number|Boolean|Object}
 */
SVGRender.prototype.deepCopy = function (src) {
    var dst;
    if (Array.isArray(src)) {
        dst = [];
        for (var i = 0; i < src.length; i++) {
            dst[i] = this.deepCopy(src[i]);
        }
    } else if (typeof (src) === "string" || typeof (src) === "number" || typeof (src) === "boolean") {
        return src;
    } else if (typeof (src) === "function") {
        return null;
    } else if (typeof (src) === "object") {
        dst = {};
        for (var at in src) {
            dst[at] = this.deepCopy(src[at]);
        }
    } else {
        throw "deepCopy unknown ";
    }

    return dst;
};

// obsolete
/**
 * Is render in progress?
 * @returns {undefined}
 */
SVGRender.prototype.isActive = function () {
    return !(this.finished);
};

// obsolete
SVGElement.prototype.getTransformAnim = function () {
    var matrix = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
    if (!this.transform || !this.transform.animVal) {
        return matrix;
    }
    for (var i = 0; i < this.transform.animVal.length; i++) {
        matrix = matrix.multiply(this.transform.animVal[i].matrix);
    }
    return matrix;
};





