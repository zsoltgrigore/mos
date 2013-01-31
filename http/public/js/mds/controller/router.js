/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {

	var navController = require("mds/controller/navController");
	var statusController = require("mds/controller/statusController");
	var setAlarmPostController = require("mds/controller/setAlarmPostController");
	var setLimitActivePostController = require("mds/controller/setLimitActivePostController");
	var setLimitErrorPostController = require("mds/controller/setLimitErrorPostController");
	
	exports.init = function() {
		var app = this;
		navController.call(app);
		statusController.call(app);
		
		window.onbeforeunload = function() {
			//TODO: rendes i18n szöveget neki! i18n.alert.navigate-away
			console.log(i18n);
			return "Amennyiben elhagyja az oldalt, később újra be kell jelentkezzen!";
		};
		window.onunload = function() {
			esbclient.close(1001, "User has navigated away!");
		};
	}
	
	exports.main = function() {
		
		var app = this;
		
		this.post('/refrigeratory/set-alarm/:device', setAlarmPostController.bind(app));
		this.post('/refrigeratory/set-limit-active/:device', setLimitActivePostController.bind(app));
		this.post('/refrigeratory/set-limit-error/:device', setLimitErrorPostController.bind(app));
	};

});