/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {

	var $ = require("jquery");
	var parser = require("json_parse")
	var Handlebars = require("handlebars");
	var helper = require("mds/template/helper");
	var config = require("text!mds/template/config/config.hbrs");
	
	module.exports = function(req) {
		console.log("Post");
		console.log(req);
		
		/*$("#config-submit").click(function(){
			try {
				console.log();
				var message = $("#config").value;
				parser(message);
				//destiantion?
				esbclient.send(message);
			} catch (e) {
				if (console) console.error(e);
			}
		});*/
		
	};

});