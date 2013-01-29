/**
 * @author Grigore András Zsolt
 */
var WSServer = require('websocket').server;
var http = require('http');
var parseSignedCookie = require('connect').utils.parseSignedCookie;
var Session = require('connect').middleware.session.Session;
var Logger = require('../utils/Logger');
var	cloneConfig = require('../utils/general').cloneConfig;
var EsbSocket = require('../esb/').EsbSocket;
var ws_auth_resp = require('../model/auth/websocket/ws_auth_resp');

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
	this.ioServer.on('connect', function(ws){
		//console.log(ws);
		//console.log("connect");
	})
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
MosWebSocketServer.prototype.globalAuthorizationHandler = function (webSocket) {
	// Make sure we only accept requests from an allowed origin
	this.logger.info("Websocket kapcsolódás elfogadva:" + webSocket.origin);
	return true;
};

/**
 *
 * @param {Object} webSocketClient
 *		A kapcsolódott klienst reprezentáló objektum
 */
MosWebSocketServer.prototype.globalConnectionHandler = function(webSocket) {
	var self = this;
	var esbSocket = false;

	this.logger.info("Websocket kapcsolódási kisérlet:" + webSocket.origin);

	if (!self.globalAuthorizationHandler(webSocket)) {
		webSocket.reject();
		self.logger.info((new Date()) + ' Kapcsolódás: ' + webSocket.origin + '. Visszautasítva.');
		return;
	}
	
	var connection = webSocket.accept("mesh-control-protocol", webSocket.origin);
	
	esbSocket = new EsbSocket(cloneConfig(global.configuration.esb));
	
	esbSocket.on("web message", function(eventType, payload) {
		self.logger.info("web felé továbbítva: %s", payload.header.name);
		payload.header.security_id = "ChangeMe!:)";
		connection.sendUTF(JSON.stringify(payload));
	});

	esbSocket.on("reconnecting", function(reconnectTimes) {
		if (reconnectTimes == 3) {
			self.destroyWebSocket(webSocket, "Middleware connection is unstable.");
		}
	});

	connection.on('message', function(message) {
		var messageObj = false;
		try {
			messageObj = JSON.parse(message.utf8Data);
		} catch (e) {
			self.logger.error("Hibás üzenet érkezett webről!" + e);
		}
		
		if (messageObj) {
			self.logger.debug("Üzenet web felől: %s", messageObj.header.name);
			if (messageObj.header.name == "ws_auth_req" && !webSocket.source) {
				var authHash = parseSignedCookie(messageObj.data.cookieValue, self.http.salt);
				webSocket.source = self.http.getSourceToHash(authHash);
				webSocket.connection = connection;
				/*
				 *A túl gyors kattintgatásoktól hajlamos itt elszállni
				 */
				try {
					esbSocket.user = self.http.socketMap[webSocket.source].user;
					esbSocket.connect();
					self.http.socketMap[webSocket.source].esbSocket = esbSocket;
					connection.sendUTF(JSON.stringify(new ws_auth_resp(true)));
				} catch(e) {
					console.log(e);
					self.logger.info("Http session lejárt.");
					self.destroyWebSocket(webSocket, "Not authenticated!");
				}
			} else {
				if (webSocket.source) {
					self.logger.info("esb felé továbbítva: %s", messageObj.header.name);
					messageObj.header.security_id = esbSocket.securityId;
					messageObj.header.source = esbSocket.user.source;
					if (!esbSocket.reconnecting)
						esbSocket.writeObject(messageObj);
				} else {
					self.logger.info("Nem authentikált kapcsolódás. WebSocket lekapcsolása...");
					connection.sendUTF(JSON.stringify(new ws_auth_resp(false)));
					self.destroyWebSocket(webSocket, "Not authenticated!");
				}
			}
		}
	});
	
	connection.on('close', function () {
		self.destroyWebSocket(webSocket, "Close event has fired on the server.");
	});
};

MosWebSocketServer.prototype.destroyWebSocket = function(webSocket, description) {
	var self = this;
	
	try {
		if (webSocket.connection.state != "closed") {
			self.dropWebSocket(webSocket, description);
			return;
		}
	} catch (e) {
		self.logger.error(e.message);
	}
	
	try {
		if (this.http.socketMap[webSocket.source]) {
			this.http.sessionStore.destroy(this.http.socketMap[webSocket.source].sessionID, function() {
				self.logger.info("Kliens végpont leszakadt. Felhasználó azonosító és a hozzá tartozó session törölve."
					+ webSocket.source);
				self.http.socketMap[webSocket.source].esbSocket.end();
				delete self.http.socketMap[webSocket.source];
				delete webSocket.source;
			});
		} else {
			self.logger.warn("Nincs webSocket.source a socketMap-ban.");
		}
	} catch(e) {
		console.log(e);
	}
};

MosWebSocketServer.prototype.dropWebSocket = function(webSocket, description) {
	if (webSocket.connection.connected) 
		webSocket.connection.drop(webSocket.connection.CLOSE_REASON_PROTOCOL_ERROR, description);
};