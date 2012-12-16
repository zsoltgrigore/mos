/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	
	var cookieUtils = require("mds/utils/cookie");
	var $ = require("jquery");
	
	var EsbWSClient = module.exports = function(clientConfig) {
		clientConfig = clientConfig || {};
		
		this.url = clientConfig.url || "ws://127.0.0.1:8080";
		this.protocol = "mesh-control-protocol"
		this.authCookieKey = clientConfig.authCookieKey || "wshash";
		
		this.connection = false;
	};
	
	EsbWSClient.prototype.connect = function() {
		if (this.webSocketSupported()) {
			this.connection = new WebSocket(this.url, this.protocol);
			this.connection.onopen = this.connectHandler.bind(this);
			this.connection.onmessage = this.messageHandler.bind(this);
			this.connection.onclose = this.closeHandler.bind(this);
			this.connection.onerror = this.errorHandler.bind(this);
		} else {
			throw "WebSocket not supported";
		}
	};
	
	EsbWSClient.prototype.authenticate = function() {
		//delete from browser after user auth: http://www.quirksmode.org/js/cookies.html
		var authmsg = {
			header: {
				name: "ws_auth"
			},
			data: {
				cookieValue: cookieUtils.getCookie(this.authCookieKey)
			}
		};
		this.send(JSON.stringify(authmsg));
		cookieUtils.setCookie(this.authCookieKey, "", -1);
	}
	
	EsbWSClient.prototype.close = function(c, d) {
		//https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIWebSocketChannel#Status_codes
		var code = c || 1005;
		var description = d || "No Code provided!";
		console.log(this.connection);
		if (this.connection) {
				this.connection.close(c, d);
		} else {
			throw "No active connection";
		}
	};
	
	EsbWSClient.prototype.send = function(message) {
		this.connection.send(message);
	};
	
	EsbWSClient.prototype.connectHandler = function (event){
		console.log(event);
		console.info('successfully established a working connection \o/');
		this.authenticate();
	};
	
	EsbWSClient.prototype.messageHandler = function (event){
		console.log(event);
	};
	
	EsbWSClient.prototype.closeHandler = function (event){
		window.onbeforeunload = null;
		$("#logout_form").submit();
	};
	
	EsbWSClient.prototype.errorHandler = function (reason){
		console.log(event);
		utils.redirectTo(null, '/login');
	};
	
	EsbWSClient.prototype.webSocketSupported = function() {
		return "WebSocket" in window;
	};
});