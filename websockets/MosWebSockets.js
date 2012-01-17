/**
 * @author Grigore András Zsolt
 */
var sio = require("socket.io");

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
	this.io.sockets.on('connection', function (websocket) {
		console.log('client connected');
		//TODO: kirakni de akár itt is jó illetve socketmap-ba egy bejegyzést legyártani, ha megvolt az auth akkor egy esbsocket-et mellécsapni
	});
}

module.exports = MosWebSockets;