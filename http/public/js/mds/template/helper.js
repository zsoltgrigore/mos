/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {

	var Handlebars = require("handlebars");
	
	exports.tableRowList = function(req) {
		Handlebars.registerHelper('rowList', function(items, options) {
			var out = "";
			for(var i=0, l=items.length; i<l; i++) {
				out = out + "<td>" + options.fn(items[i]) + "</td>";
			}
		return out;
		});
	};

});