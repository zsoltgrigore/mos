/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {

	var $ = require("jquery");
	var parser = require("json_parse");
	var Handlebars = require("handlebars");
	var helper = require("mds/template/helper");
	var esbclient = require("mds/connection/esbClient");
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
		var configHtml = configTemplate({form_action: req.path});
		this.$content.html(configHtml);
		
		$("#config_form").submit(function(e){
			e.preventDefault();
			
			var params = {};
			var elements = e.currentTarget.elements;
			
			for (var i in elements) {
				var type = elements[i].type;
				if (type == "text" || type == "textarea") {
					var value = $(elements[i]).val();
					if (type == "textarea") {
						try {
							value = parser(value);
						} catch(err) {
							console.error(err);
							alert(i18n["config.error"] + err.message);
						}
					}
					
					params[elements[i].name] = value;
				}
			}
			params.eps_setup_config.header.destination = params.header_destination;
			console.log(params.eps_setup_config);
			esbclient.send(JSON.stringify(params.eps_setup_config));
		});
	};

});