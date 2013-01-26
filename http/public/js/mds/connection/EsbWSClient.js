/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	
	var cookieUtils = require("mds/utils/cookie");
	var $ = require("jquery");
	
	var EsbWSClient = module.exports = function(clientConfig) {
		clientConfig = clientConfig || {};
		
		this.url = clientConfig.url || "ws://127.0.0.1:8080";
		this.protocol = "mesh-control-protocol";
		this.user = cookieUtils.getCookie("user");
		this.destination = "control@fridge.integ.meshnetwork.hu";
		this.authCookieKey = clientConfig.authCookieKey || "wshash";
		
		this.messageQueue = new Array();
		this.eventHandlers = {};
		
		this.connection = false;
		this.authenticated = false;
		this.connectTimeInterval = false;
	};
	
	EsbWSClient.prototype.connect = function() {
		if (this.webSocketSupported()) {
			this.connection = new WebSocket(this.url, this.protocol);
			this.connection.onopen = this.connectHandler.bind(this);
			this.connection.onmessage = this.messageHandler.bind(this);
			this.connection.onclose = this.closeHandler.bind(this);
			this.connection.onerror = this.errorHandler.bind(this);
		} else {
			alert("websocket not supported");
		}
	};
	
	EsbWSClient.prototype.authenticate = function() {
		//delete from browser after user auth: http://www.quirksmode.org/js/cookies.html
		clearInterval(this.connectTimeInterval);
		var ws_auth_req = {
			header: {
				name: "ws_auth_req"
			},
			data: {
				cookieValue: cookieUtils.getCookie(this.authCookieKey)
			}
		};
		//minden egyéb esetben this.send(...)
		this.connection.send(JSON.stringify(ws_auth_req));
		this.on("ws_auth_resp", this.authenticationHandler.bind(this));
		cookieUtils.setCookie(this.authCookieKey, "", -1);
	}
	
	EsbWSClient.prototype.authenticationHandler = function(payload) {
		this.authenticated = payload.data.authenticated;
		/*várunk 100ms-t mert a connection megnyitására rakott eeménykezelő későn hívódik részletesebben @this revision log*/
		/*az okozója valszeg az esbclient singleton megvalósítása a require.js-el közösen*/
		/*esbClient window-hoz!?*/
		setTimeout(this.checkMessageQueue.bind(this), 100);
		this.off("ws_auth_resp", this.authenticationHandler.bind(this));
	};
	
	EsbWSClient.prototype.close = function(c, d) {
		//https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIWebSocketChannel#Status_codes
		var code = c || 1005;
		var description = d || "No Code provided!";
		if (this.connection) {
				this.connection.close(c, d);
		} else {
			throw "No active connection";
		}
	};
	
	EsbWSClient.prototype.send = function(message) {
		this.authenticated ? this.connection.send(message) : this.messageQueue.push(message);
	};
	
	EsbWSClient.prototype.sendObject = function(object) {
		//for security reasons source will be added by the server side logic
		object.header.destination = this.destination;
		object.header.session_id = "" + Math.floor(Math.random()*65535) + "";
		this.send(JSON.stringify(object));
	}
	
	EsbWSClient.prototype.checkMessageQueue = function() {
		if (this.messageQueue.length > 0) {
			this.send(this.messageQueue.shift());
			setTimeout(this.checkMessageQueue.bind(this), 100);
		}
	}
	
	EsbWSClient.prototype.on = function(eventType, callback) {
		if (!this.eventHandlers[eventType])
			this.eventHandlers[eventType] = new Array();
		
		this.eventHandlers[eventType].push(callback);
	};
	
	EsbWSClient.prototype.off = function(eventType, callback) {
		if (this.eventHandlers[eventType]) {
			var list = this.eventHandlers[eventType];
			for (var i = 0, length = list.length; i < length; i++) {
				if (list[i].toString() == callback.toString())
					list.splice(i, 1);
				else
					if (console) console.warn("can't off eventhandler" + eventType);
			}
		}
	};
	
	EsbWSClient.prototype.connectHandler = function (event){
		this.authenticate();
	};
	
	EsbWSClient.prototype.messageHandler = function (event){
		//console.log(event.data);
		var payload = JSON.parse(event.data);
		//console.log(payload);
		var eventType = payload.header.name;
		//console.log(payload.header.name);
		
		if (this.eventHandlers[eventType]) {
			for (var callbackIndex in this.eventHandlers[eventType]) {
				this.eventHandlers[eventType][callbackIndex](payload);
			}
		}
	};
	
	EsbWSClient.prototype.closeHandler = function (event){
		window.onbeforeunload = null;
		$("#logout_form").submit();
	};
	
	EsbWSClient.prototype.errorHandler = function (reason){
		if (console) console.error(reason);
		setTimeout(function() { 
			utils.redirectTo(null, '/login');
			}, 5000);
	};
	
	EsbWSClient.prototype.webSocketSupported = function() {
		return "WebSocket" in window;
	};
});