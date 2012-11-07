/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {

	var $ = require("jquery");
	var Handlebars = require("handlebars");
	var helper = require("mds/template/helper");
	var status = require("text!mds/template/status/status.hbrs");
	var probes = require("text!mds/template/status/probes.hbrs");
	
	module.exports = function(req) {
		//this.$content.html("<b>Status Controller</b>");
		
		try {
			if (Handlebars.helpers.i18n == null) {
				helper.i18n();
			}
		} catch (e) {
			if (console) console.warn(e);
			helper.i18n();
		}
		
		//check auth
		//show user data
		//
		
		var connections = {
			status: {
				server: "online",
				ethernet: "connected",
				wifi: "disconnected",
				gsm: "disconnected"
			}
		};
		
		var probesList = {
			probes: [
				{ name: "name1", state: "state1", device: "device1", register: "1", low_limit_alarm_enabled: "true"
				, low_alarm_value: "1", high_limit_alarm_enabled: "true", high_alarm_value: "-1" },
				{ name: "name2", state: "state2", device: "device2", register: "2", low_limit_alarm_enabled: "true"
				, low_alarm_value: "2", high_limit_alarm_enabled: "false", high_alarm_value: "-2" }
			]
		};
		
		for( var i=0; i< probesList.probes.length; i++) {
			probesList.probes[i].idx = (function(in_i){return in_i+1;})(i);
		}
		
		this.$content.html("<b>Status Controller</b>");
		
		var template = Handlebars.compile(status);
		var html = template(connections);
		this.$content.append($("<div>").attr("id", "status").html(html));
		
		var template2 = Handlebars.compile(probes);
		var html2 = template2(probesList);
		this.$content.append($("<div>").attr("id", "probes").html(html2));
		
		var i = 1;
				
		this.timers.intervals.probesUpdate = setInterval(function() {
			if (this.$content.has("#probes").length != 0)
				this.$content.children("#probes").remove();
			
			probesList.probes[0].low_alarm_value = i;
			
			html2 = template2(probesList);
			this.$content.append($("<div>").attr("id", "probes").html(html2));
			
			i++;
			console.log("ctx modified");
		}.bind(this), 1000);
		
		/* code snippets for redraw
		this.$content.has("#status").addClass("full");
		
		if (this.$content.has("#status").length != 0)
			this.$content.children("#status").remove();
			
				
		setTimeout(function() {
			connections.status.server = "offline";
			console.log("ctx modified");
		}, 5000);
		*/
	};

});