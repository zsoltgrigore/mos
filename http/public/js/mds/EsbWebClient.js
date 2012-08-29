/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	
	var EsbWebClient = function(clientConfig) {
		clientConfig = clientConfig || {};
		
		this.connection = false;
		this.privateConn = false;
		this.channel = clientConfig.channel || false;
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
		if (this.channel) {
			alert("Nem támogatott még a csatorna nyitás!");
			//this.privateConn = io.connect("http://localhost:8080/" + this.channel);
		} else {
			this.connection = io.connect();
			this.connection.on("connect", this.connectHandler);
			this.connection.on("error", this.errorHandler);
			this.connection.on("successfull login", this.loginHandler);
		}
	};

	EsbWebClient.prototype.errorHandler = function (reason){
  		console.error('Unable to connect Socket.IO' + reason);
	};

	EsbWebClient.prototype.loginHandler = function (msg){
		$('body').append('<div>').attr('id', 'login').append("Kapcsolódott");
	};

	EsbWebClient.prototype.connectHandler = function (){
  		console.info('successfully established a working connection \o/');
	};
	
	module.exports = EsbWebClient;
});