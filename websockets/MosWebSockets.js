/**
 * @author Grigore András Zsolt
 */
var sio = require("socket.io");
var parseCookie = require('connect').utils.parseCookie;
var Session = require('connect').middleware.session.Session;
var Logger = require('../utils/Logger');
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
 * Itt csatolunk a szerver egyetlen eseményéhez, kezelő függvényt (connectionHandler)
 *
 * @param {MosHttp} mosHttp
 *		egy MosHttp osztály példány
 *
 */
MosWebSockets.prototype.listen = function (mosHttp) {
	if (mosHttp) {
		this.http = mosHttp;
		this.http.on("new auth chan req", this.createChannel.bind(this));
		this.ioServer = sio.listen(mosHttp.server);
	} else {
		this.ioServer = sio.listen(port, host);
	}

	this.ioServer.set('log level', this.logger.level);
//	this.ioServer.enable('browser client minification');  // send minified client
	this.ioServer.enable('browser client etag');          // apply etag caching logic based on version number
//	io.enable('browser client gzip');          // gzip the file
	
	this.ioServer.set('authorization', this.globalAuthorizationHandler.bind(this));
};


/**
 * A globalis kapcsolódásokat eldobjuk.
 * TODO: el kéne rejteni a route-t is ha lehet és akkor nem kell.
 * 	//ne is lehessen csak csatornára kapcsolódni ehhez security anyag itt:
 *  //http://stackoverflow.com/questions/7450445/socket-io-security-issues
 *
 * @param {Object} handshakeData
 * @param {fn} callback(error,isAccept)
 * 		error {String} milyen hiba
 *		isAccept {Boolean} elfogadjuk-e a kapcsolódást?
 *
 */
MosWebSockets.prototype.globalAuthorizationHandler = function (handshakeData, callback) {
	callback(null, true);
}


MosWebSockets.prototype.createChannel = function(channelName) {
	this.ioServer.set('authorization', this.globalAuthorizationHandler.bind(this));
	this.ioServer.of('/private/'+channelName).authorization(this.channelAuth.bind(this));
	//channel req handler-be mehet kifelé
	//a user csatornájához itt namespace authentikációt és eseménykezelőket rendelünk
	//ha x másodpercen belül nem érkezik kapcsolódási request akkor valami nem okés (elnavigált a user vagy bezárta a böngészőt)
	//		ezért x másodperc után eltakarítunk mindent és érvénytelenítjük a session-t
	console.log("The channel name is %s", channelName);
}

/*
function (handshakeData, callback) {
	  console.dir(handshakeData);
	  handshakeData.foo = 'baz';
	  callback(null, true);
	}).on('connection', function (socket) {
	  console.dir(socket.handshake.foo);
	}
*/

/**
 * @see this.globalAuthorizationHandler
 */
MosWebSockets.prototype.channelAuth = function (handshakeData, callback) {
	//this bindolva van a server objektumhoz
	//data olyasmi mint egy http req header websocket specifikus adatokkal
	
    if (handshakeData.headers.cookie) {
		console.log(handshakeData);
		console.log("asdfg");
		console.log(handshakeData.cookie);
        handshakeData.cookie = parseCookie(handshakeData.headers.cookie);
        handshakeData.sessionID = handshakeData.cookie['express.sid']; 			//ezt express példányból is ki lehet szedni (express.session!)
        // (literally) get the session data from the session store
		//console.log(this.ioServer.server);
        this.http.sessionStore.get(handshakeData.sessionID, function (err, session) {
            if (err || !session) {
            	console.log("---------");
                // if we cannot grab a session, turn down the connection
                callback('Error', false);
            } else {
                // save the session data and accept the connection
                handshakeData.session = session;
                callback(null, true);
            }
        });
    } else {
       return callback('No cookie transmitted.', false);
    }
	console.log(handshakeData);

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
