/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {

	var $ = require("jquery");
	var Handlebars = require("handlebars");
	var status = require("text!mds/template/status/status.hbrs");
	var probes = require("text!mds/template/status/probes.hbrs");
	
	module.exports = function(req) {
		var connections = {
			status: {
				server: "online",
				ethernet: "connected",
				wifi: "disconnected",
				gsm: "disconnected"
			}
		}
		
		this.$content.has("#status").addClass("full");
		
		this.$content.html("<b>Status Controller</b>");
		var template = Handlebars.compile(status);
		var html = template(connections);
		this.$content.append($("<div>").attr("id", "status").html(html));
		
		if (this.$content.has("#status").length != 0)
			this.$content.children("#status").remove();

		
		setTimeout(function() {
			connections.status.server = "offline";
			console.log("ctx modified");
		}, 5000);
	};

});