/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	
	var statusController = require("mds/controller/statusController");
	var statusViewLogsController = require("mds/controller/statusViewLogsController");
	
	module.exports = function() {
		this.state('/refrigeratory/', function(req) {
				if (location.pathname != req.fullPath) {
					location.href = req.fullPath;
				} else {
					statusController(req);
				}
			});
			this.get('/refrigeratory/status', statusController);
			
			this.get('/refrigeratory/status/view-logs', statusViewLogsController);
	};

});