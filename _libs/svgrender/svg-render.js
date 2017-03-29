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
    this.canvas = (options.canvas || document.createElement('canvas'));

	/**
     * DIV in document to put individual SVG frames in, so they can be rendered properly by browser
     * @type {HTMLCanvasElement}
     * @private
     */
    this.svgArea = options.svgArea;
	if(!this.svgArea) {
		this.svgArea = document.createElement('div');
		this.svgArea.style.display = 'none';
		document.body.appendChild(this.svgArea);
		// cleanup?
	}
	
	/**
	 * Format ('png' or 'svg' for static SVGs)
	 */
	this.format = options.format || 'png';
	
	/**
	 * Downsampling
	 */
	this.downsampling = (options.downsampling || 1);
	if(this.format == 'svg') { this.downsampling = 1; }
	
	/**
	 * Verbose mode
	 */
	this.verbose = (options.verbose || false);
	
	
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
	
	clone.setAttribute('width', parseFloat(clone.getAttribute('width'))*this.downsampling);
	clone.setAttribute('height', parseFloat(clone.getAttribute('height'))*this.downsampling);
	
	
	while(this.svgArea.children[0]) { this.svgArea.removeChild(this.svgArea.children[0]); }
	this.svgArea.appendChild(clone);
	clone.setCurrentTime(this.SVGtime / 1000);
	clone.consumeAnimations(true);

	var svgString = (new XMLSerializer()).serializeToString(clone);
	clone.parentNode.removeChild(clone);
	
	this.startTime = + new Date();
	
	if(this.format == 'svg') {
		if (this.progressSignal && typeof this.progressSignal === "function") {
            this.progressSignal(this.imagesDoneCount, this.imagesCount, this.beginTime);
        }

        this.images[this.imagesDoneCount++] = svgString;
        if (this.imagesDoneCount < this.imagesCount) {
            this.nextFrame = setTimeout(this.renderNextFrame.bind(this), 0);
        } else {
            this.finished = true;
            this.callback(this.format);
        }
		
		if(this.verbose) {
			console.log('Rendering time: ' + ((+ new Date())-this.startTime) + ' ms');
			this.startTime = + new Date();
		}
		return;
	}

    this.svgImage = new Image();
    this.svgImage.onload = function () {
        tmpCanvasx = this.canvas.getContext('2d');
        this.canvas.width = this.svgImage.width;
        this.canvas.height = this.svgImage.height;
        tmpCanvasx.clearRect(0, 0, this.svgImage.width, this.svgImage.height);
        //tmpCanvasx.drawImage(this.svgImage, 0, 0);
		
		var ds = this.downsampling;
		var currentWidth = this.svgImage.width;
		var currentHeight = this.svgImage.height;
		
		tmpCanvasx.drawImage(this.svgImage, 0, 0, Math.round(currentWidth), Math.round(currentHeight));
		
		if(ds > 1) {
			while(ds > 1) {
				this.canvas = this.downScaleCanvas(this.canvas, 0.5);
				ds *= 0.5;
			}
		}
		
		//tmpCanvasx.drawImage(this.svgImage, 0, 0, Math.round(this.svgImage.width/this.downsampling), Math.round(this.svgImage.height/this.downsampling));
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
            this.callback(this.format);
        }
		
		if(this.verbose) {
			console.log('Rendering time: ' + ((+ new Date())-this.startTime) + ' ms');
			this.startTime = + new Date();
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

// courtesy of stackoverflow
// scales the canvas by (float) scale < 1
// returns a new canvas containing the scaled image.
SVGRender.prototype.downScaleCanvas = function(cv, scale) {
    if (!(scale < 1) || !(scale > 0)) throw ('scale must be a positive number <1 ');
    var sqScale = scale * scale; // square scale = area of source pixel within target
    var sw = cv.width; // source image width
    var sh = cv.height; // source image height
    var tw = Math.floor(sw * scale); // target image width
    var th = Math.floor(sh * scale); // target image height
    var sx = 0, sy = 0, sIndex = 0; // source x,y, index within source array
    var tx = 0, ty = 0, yIndex = 0, tIndex = 0; // target x,y, x,y index within target array
    var tX = 0, tY = 0; // rounded tx, ty
    var w = 0, nw = 0, wx = 0, nwx = 0, wy = 0, nwy = 0; // weight / next weight x / y
    // weight is weight of current source point within target.
    // next weight is weight of current source point within next target's point.
    var crossX = false; // does scaled px cross its current px right border ?
    var crossY = false; // does scaled px cross its current px bottom border ?
    var sBuffer = cv.getContext('2d').
    getImageData(0, 0, sw, sh).data; // source buffer 8 bit rgba
    var tBuffer = new Float32Array(3 * tw * th); // target buffer Float32 rgb
    var sR = 0, sG = 0,  sB = 0; // source's current point r,g,b
    /* untested !
    var sA = 0;  //source alpha  */    

    for (sy = 0; sy < sh; sy++) {
        ty = sy * scale; // y src position within target
        tY = 0 | ty;     // rounded : target pixel's y
        yIndex = 3 * tY * tw;  // line index within target array
        crossY = (tY != (0 | ty + scale)); 
        if (crossY) { // if pixel is crossing botton target pixel
            wy = (tY + 1 - ty); // weight of point within target pixel
            nwy = (ty + scale - tY - 1); // ... within y+1 target pixel
        }
        for (sx = 0; sx < sw; sx++, sIndex += 4) {
            tx = sx * scale; // x src position within target
            tX = 0 |  tx;    // rounded : target pixel's x
            tIndex = yIndex + tX * 3; // target pixel index within target array
            crossX = (tX != (0 | tx + scale));
            if (crossX) { // if pixel is crossing target pixel's right
                wx = (tX + 1 - tx); // weight of point within target pixel
                nwx = (tx + scale - tX - 1); // ... within x+1 target pixel
            }
            sR = sBuffer[sIndex    ];   // retrieving r,g,b for curr src px.
            sG = sBuffer[sIndex + 1];
            sB = sBuffer[sIndex + 2];

            /* !! untested : handling alpha !!
               sA = sBuffer[sIndex + 3];
               if (!sA) continue;
               if (sA != 0xFF) {
                   sR = (sR * sA) >> 8;  // or use /256 instead ??
                   sG = (sG * sA) >> 8;
                   sB = (sB * sA) >> 8;
               }
            */
            if (!crossX && !crossY) { // pixel does not cross
                // just add components weighted by squared scale.
                tBuffer[tIndex    ] += sR * sqScale;
                tBuffer[tIndex + 1] += sG * sqScale;
                tBuffer[tIndex + 2] += sB * sqScale;
            } else if (crossX && !crossY) { // cross on X only
                w = wx * scale;
                // add weighted component for current px
                tBuffer[tIndex    ] += sR * w;
                tBuffer[tIndex + 1] += sG * w;
                tBuffer[tIndex + 2] += sB * w;
                // add weighted component for next (tX+1) px                
                nw = nwx * scale
                tBuffer[tIndex + 3] += sR * nw;
                tBuffer[tIndex + 4] += sG * nw;
                tBuffer[tIndex + 5] += sB * nw;
            } else if (crossY && !crossX) { // cross on Y only
                w = wy * scale;
                // add weighted component for current px
                tBuffer[tIndex    ] += sR * w;
                tBuffer[tIndex + 1] += sG * w;
                tBuffer[tIndex + 2] += sB * w;
                // add weighted component for next (tY+1) px                
                nw = nwy * scale
                tBuffer[tIndex + 3 * tw    ] += sR * nw;
                tBuffer[tIndex + 3 * tw + 1] += sG * nw;
                tBuffer[tIndex + 3 * tw + 2] += sB * nw;
            } else { // crosses both x and y : four target points involved
                // add weighted component for current px
                w = wx * wy;
                tBuffer[tIndex    ] += sR * w;
                tBuffer[tIndex + 1] += sG * w;
                tBuffer[tIndex + 2] += sB * w;
                // for tX + 1; tY px
                nw = nwx * wy;
                tBuffer[tIndex + 3] += sR * nw;
                tBuffer[tIndex + 4] += sG * nw;
                tBuffer[tIndex + 5] += sB * nw;
                // for tX ; tY + 1 px
                nw = wx * nwy;
                tBuffer[tIndex + 3 * tw    ] += sR * nw;
                tBuffer[tIndex + 3 * tw + 1] += sG * nw;
                tBuffer[tIndex + 3 * tw + 2] += sB * nw;
                // for tX + 1 ; tY +1 px
                nw = nwx * nwy;
                tBuffer[tIndex + 3 * tw + 3] += sR * nw;
                tBuffer[tIndex + 3 * tw + 4] += sG * nw;
                tBuffer[tIndex + 3 * tw + 5] += sB * nw;
            }
        } // end for sx 
    } // end for sy

    // create result canvas
    var resCV = document.createElement('canvas');
    resCV.width = tw;
    resCV.height = th;
    var resCtx = resCV.getContext('2d');
    var imgRes = resCtx.getImageData(0, 0, tw, th);
    var tByteBuffer = imgRes.data;
    // convert float32 array into a UInt8Clamped Array
    var pxIndex = 0; //  
    for (sIndex = 0, tIndex = 0; pxIndex < tw * th; sIndex += 3, tIndex += 4, pxIndex++) {
        tByteBuffer[tIndex] = Math.ceil(tBuffer[sIndex]);
        tByteBuffer[tIndex + 1] = Math.ceil(tBuffer[sIndex + 1]);
        tByteBuffer[tIndex + 2] = Math.ceil(tBuffer[sIndex + 2]);
        tByteBuffer[tIndex + 3] = 255;
    }
    // writing result to canvas.
    resCtx.putImageData(imgRes, 0, 0);
    return resCV;
}


/**
 * Is render in progress?
 * @returns {undefined}
 */
SVGRender.prototype.isActive = function () {
    return !(this.finished);
};



