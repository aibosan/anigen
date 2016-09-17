/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Formula functions, mostly for splines calculation
 */
 
function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
}
 
 
function bezierCoeffs(P0,P1,P2,P3) {
	var Z = Array();
	Z[0] = -P0 + 3*P1 + -3*P2 + P3; 
    Z[1] = 3*P0 - 6*P1 + 3*P2;
    Z[2] = -3*P0 + 3*P1;
    Z[3] = P0;
	return Z;
}


/*based on http://mysite.verizon.net/res148h4j/javascript/script_exact_cubic.html#the%20source%20code and
	https://www.particleincell.com/2013/cubic-line-intersection/ */
function cubicRoots(P) {
    var a=P[0];
    var b=P[1];
    var c=P[2];
    var d=P[3];
 
    var A=b/a;
    var B=c/a;
    var C=d/a;
 
    var Q, R, D, S, T, Im;
 
    var Q = (3*B - Math.pow(A, 2))/9;
    var R = (9*A*B - 27*C - 2*Math.pow(A, 3))/54;
    var D = Math.pow(Q, 3) + Math.pow(R, 2);    // polynomial discriminant
 
    var t=Array();
 
    if (D >= 0)                                 // complex or duplicate roots
    {
        var S = Math.sign(R + Math.sqrt(D))*Math.pow(Math.abs(R + Math.sqrt(D)),(1/3));
        var T = Math.sign(R - Math.sqrt(D))*Math.pow(Math.abs(R - Math.sqrt(D)),(1/3));
 
        t[0] = -A/3 + (S + T);                    // real root
        t[1] = -A/3 - (S + T)/2;                  // real part of complex root
        t[2] = -A/3 - (S + T)/2;                  // real part of complex root
        Im = Math.abs(Math.sqrt(3)*(S - T)/2);    // complex part of root pair   
 
        /*discard complex roots*/
        if (Im!=0)
        {
            t[1]=-1;
            t[2]=-1;
        }
 
    }
    else                                          // distinct real roots
    {
        var th = Math.acos(R/Math.sqrt(-Math.pow(Q, 3)));
 
        t[0] = 2*Math.sqrt(-Q)*Math.cos(th/3) - A/3;
        t[1] = 2*Math.sqrt(-Q)*Math.cos((th + 2*Math.PI)/3) - A/3;
        t[2] = 2*Math.sqrt(-Q)*Math.cos((th + 4*Math.PI)/3) - A/3;
        Im = 0.0;
    }
 
    /*discard out of spec roots*/
    for (var i=0;i<3;i++) 
        if (t[i]<0 || t[i]>1.0) t[i]=-1;
 
    /*sort but place -1 at the end*/
    // t=sortSpecial(t);
	/*
    console.log(t[0]+" "+t[1]+" "+t[2]);
	*/
    return t;
}

/*computes intersection between a cubic spline and a line segment*/
function computeIntersections(px,py,lx,ly) {
    var Intersections = [];
 
    var A=ly[1]-ly[0];	    //A=y2-y1
    var B=lx[0]-lx[1];	    //B=x1-x2
    var C=lx[0]*(ly[0]-ly[1]) + 
          ly[0]*(lx[1]-lx[0]);	//C=x1*(y1-y2)+y1*(x2-x1)
 
    var bx = bezierCoeffs(px[0],px[1],px[2],px[3]);
    var by = bezierCoeffs(py[0],py[1],py[2],py[3]);
 
    var P = Array();
    P[0] = A*bx[0]+B*by[0];		/*t^3*/
    P[1] = A*bx[1]+B*by[1];		/*t^2*/
    P[2] = A*bx[2]+B*by[2];		/*t*/
    P[3] = A*bx[3]+B*by[3] + C;	/*1*/
 
    var r=cubicRoots(P);
 
    /*verify the roots are in bounds of the linear segment*/	
    for (var i=0;i<3;i++)
    {
        t=r[i];
		
		Intersections[i] = {
			'x': bx[0]*t*t*t+bx[1]*t*t+bx[2]*t+bx[3],
			'y': by[0]*t*t*t+by[1]*t*t+by[2]*t+by[3]
		};
 
        /*above is intersection point assuming infinitely long line segment,
          make sure we are also in bounds of the line*/
		  /*
        var s;
        if ((lx[1]-lx[0])!=0) {           
            s=(X[0]-lx[0])/(lx[1]-lx[0]);
		} else {
            s=(X[1]-ly[0])/(ly[1]-ly[0]);
		}
			*/
		
		
        /* not in bounds?*/
		/*
        if (t<0 || t>1.0 || s<0 || s>1.0)
        {
            X[0]=-100;  // move off screen
            X[1]=-100;
        }
		*/
 
        /*move intersection point*/
		/*
        I[i].setAttributeNS(null,"cx",X[0]);
        I[i].setAttributeNS(null,"cy",X[1]);
		*/
    }
	return Intersections;
}