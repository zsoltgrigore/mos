/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	
	exports.redirectTo = function(e, path) {
		window.location = path;
	};
	
	exports.isNumber = function(input) {
		if (typeof (input) === 'string') {
			input = this.repCommaToDot(input);
		}
		return !isNaN(parseFloat(input)) && isFinite(input);
	};
	
	exports.repCommaToDot = function(str) {
	 return str.replace(/,/, ".");
	};

	exports.digitsToArray = function(n) {
		var tempArray = new Array();
		var isNegative = this.isNegative(n);
		
		if (isNegative) n = n * -1;
		
		var intAndDecimal = n.toString().split('.');
		if (this.isInt(n)) {
			
			tempArray.push(intAndDecimal[0].split(''));
		} else {
			tempArray.push(intAndDecimal[0].split(''));
			tempArray.push(intAndDecimal[1].split(''));
		}
		
		return tempArray;
	};
	
	exports.isInt = function(n) {
		return n % 1 === 0;
	};
	
	exports.isNegative = function(n) {
		return n < 0;
	};
	
	exports.regValuesToInt = function(addr_string, device_values) {
		var valueArray = addr_string.split(",");
		valueArray.reverse();
		var ret = 0;
		for (var i = 0; i < valueArray.length; i++){
			//get register name and use it as key for device register value
			ret += device_values[valueArray[i]] * Math.pow(256, i);
		}
		return ret;
	};
	
	exports.pause = function(ms) {
		ms += new Date().getTime();
		while (new Date() < ms){}
	};
	
	exports.pause = function(ms) {
		ms += new Date().getTime();
		while (new Date() < ms){}
	};
	
	exports.stringToCssCls = function(string) {
		return string.replace(/[@|.]/gi, "_");
	};
});