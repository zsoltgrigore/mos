/**
 * @author Grigore András Zsolt
 */
var sio = require("socket.io");
var parseCookie = require('connect').utils.parseCookie;
var Session = require('connect').middleware.session.Session;
var Logger = require('../utils/Logger');
var	cloneConfig = require("../utils/general").cloneConfig;
var EsbSocket = require('../esb/').EsbSocket;

/**
 * @classDescription 
 * 		MosWebSockets osztály
 * 		Socket.IO könyvtárat használja websocket szerver készítéséhez és a kapcsolatok kezeléséhez
 *
 * @param {Object} config
 * 		A esbSocket példányhoz rendelt konfigurációs objektum
 * 		esbSocketConfig = {
 * 			host : {String} //host amihez kapcsolódunk
 * 			port : {Number} //port amihez kapcsolódunk
 * 		}
 */
var MosWebSockets = function (mosWebSocketsConfig) {
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
	this.logger = new Logger({target : "MosWebSockets<Server>"});
}

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
MosWebSockets.prototype.listen = function (mosHttp) {
	if (mosHttp) {
		this.http = mosHttp;
		this.ioServer = sio.listen(mosHttp.server);
	} else {
		this.ioServer = sio.listen(port, host);
	}
	
	this.ioServer.set('log level', this.logger.level);
	//this.ioServer.enable('browser client minification');  // send minified client
	//this.ioServer.enable('browser client etag');          // apply etag caching logic based on version number
	//this.ioServer.enable('browser client gzip');          // gzip the file
	
	this.ioServer.set('authorization', this.globalAuthorizationHandler.bind(this));
	this.ioServer.sockets.on('connection', this.globalConnectionHandler.bind(this));
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
MosWebSockets.prototype.globalAuthorizationHandler = function (handshakeData, callback) {
	var http = this.http;
    if (handshakeData.headers.cookie) {
        handshakeData.cookie = parseCookie(handshakeData.headers.cookie);
        handshakeData.sessionID = handshakeData.cookie['express.sid']; 			//magic string!!: ezt express példányból is ki lehet szedni (express.session!)
        http.sessionStore.get(handshakeData.sessionID, function (err, session) {
            if (err || !session) {
            	callback('Error: nem található tárolt session ehhez az ID-hoz:' + handshakeData.sessionID, false);
            } else {
				try {
					if (http.socketMap[session.user.source].user.isValidHash(session.user.hash)) {
						handshakeData.session = session;
                		return callback(null, true);
					}
				} catch (e) {
					console.log(e);
					return callback("Hibás user információ a cookie-ban.", false);
				}

            }
        });
    } else {
       return callback('Engedélyezni kell a Cookie-t az alkalmazás futtatásához!', false);
    }
}

/**
 *
 * @param {Object} webSocketClient
 *		A kapcsolódott klienst reprezentáló objektum
 */
MosWebSockets.prototype.globalConnectionHandler = function(webSocket) {
	var mosWebSockets = this;
	var esbSocket = mosWebSockets.http.socketMap[webSocket.handshake.session.user.source].esbSocket;
	var sessionid = webSocket.handshake.sessionID;
	
	mosWebSockets.logger.info("Kliens kapcsolódott. HTTP SessionId: " + webSocket.handshake.sessionID);
	mosWebSockets.logger.info("Felhasználó: " + webSocket.handshake.session.user.source);
	
	webSocket.on("ready", function(init){
		init(esbSocket.esb_login_resp.header.source, esbSocket.user.nick, esbSocket.helloInterval);
	});
		
	/*esbSocket.on("esb_hello_resp", function(message){
		message.header.security_id = "ChangeMe!:)";
		webSocket.emit("live", message);
	});*/
	
	esbSocket.on("web message", function(eventType, payload){
		mosWebSockets.logger.info("web felé továbbítva: %s", payload.header.name);
		webSocket.emit("web message", payload);
	});
	
	webSocket.on('esb message', function(message) {
		mosWebSockets.logger.info("esb felé továbbítva: %s", message.header.name);
		message.header.security_id = esbSocket.securityId;
		if (!esbSocket.reconnecting)
			esbSocket.writeObject(message);
	});
	
	webSocket.on('disconnect', function () {
		delete mosWebSockets.http.socketMap[webSocket.handshake.session.user.source];
		esbSocket.end();
		mosWebSockets.http.sessionStore.destroy(webSocket.handshake.sessionID, function () {
            mosWebSockets.logger.info("Kliens végpont leszakadt. Felhasználó azonosító és a hozzá tartozó session törölve." + sessionid);
        });
  	});
}

/**
 * Kliens csatorna a websocket multiplexálásához.
 * 
 * @param {String} channelName
 * 		a global üzeneteken kívül ezen a csatornán és hallgatózunk
 */
MosWebSockets.prototype.createChannel = function(channelName) {
	this.ioServer.of('/private/'+channelName).authorization(this.channelAuth.bind(this));
	this.ioServer.of('/private/'+channelName).on("connection", this.channelConnectionHandler.bind(this));
	
	this.logger.info("Új privát csatorna: /%s", channelName)
}

/**
 * Ha szükséges tematikus csatorna pl.: esb üzeneteknek, html komponenseknek stb akkor a csatornához
 * 		tartozó azonosítást itt lehet implementálni.
 * 
 * @see this.globalAuthorizationHandler
 */
MosWebSockets.prototype.channelAuth = function (handshakeData, callback) {
	callback("Nincs támogatott csatorna", false);
}

/**
 * Tematikus csatornához történő csatlakozáskor használható eseménykezelő.
 * Itt kell definiálni a különböző üzenettípusokat
 *
 * @see this.globalConnectionHandler
 */
MosWebSockets.prototype.channelConnectionHandler = function(webSocketClient) {
}

module.exports = MosWebSockets;

/*
var esb = require("../esb/");

var io = false;

var host = "localhost";
var port = 8081;

var listen = function(httpServer) {
	if (httpServer)
		io = sio.listen(httpServer);
	else
		io = sio.listen(port, host);
	
	//wheter we accept or decline the connection	
	io.set('authorization', setAuth);
	//incoming connection
	io.sockets.on('connection', connectionHandler);
}

	//console.log(io.server);//TODO:-----vajon a sessionStore-t hogy szedem ki innen???
/******************Public variables*********/
//exports.io = io;
/******************Public functions*********/
//exports.listen = listen;
/*******************************************/
/*
var connectionHandler = function(webSocketClient) {
	//console.log(webSocketClient);
	//core.config-ból
	
	console.log("itt a session a websocketben");
	console.log(webSocketClient.handshake.session);
	
	//TODO: configok mehetnek kifelé a helyükre
	webSocketClient.esbSocketClient = new esb.EsbSocket({ 
				host: "meshnetwork.hu",
				//host: "localhost", 
				source: webSocketClient.handshake.session.user.name,
				webSocket: webSocketClient, 
				helloInterval: 1000});
	
	webSocketClient.esbSocketClient.connectToEsb();
	//egyenlőre úgy tűnik minden webSocketClient-hez kapcsolódó event-et itt kell hozzáadni az ojjektumhoz de jó is lesz így :D
	webSocketClient.emit('username', webSocketClient.handshake.session.user.name);
	webSocketClient.on('getloadavg', function(dest) {
		this.esbSocketClient.getLoadAvg(dest);
	})
	//TODO: kirakni de akár itt is jó illetve socketmap-ba egy bejegyzést legyártani, ha megvolt az auth akkor egy esbsocket-et mellécsapni
}
 
var setAuth = function (data, accept) {
	//this bindolva van a server objektumhoz
	//data olyasmi mint egy http req header websocket specifikus adatokkal
    if (data.headers.cookie) {
        data.cookie = parseCookie(data.headers.cookie);
        data.sessionID = data.cookie['express.sid'];
        // (literally) get the session data from the session store
        io.server.sessionStore.get(data.sessionID, function (err, session) {
            if (err || !session) {
            	console.log("---------");
                // if we cannot grab a session, turn down the connection
                accept('Error', false);
            } else {
                // save the session data and accept the connection
                data.session = session;
                accept(null, true);
            }
        });
    } else {
       return accept('No cookie transmitted.', false);
    }
}
*/
