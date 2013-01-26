/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {

	var Handlebars = require("handlebars");
	
	exports.tableRowList = function() {
		Handlebars.registerHelper('rowList', function(items, options) {
			var out = "";
			for(var i=0, l=items.length; i<l; i++) {
				out = out + "<td>" + options.fn(items[i]) + "</td>";
			}
		return out;
		});
	};
	
	exports.i18n = function() {
		Handlebars.registerHelper('I18n', function(str) {
			//return str;
			return (i18n != undefined ? i18n[str] : str);
		}); 
	};
	
	exports.ifCond = function() {
		Handlebars.registerHelper('ifCond', function(v1, v2, options) {
			if(v1 == v2) {
				return options.fn(this);
			}
			return options.inverse(this);
		});
	}
});