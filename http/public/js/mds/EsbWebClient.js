/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	var EsbWebClient = function(esbSocketConfig) {
		this.connection = false;
	};
	
	EsbWebClient.prototype.getConnection = function() {
		return this.connection;
	};
	
	module.exports = EsbWebClient;
});
