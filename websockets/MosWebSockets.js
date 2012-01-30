/**
 * @author Grigore András Zsolt
 */
var sio = require("socket.io");
var parseCookie = require('connect').utils.parseCookie;
var esb = require("../esb/");

var io = false;

var host = "localhost";
var port = 8081;
nicknames = [];

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
exports.io = io;
/******************Public functions*********/
exports.listen = listen;
/*******************************************/

var connectionHandler = function(webSocketClient) {
	//console.log(webSocketClient);
	//core.config-ból
	
	console.log('A socket with sessionID ' + webSocketClient.handshake.sessionID + ' connected!');
	
	webSocketClient.esbSocketClient = new esb.EsbSocket({ 
				//host: "meshnetwork.hu",
				host: "localhost", 
				source: "test",
				webSocket: webSocketClient, 
				helloInterval: 1000});
	//egyenlőre úgy tűnik minden webSocketClient-hez kapcsolódó event-et itt kell hozzáadni az ojjektumhoz
	webSocketClient.on('nickname', addUser);
	//TODO: kirakni de akár itt is jó illetve socketmap-ba egy bejegyzést legyártani, ha megvolt az auth akkor egy esbsocket-et mellécsapni
}
 
var setAuth = function (data, accept) {
    if (data.headers.cookie) {
        data.cookie = parseCookie(data.headers.cookie);
        data.sessionID = data.cookie['express.sid'];
       	console.log(data);
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

var addUser = function (nick, fn) {
    if (nicknames[nick]) {
      fn(true);
    } else {
      fn(false);
	  nicknames.push(nick);

      this.broadcast.emit('announcement', nick + ' connected');
      io.sockets.emit('nicknames', nicknames);
      this.esbSocketClient.connectToEsb();
      console.log(this);
    }
  }