/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	var esbapi = require("mds/esbapi");
	
	var EsbWebClient = function(clientConfig) {
		this.connection = false;
		this.getxyreq = new esbapi.agv_get_xy_req();
	};
	
	EsbWebClient.prototype.connect = function() {
		this.connection = io.connect();
	};
	
	EsbWebClient.prototype.getConnection = function() {
		console.log(this.getxyreq.header.name);
		return this.connection;
	};
	
	module.exports = EsbWebClient;
});
