/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {

	var commonUtils = require("mds/utils/common");
	var lang = {};
	lang.hun = require("text!mds/i18n/hun.json");
	lang.eng = require("text!mds/i18n/eng.json");
	
	module.exports = function() {
		var intern13n = lang[commonUtils.getURLParameter("lang")];
		
		try {
			window.i18n = JSON.parse(intern13n);
		} catch (e) {
			if (console) console.error(e);
			throw e;
		}
	}
});