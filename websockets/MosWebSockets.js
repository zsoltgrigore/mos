/**
 * @author Grigore András Zsolt
 */
var sio = require("socket.io");
var parseCookie = require('connect').utils.parseCookie;
var Session = require('connect').middleware.session.Session;
var Logger = require('../utils/Logger');
var EsbSocket = require('../esb/').EsbSocket;
var User = require('./User');

var MosWebSockets = function (mosWebSocketsConfig) {
	mosWebSocketsConfig = mosWebSocketsConfig || {};
	
	//Publikus változók
	//-----------------
	this.host = mosWebSocketsConfig.host || "localhost";
	this.port = mosWebSocketsConfig.port || 8080;
	this.loggedInUsers = {};
	this.eventsToListen = ["connected", "reconnecting", "succesfull login", "access denied"];
	
	//Nem annyira publikus változók
	//-----------------------------
	this.io = false;
	this.logger = new Logger({target : "MosWebSockets<Server>"});
	
}

MosWebSockets.prototype.listen = function (mosHttp) {
	if (mosHttp)
		this.io = sio.listen(mosHttp.server);
	else
		this.io = sio.listen(port, host);
	
	this.io.sockets.on('connection', this.connectionHandler.bind(this));
};

MosWebSockets.prototype.connectionHandler = function(webSocketClient) {
	console.log("itt a session a websocketben");
	console.log(webSocketClient.handshake.session);
	
	//this.loggedInUsers['gui1@dev.meshnetwork.hu'] = new User('gui1@dev.meshnetwork.hu', 'test2', )
	
	webSocketClient.esbSocketClient = new EsbSocket(configuration.esb);
	webSocketClient.esbSocketClient.source = "gui1@dev.meshnetwork.hu";
	webSocketClient.esbSocketClient.password = "test2";
	
	webSocketClient.esbSocketClient.connect();
	
	webSocketClient.esbSocketClient.on("succesfull login", function(message){
		webSocketClient.emit("succesfull login", message);
	})
	
	webSocketClient.esbSocketClient.on("web message", function(eventType, payload){
		console.log("%s emitted", eventType);
		console.log(payload);
		webSocketClient.emit(eventType, payload);
	})
	
	webSocketClient.on('esb message', function(message) {
		console.log(message);
		webSocketClient.esbSocketClient.writeObject(message);
	})
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