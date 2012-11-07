/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	
	var EsbWSClient = module.exports = function(clientConfig) {
		clientConfig = clientConfig || {};
		
		this.uri = clientConfig.uri || "ws://121.0.0.1/";

		this.connection = false;
	};
	
	EsbWSClient.prototype.connect = function() {
	};
	
});