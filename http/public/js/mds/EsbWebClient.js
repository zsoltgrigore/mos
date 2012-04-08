/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	
	var EsbWebClient = function(clientConfig) {
		clientConfig = clientConfig || {};
		
		this.connection = false;
		this.protocols = this.attachProtocol(clientConfig.protocols);
	};
	
	EsbWebClient.prototype.attachProtocol = function(protocol) {
		if (typeof protocol === "object") {
			console.log(protocol.length);
		} else {
			return false;
		}
	};
	
	EsbWebClient.prototype.connect = function(namespace) {
		this.connection = io.connect();
		console.log("isNamespace: " + namespace);
		
		this.connection.socket.on('error', this.errorHandler.bind(this));
		this.connection.on('connect', this.connectHandler.bind(this));
	};
	
	EsbWebClient.prototype.errorHandler = function (reason){
  		console.error('Unable to connect Socket.IO', reason);
	};

	EsbWebClient.prototype.connectHandler = function (){
  		console.info('successfully established a working connection \o/');
	};	
	
	module.exports = EsbWebClient;
});
