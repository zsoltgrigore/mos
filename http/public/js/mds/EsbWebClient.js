/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	
	var EsbWebClient = function(clientConfig) {
		clientConfig = clientConfig || {};
		
		this.connection = false;
		this.channel = clientConfig.channel || "";
		this.protocols = this.attachProtocol(clientConfig.protocols);
	};
	
	EsbWebClient.prototype.attachProtocol = function(protocol) {
		if (typeof protocol === "object") {
			console.log(protocol.length);
		} else {
			return false;
		}
	};

	EsbWebClient.prototype.connect = function() {
		this.connection = io.connect("http://localhost:8080/" + this.channel);
		console.log("isNamespace: " + this.channel);
		alert(this.channel);
		if (this.channel) {
			this.connection.socket.of('/private/'+this.channel)
				.on('error', this.errorHandler.bind(this))
				.on('connect', this.connectHandler.bind(this));
		} else {
			console.log("Ide global kapcsolat kezelés!"); //TODO
		}
	};
	
	EsbWebClient.prototype.errorHandler = function (reason){
  		console.error('Unable to connect Socket.IO', reason);
	};

	EsbWebClient.prototype.connectHandler = function (){
  		console.info('successfully established a working connection \o/');
	};	
	
	module.exports = EsbWebClient;
});
