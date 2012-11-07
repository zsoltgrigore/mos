/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {

	var $ = require("jquery");
	var Handlebars = require("handlebars");
	var helper = require("mds/template/helper");
	var config = require("text!mds/template/config/config.hbrs");
	
	module.exports = function(req) {
		try {
			if (Handlebars.helpers.i18n == null) {
				helper.i18n();
			}
		} catch (e) {
			if (console) console.warn(e);
			helper.i18n();
		}
		
		var configTemplate = Handlebars.compile(config);
		var configHtml = configTemplate();
		this.$content.html(configHtml);

	};

});