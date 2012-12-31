/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	
	var statusController = require("mds/controller/statusController");
	//var statusViewLogsController = require("mds/controller/statusViewLogsController");
	var configController = require("mds/controller/configController");
	var navController = require("mds/controller/navController");
	var configPostController = require("mds/controller/configPostController");
	
	module.exports = function() {
		
		var app = this;
		this.state('/refrigeratory/', function(req) {
				statusController.bind(app);
		});
		
		this.get('/refrigeratory/', statusController.bind(app));
		this.get('/refrigeratory/status', statusController.bind(app));
		
		this.get('/refrigeratory/config', configController.bind(app));
		
		/*This route does not work because a newline character in the 
		textarea does something weird after form submittion.*/
		//If you don't write newline character into the textarea than this route works...
		this.post('/refrigeratory/config', function(req) {
			configPostController.call(app, req);
			req.redirect('/refrigeratory/config');
		});
		
		this.before(function(req) {
			app.$navigation.empty();
			app.$content.empty();
		
			//eseménykezelők nullázása! pl.: delete esbclient.removeHandler("handlerName");
		
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
			navController.call(app, req);
		});
	};

});