/**
 * @author Grigore András Zsolt
 */
var sio = require("socket.io");
var esb = require("../esb/");

var nicknames = [];

/*
 * @classDescription 
 * 		MosWebSockets osztály
 *
 * 
 * @param {Object} config
 * 		A http osztályhoz tartozó konfigurációs objektum
 * 		mosWebSocketsConfig = {
 * 			host : {String} //host amin hallgatózunk
 * 			port : {Number} //port amin hallgatózunk
 * 			httpInstance : {Object} ha nincs host és port akkor meglévő httpInstance-ra is ráköthető
 * 			socketmap : {Object}
 * 			config : {Object} // config ojjektum
 * 			router : {Object} // router ojjektum
 * 		}
 */
var MosWebSockets = function(mosWebSocketsConfig){
	this.host = mosWebSocketsConfig.host || "localhost";
	this.port = mosWebSocketsConfig.port || 8081;
	this.httpInstance = mosWebSocketsConfig.httpInstance || null;
	
	this.io = false;
}

MosWebSockets.prototype.start = function() {
	if (this.httpInstance)
		this.io = sio.listen(this.httpInstance);
	else
		this.io = sio.listen(this.port, this.host);
		
	//incoming connection
	this.io.sockets.on('connection', this.connectionHandler.bind(this));
}

MosWebSockets.prototype.connectionHandler = function(webSocketClient) {
	console.log(webSocketClient);
	//core.config-ból
	webSocketClient.esbSocketClient = new esb.EsbSocket({ 
				host: "meshnetwork.hu",
				//host: "localhost", 
				source: "test",
				webSocket: webSocketClient, 
				helloInterval: 1000});
	//egyenlőre úgy tűnik minden webSocketClient-hez kapcsolódó event-et itt kell hozzáadni az ojjektumhoz
	webSocketClient.on('nickname', this.addUser);
	//TODO: kirakni de akár itt is jó illetve socketmap-ba egy bejegyzést legyártani, ha megvolt az auth akkor egy esbsocket-et mellécsapni
}


MosWebSockets.prototype.addUser = function (nick, fn) {
    if (nicknames[nick]) {
      fn(true);
    } else {
      fn(false);
	  nicknames.push(nick);

      this.broadcast.emit('announcement', nick + ' connected');
      //io.sockets.emit('nicknames', nicknames);
      this.broadcast.emit('nicknames', nicknames);
      this.esbSocketClient.connectToEsb();
      console.log(this);
    }
  }
module.exports = MosWebSockets;