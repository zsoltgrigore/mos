/**
 * @author Grigore András Zsolt
 */
var WSServer = require('websocket').server;
var http = require('http');
var cookie = require('cookie');
var parseSignedCookies = require('connect').utils.parseSignedCookies;
var Session = require('connect').middleware.session.Session;
var Logger = require('../utils/Logger');
var	cloneConfig = require('../utils/general').cloneConfig;
var EsbSocket = require('../esb/').EsbSocket;

/**
 * @classDescription 
 * 		MosWebSocketServer osztály
 * 		Noe-Websocket("websocket") könyvtárat használja websocket szerver készítéséhez és a kapcsolatok kezeléséhez
 *
 * @param {Object} config
 * 		A esbSocket példányhoz rendelt konfigurációs objektum
 * 		esbSocketConfig = {
 * 			host : {String} //host amihez kapcsolódunk
 * 			port : {Number} //port amihez kapcsolódunk
 * 		}
 */
var MosWebSocketServer = module.exports = function (mosWebSocketsConfig) {
	mosWebSocketsConfig = mosWebSocketsConfig || {};
	
	//Publikus változók
	//-----------------
	this.host = mosWebSocketsConfig.host || "localhost";
	this.port = mosWebSocketsConfig.port || 8080;
	this.http = false;
	this.loggedInUsers = {};
	
	//Nem annyira publikus változók
	//-----------------------------
	this.ioServer = false;
	this.logger = new Logger({target : "MosWebSocketServer<Server>"});
};

/**
 * Hallgatózás: ha van parméterben egy futó http vagy https szerver akkor azt használjuk
 *				ha nincs akkor konstruktorban megadott host és port értékeket
 * Minden kapcsolódás előtt megköveteljük a kliens azonosítását. (globalAuthorizationHandler)
 * Itt csatolunk a szerver egyetlen eseményéhez, kezelő függvényt. (globalConnectionHandler)
 *
 * @param {MosHttp} mosHttp
 *		egy MosHttp osztály példány
 *
 */
MosWebSocketServer.prototype.listen = function (mosHttp) {
	if (mosHttp) {
		this.http = mosHttp;
		this.ioServer = new WSServer({
			httpServer: this.http.server,
			// You should not use autoAcceptConnections for production
			// applications, as it defeats all standard cross-origin protection
			// facilities built into the protocol and the browser.  You should
			// *always* verify the connection's origin and decide whether or not
			// to accept it.
			autoAcceptConnections: false
		});
	} else {
		throw "WebSocket Server can listen only on valid http intance!";
		//this.ioServer = sio.listen(port, host);
	}
	
	//this.ioServer.set('log level', this.logger.level);
	//this.ioServer.enable('browser client minification');  // send minified client
	//this.ioServer.enable('browser client etag');          // apply etag caching logic based on version number
	//this.ioServer.enable('browser client gzip');          // gzip the file
	
	//this.ioServer.set('authorization', this.globalAuthorizationHandler.bind(this));
	this.ioServer.on('request', this.globalConnectionHandler.bind(this));
};


/**
 * Minden socketIO kliens csatalkozásakor lefut. Ha a böngésző által küldött cookie-ban tárolt sessionID-hoz tartozik eltárolt session,
 * akkor ellenőrizzük az érvényességét és ha minden rendben van akkor megengedjük, hogy csatlakozzon.
 * TODO: Session érvényes-e?
 *
 * @param {Object} handshakeData
 * @param {fn} callback(error,isAccept)
 * 		error {String} milyen hiba
 *		isAccept {Boolean} elfogadjuk-e a kapcsolódást?
 *
 */
MosWebSocketServer.prototype.globalAuthorizationHandler = function (handshakeData) {
	var http = this.http;
	console.log("Origin:");
	console.log(handshakeData);
	
	return true;
};

/**
 *
 * @param {Object} webSocketClient
 *		A kapcsolódott klienst reprezentáló objektum
 */
MosWebSocketServer.prototype.globalConnectionHandler = function(webSocket) {
	var mosWebSockets = this;
	if (!this.globalAuthorizationHandler(webSocket.origin)) {
		// Make sure we only accept requests from an allowed origin
		webSocket.reject();
		console.log((new Date()) + ' Connection from origin ' + webSocket.origin + ' rejected.');
		return;
	}
	
	//var esbSocket = mosWebSockets.http.socketMap[webSocket.handshake.session.user.source].esbSocket;
	//var handshake = webSocket.handshake;
	//var sessionid = handshake.sessionID;
	
	var connection = webSocket.accept("mesh-control-protocol", webSocket.origin);
	console.log("Request:");
	console.log(webSocket);
	mosWebSockets.logger.info("Kliens kapcsolódott. Request Object: " + webSocket);
	mosWebSockets.logger.info("Felhasználó: " + webSocket.origin);
	
	/*esbSocket.on("web message", function(eventType, payload){
		mosWebSockets.logger.info("web felé továbbítva: %s", payload.header.name);
		connection.sendUTF(payload);
	});*/

	connection.on('message', function(message) {
		console.log(message);
		//mosWebSockets.logger.info("esb felé továbbítva: %s", message.utf8Data.header.name);
		//message.utf8Data.header.security_id = esbSocket.securityId;
		/*if (!esbSocket.reconnecting)
			esbSocket.writeObject(message.utf8Data);*/
	});
	
	connection.on('close', function () {
		delete mosWebSockets.http.socketMap[webSocket.handshake.session.user.source];
		//esbSocket.end();
		//clearInterval(intervalID);
		mosWebSockets.http.sessionStore.destroy(webSocket.handshake.sessionID, function () {
            mosWebSockets.logger.info("Kliens végpont leszakadt. Felhasználó azonosító és a hozzá tartozó session törölve." + sessionid);
        });
  	});
};