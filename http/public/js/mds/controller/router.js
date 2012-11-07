/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	
	var statusController = require("mds/controller/statusController");
	var statusViewLogsController = require("mds/controller/statusViewLogsController");
	var configController = require("mds/controller/configController");
	
	module.exports = function() {
		var app = this;
		this.state('/refrigeratory/', function(req) {
				if (location.pathname != req.fullPath) {
					location.href = req.fullPath;
				} else {
					statusController.call(app, req);
				}
			});
		this.get('/refrigeratory/status', statusController.bind(app));
		
		this.get('/refrigeratory/config', configController.bind(app));
		
		this.get('/refrigeratory/status/view-logs', statusViewLogsController.bind(app));
		
		this.before(function(req) {
			if (app.timers) {
				if (app.timers.intervals) {
					for (var i in app.timers.intervals) {
						clearInterval(app.timers.intervals[i]);
					}
				}
				if (app.timers.timeouts) {
					for (var t in app.timers.timeouts) {
						clearTimeout(app.timers.timeouts[t]);
					}
				}
			}
		});
	};

});