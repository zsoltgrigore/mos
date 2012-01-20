/**
 * @author Grigore András Zsolt
 */
var sio = require("socket.io");
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
		
	//incoming connection
	io.sockets.on('connection', connectionHandler);
}

/******************Public variables*********/
exports.io = io;
/******************Public functions*********/
exports.listen = listen;
/*******************************************/

var connectionHandler = function(webSocketClient) {
	//console.log(webSocketClient);
	//core.config-ból
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