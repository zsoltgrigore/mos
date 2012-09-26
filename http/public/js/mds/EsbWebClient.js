/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	
	var utils = require("mds/utils");
	
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
			//ha kapcsolesb-hez akkor az azt is jelenzi hogy van esb kapcsolat ezért a loginhandler is lefut connect-re
			this.connection.on("connect", this.connectHandler);
			this.connection.on("connect", this.loginHandler);
			this.connection.on("error", this.errorHandler);
			//a succesfull login esemény sokkal korábban eltüzelődik, mióta ezt használjuk az authentikáció során
			//this.connection.on("successfull login", this.loginHandler);
		}
	};

	EsbWebClient.prototype.errorHandler = function (reason){
  		console.error('Unable to connect Socket.IO' + reason);
  		utils.redirectTo(null, '/login');
	};

	EsbWebClient.prototype.loginHandler = function (msg){
		$('#login').append("Kapcsolódott");
		$('#login').click(function (e) {
			utils.redirectTo(e,'/login');
			}
		);
	};

	EsbWebClient.prototype.connectHandler = function (){
  		console.info('successfully established a working connection \o/');
	};
	
	module.exports = EsbWebClient;
});