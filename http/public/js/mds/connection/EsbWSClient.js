/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	
	var EsbWSClient = module.exports = function(clientConfig) {
		this.uri = clientConfig.uri || "ws://121.0.0.1/";
		this.socket = false;
		
	};
	
	EsbWSClient.prototype.connect = function() {
	};
	
});