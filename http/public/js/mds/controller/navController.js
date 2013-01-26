/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {

	var $ = require("jquery");
	var Handlebars = require("handlebars");
	var helper = require("mds/template/helper");
	var nav = require("text!mds/template/navigation/navigation.hbrs");
	
	module.exports = function(req) {
		try {
			if (Handlebars.helpers.i18n == null) {
				helper.i18n();
			}
		} catch (e) {
			if (console) console.warn(e);
			helper.i18n();
		}
		
		var navT = Handlebars.compile(nav);
		var navGHtml = navT();
		this.$navigation.append(navGHtml);
		
		$("#logout_form").submit(function(event) {
			window.onbeforeunload = null;
			return true;
		});
	}
});