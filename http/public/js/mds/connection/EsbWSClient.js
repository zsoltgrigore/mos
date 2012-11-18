/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	
	var EsbWSClient = module.exports = function(clientConfig) {
		clientConfig = clientConfig || {};
		
		this.url = clientConfig.url || "ws://127.0.0.1:8080";
		this.protocol = "mesh-control-protocol"

		this.connection = false;
	};
	
	EsbWSClient.prototype.connect = function() {
		if (this.webSocketSupported) {
			this.connection = new WebSocket(this.url, this.protocol);
			this.connection.onopen = this.connectHandler.bind(this);
			this.connection.onmessage = this.messageHandler.bind(this);
			this.connection.onclose = this.closeHandler.bind(this);
			this.connection.onerror = this.errorHandler.bind(this);
		} else {
			throw "WebSocket not supported";
		}
	};
	
	EsbWSClient.prototype.connectHandler = function (event){
		console.log(event);
		console.info('successfully established a working connection \o/');
	};
	
	EsbWSClient.prototype.messageHandler = function (event){
		console.log(event);
	};
	
	EsbWSClient.prototype.closeHandler = function (event){
		console.log(event);
	};
	
	EsbWSClient.prototype.errorHandler = function (reason){
		console.log(event);
		utils.redirectTo(null, '/login');
	};
	
	 EsbWSClient.prototype.send = function(message) {
		this.connection.send(message);
	};
	
	EsbWSClient.prototype.webSocketSupported = function() {
		return "WebSocket" in window;
	};
	
});