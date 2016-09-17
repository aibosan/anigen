/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Set of local storage and cookie functions
 */
function getCookie(c_name) {
    var i,x,y,ARRcookies=document.cookie.split(";");
    for (i=0;i<ARRcookies.length;i++)
    {
        x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
        y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
        x=x.replace(/^\s+|\s+$/g,"");
        if(x==c_name)
        {
            return y;
        }
    }
}

function setCookie(c_name,value,exdays) {
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
}

function delCookie(c_name) {
    setCookie(c_name,"",-1);
}

function setData(name, value) {
	if(typeof(Storage) !== "undefined") {
		// use local storage
		localStorage.setItem(name, value);
	} else {
		// cookie fallback
		setCookie(name, value, 365);
	}
}

function getData(name) {
	if(typeof(Storage) !== "undefined") {
		// use local storage
		return localStorage.getItem(name);
	} else {
		// cookie fallback
		return getCookie(name);
	}
}

function deleteData(name) {
	if(typeof(Storage) !== "undefined") {
		// use local storage
		localStorage.removeItem(name);
	} else {
		// cookie fallback
		delCookie(name);
	}
}