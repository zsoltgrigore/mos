/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	
	var statusController = require("mds/controller/statusController");
	var setAlarmPostController = require("mds/controller/setAlarmPostController");
	var setLimitActivePostController = require("mds/controller/setLimitActivePostController");
	var navController = require("mds/controller/navController");
	
	exports.init = function() {
		var app = this;
		navController.call(app);
		statusController.call(app);
	}
	
	exports.main = function() {
		
		var app = this;
		
		/*This route does not work because a newline character in the 
		textarea does something weird after form submittion.
		//If you don't write newline character into the textarea than this route works...
		this.post('/refrigeratory/config', function(req) {
			configPostController.call(app, req);
			req.redirect('/refrigeratory/config');
		});*/
		
		this.post('/refrigeratory/set-alarm/:device', setAlarmPostController.bind(app));
		//this.post('/refrigeratory/set-limit-active/:device', function(req){console.log(req);});
		this.post('/refrigeratory/set-limit-error/:device', function(req){console.log(req);});
		
		
		this.post('/refrigeratory/set-limit-active/:device', setLimitActivePostController.bind(app));
		//this.post('/refrigeratory/set-limit-error/:device', setLimitErrorPostController.bind(app));

		
		/*this.before(function(req) {
			app.$navigation.empty();
			app.$content.empty();
		
			//eseménykezelők nullázása! pl.: delete esbclient.removeHandler("handlerName");
			navController.call(app, req);
		});*/
	};

});