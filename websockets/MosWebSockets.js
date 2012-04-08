/**
 * @author Grigore András Zsolt
 */
var sio = require("socket.io");
var parseCookie = require('connect').utils.parseCookie;
var Session = require('connect').middleware.session.Session;
var Logger = require('../utils/Logger');
var EsbSocket = require('../esb/').EsbSocket;
var User = require('./User');

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
	this.loggedInUsers = {};
	
	//Nem annyira publikus változók
	//-----------------------------
	this.ioServer = false;
	this.logger = new Logger({target : "MosWebSockets<Server>"});
}

/**
 * Hallgatózás: ha van parméterben egy futó http vagy https szerver akkor azt használjuk
 *				ha nincs akkor konstruktorban megadott host és port értékeket
 * Itt csatolunk a szerver egyetlen eseményéhez, kezelő függvényt (connectionHandler)
 *
 * @param {MosHttp} mosHttp
 *		egy MosHttp osztály példány
 *
 */
MosWebSockets.prototype.listen = function (mosHttp) {
	if (mosHttp)
		this.ioServer = sio.listen(mosHttp.server);
	else
		this.ioServer = sio.listen(port, host);

	this.ioServer.set('log level', this.logger.level);
	
	this.ioServer.set('authorization', this.globalAuthorizationHandler.bind(this));
	this.ioServer.sockets.on('connection', this.connectionHandler.bind(this));
};

MosWebSockets.prototype.globalAuthorizationHandler = function (data, accept) {
	//this bindolva van a server objektumhoz
	//data olyasmi mint egy http req header websocket specifikus adatokkal
	/*
    if (data.headers.cookie) {
        data.cookie = parseCookie(data.headers.cookie);
        data.sessionID = data.cookie['express.sid']; 			//ezt express példányból is ki lehet szedni (express.session!)
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
    }*/
	console.log(data);
	accept(null, true);
}

/**
 * Kliens kapcsolódáskor hívódik meg, egyenlőre még képlékeny
 * TODO: auth!
 *
 * @param {Object} webSocketClient
 *		A kapcsolódott klienst reprezentáló objektum
 */
MosWebSockets.prototype.connectionHandler = function(webSocketClient) {
	//console.log("itt a session a websocketben");
	//console.log(webSocketClient.handshake.session);
	//this.loggedInUsers['gui1@dev.meshnetwork.hu'] = new User('gui1@dev.meshnetwork.hu', 'test2', )
	
	
	
	/*
	webSocketClient.esbSocketClient = new EsbSocket(configuration.esb);
	webSocketClient.esbSocketClient.source = "gui1@dev.meshnetwork.hu";
	webSocketClient.esbSocketClient.password = "test2";
	
	webSocketClient.esbSocketClient.connect();
	
	webSocketClient.esbSocketClient.on("succesfull login", function(message){
		message.header.security_id = "ChangeMe!:)";
		webSocketClient.emit("succesfull login", message);
	});
	
	webSocketClient.esbSocketClient.on("web message", function(eventType, payload){
		console.log("%s emitted", eventType);
		console.log(payload);
		webSocketClient.emit(eventType, payload);
	});
	
	webSocketClient.on('esb message', function(message) {
		message.header.security_id = webSocketClient.esbSocketClient.securityId;
		console.log(message);
		webSocketClient.esbSocketClient.writeObject(message);
	});
	
	webSocketClient.on('disconnect', function () {
		webSocketClient.esbSocketClient.end();
    	delete webSocketClient.esbSocketClient;
  	});*/
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