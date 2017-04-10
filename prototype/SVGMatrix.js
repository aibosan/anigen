/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Prototypes for SVG matrix object
 */
 
// rounds values to prevent floating point errors
SVGMatrix.prototype.round = function() {
	this.e = Math.floor(this.e*1000)/1000;
	this.f = Math.floor(this.f*1000)/1000;
}

SVGMatrix.prototype.toString = function() {
	return "matrix("+this.a+" "+this.b+" "+this.c+" "+this.d+" "+this.e+" "+this.f+")";
}

SVGMatrix.prototype.multiplyMatrix = SVGMatrix.prototype.multiply;

SVGMatrix.prototype.multiply = function() {
	if(arguments.length == 0 || (arguments.length == 1 && arguments[0] instanceof SVGMatrix)) {
		return this.multiplyMatrix(arguments[0]);
	}
	
	if(arguments.length == 1) {
		if(Array.isArray(arguments[0])) {
			if((typeof arguments[0][0] !== 'number') || (typeof arguments[0][1] !== 'number')) {
				throw new TypeError("Failed to execture 'multiply' on 'SVGMatrix': parameter 1 is not of supported type; 'SVGMatrix', Array with two numbers, or any Object with numeric 'x' and 'y' attributes.");
			}
			return { 
				'x': arguments[0][0]*this.a+arguments[0][1]*this.c+this.e,
				'y': arguments[0][0]*this.b+arguments[0][1]*this.d+this.f
			};
		}
		if(arguments[0].x != null && arguments[0].y != null) {
			if((typeof arguments[0].x !== 'number') || (typeof arguments[0].y !== 'number')) {
				throw new TypeError("Failed to execture 'multiply' on 'SVGMatrix': parameter 1 is not of supported type; 'SVGMatrix', Array with two numbers, or any Object with numeric 'x' and 'y' attributes.");
			}
			return { 
				'x': arguments[0].x*this.a+arguments[0].y*this.c+this.e,
				'y': arguments[0].x*this.b+arguments[0].y*this.d+this.f
			};
		}
		throw new TypeError("Failed to execture 'multiply' on 'SVGMatrix': parameter 1 is not of supported type; 'SVGMatrix', Array with two numbers, or any Object with numeric 'x' and 'y' attributes.");
	} else {
		if((typeof arguments[0] !== 'number') || (typeof arguments[1] !== 'number')) {
			throw new TypeError("Failed to execture 'multiply' on 'SVGMatrix': parameter 1 is not of supported type; 'SVGMatrix', Array with two numbers, or any Object with numeric 'x' and 'y' attributes.");
		}
		return { 
			'x': arguments[0]*this.a+arguments[1]*this.c+this.e,
			'y': arguments[0]*this.b+arguments[1]*this.d+this.f
		};
	}
}

// or "initial viewport"
// for given (x,y) vector, returns (M x (x,y))
SVGMatrix.prototype.toViewport = SVGMatrix.prototype.multiply;

// or "element's userspace"
// for given (x,y) vector, returns (M^-1 x (x,y))
SVGMatrix.prototype.toUserspace = function(x, y) {
	return this.inverse().multiply(x,y);
}

SVGMatrix.prototype.deltaTransformPoint = function(point) {
	var dx = point.x * this.a + point.y * this.c + 0;
    var dy = point.x * this.b + point.y * this.d + 0;
    return { x: dx, y: dy };
}

SVGMatrix.prototype.decompose = function() {
    // calculate delta transform point
    var px = this.deltaTransformPoint({ x: 0, y: 1 });
    var py = this.deltaTransformPoint({ x: 1, y: 0 });

    // calculate skew
    var skewX = ((180 / Math.PI) * Math.atan2(px.y, px.x) - 90);
    var skewY = ((180 / Math.PI) * Math.atan2(py.y, py.x));

    return {
        translateX: this.e,
        translateY: this.f,
        scaleX: Math.sqrt(this.a * this.a + this.b * this.b),
        scaleY: Math.sqrt(this.c * this.c + this.d * this.d),
        skewX: skewX,
        skewY: skewY,
        rotation: skewX // rotation is the same as skew x
    }
}

SVGMatrix.prototype.isIdentity = function() {
	if(this.a == 1 && this.b == 0 && this.c == 0 && this.d == 1 && this.e == 0 && this.f == 0) { return true; }
	return false;
}
