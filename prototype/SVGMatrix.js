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

// or "initial viewport"
SVGMatrix.prototype.toViewport = function(x, y) {
	var vector = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
	vector.e = x;
	vector.f = y;
	var out = this.multiply(vector);
	return { x: out.e, y: out.f };
}

// or "element's userspace"
SVGMatrix.prototype.toUserspace = function(x, y) {
	var vector = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
	vector.e = x;
	vector.f = y;
	var out = this.inverse().multiply(vector);
	return { x: out.e, y: out.f };
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
