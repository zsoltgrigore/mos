/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	
	exports.getCookie = function(cookieKey) {
		var i,x,y,ARRcookies = document.cookie.split(";");
		
		for (i = 0; i < ARRcookies.length; i++) {
			x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
			y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
			x = x.replace(/^\s+|\s+$/g,"");
			if (x == cookieKey) {
				return unescape(y);
			}
		}
	};

	exports.setCookie = function(cookieKey, value, exdays) {
		var exdate = new Date();
		exdate.setDate(exdate.getDate() + exdays);
		var cookieValue = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
		document.cookie=cookieKey + "=" + cookieValue;
	}

});