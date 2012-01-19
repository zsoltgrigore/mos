var net = require("net");
var express = require("express");
var sio = require("socket.io");
var fs = require("fs");

/**
 * Load content
 */
var index = fs.readFileSync('http/staticview/index.html', 'utf-8'); 

/**
* App.
*/

var app = express.createServer();

/**
* App configuration.
*/

app.configure(function () {
  app.use(express.static(__dirname + '/http/public'));
});

/**
* App routes.
*/

app.get('/', function (req, res) {
  res.contentType("text/html");
  res.send(index);
});

/**
* App listen.
*/

app.listen(8080, function () {
  var addr = app.address();
  console.log(' app listening on http://' + addr.address + ':' + addr.port);
});

/**
* Socket.IO server (single process only)
*/

var io = sio.listen(app);
var nicknames = {};
var mcpsocketmap = {};

io.sockets.on('connection', function (websocket) {
  websocket.on('user message', function (msg) {
    websocket.broadcast.emit('user message', websocket.nickname, msg);
  });
  
  websocket.on('connect to mcp', function (fn) {
    fn(true, "connected");
    //mcpsocketmap[websocket.nickname].connect(2525, "91.82.98.3", mcpConnectionSuccess(fn, this));
    mcpsocketmap[websocket.nickname].connect(2525, "91.82.98.3", function() {
    	console.log("connect to mcp");
    	mcpsocketmap[websocket.nickname].on("data", function(data){
                //ha jön data akkor az menjen ki websocketen a kliensnek
                //majd a beírt utasítást küldjük socketen postfix-nek
                //console.log(data.toString());
                websocket.emit('mcp message', "MCP2me", data)
                mcpsocketmap[websocket.nickname].write("QUIT\r\n");
        });
    	
    });
    
    mcpsocketmap[websocket.nickname].on("end", function(){
		websocket.emit('mcp message', "MCP2me", "end");
        // can be done else where, is similar to http .end("data", encoding);
        mcpsocketmap[websocket.nickname].end();
        // cleans up the socket.
        //socket.destroy();

	});
    
    /*itt meghívjuk az mcp connect függvényt aminek a callback-je visszaír webre egy connected-t*/
    /*és beteszi magát a nicknames objectbe a username mellé */
    /*ezután használhatjuk azt a referenciát az üzenet továbbítására és fogadására*/
    /*de a visszaérkező üzenet vajon hogyan kerül ehhez a userhez??? hát egyelőre broadcast*/ 
  });
  
  websocket.on('mcp message', function (msg) {
    console.log(msg + " <- sended by:" + websocket.nickname);
    websocket.emit('mcp message', websocket.nickname, "ide jön a socket response");
    /*itt esbsocket.send aminek a callback-je megkapja a websocketet*/
  });

  websocket.on('nickname', function (nick, fn) {
    if (nicknames[nick]) {
      fn(true);
    } else {
      fn(false);
      nicknames[nick] = websocket.nickname = nick;
      
      //Érdekes hogy elvileg a type-on kívül minden egyébb config opció default értéket kap mégis
      //ha configot beadom akkor szanszét esik arra hivatkozva hogy "Socket already opened"
      //http://nodejs.org/docs/latest/api/net.html#new_net.Socket
      mcpsocketmap[nick] = new net.Socket(/*{fd: null, type: 'tcp4', allowHalfOpen: false}*/);
      mcpsocketmap[nick].setEncoding('utf8'); 
      
      websocket.broadcast.emit('announcement', nick + ' connected');
      io.sockets.emit('nicknames', nicknames);
    }
  });

  websocket.on('disconnect', function () {
    if (!websocket.nickname) return;

    delete nicknames[websocket.nickname];
    //szépen socket.end()-el kell lezárni 
    //de ha kilövi a böngészőt vagy frissíti az oldalt akkor töröljük a nevét
    //hiábe jön több üzenet a socketen nem tudjuk kinek érkezett inkább destroy() egyelőre
    mcpsocketmap[websocket.nickname].destroy();
    delete mcpsocketmap[websocket.nickname];
    websocket.broadcast.emit('announcement', websocket.nickname + ' disconnected');
    websocket.broadcast.emit('nicknames', nicknames);
  });
});

var mcpConnectionSuccess = function (websocketCallback, websocket) {
	websocketCallback(true, "Connection established!");
	console.log(websocket);
	console.log("vajon van különbség?\n\n");
	console.log(this);
}
var mcpConnectionFailure = function (exception, thiSocket, websocketCallback) {
	websocketCallback(false, "valami hiba");
	console.log("error oCCured\n");
	console.log(exception);
	console.log(thiSocket);
}

/**
 * PostFix connection
 */
/*
var socket = net.createConnection(2525, "91.82.98.3");
socket.setEncoding("utf8");
socket.setTimeout(1000, sendHi);

function sendHi(){
	socket.write("\r\n")
}
 
socket.on("connect", function(){
        socket.on("data", function(data){
                //ha jön data akkor az menjen ki websocketen a kliensnek
                //majd a beírt utasítást küldjük socketen postfix-nek
                console.log(data);
                socket.write("QUIT\r\n");
        });
        //console.log("Echo Client\r\n");
        //socket.write("Echo Client\r\n");
});

socket.on("end", function(){
		console.log("end");
        // can be done else where, is similar to http .end("data", encoding);
        socket.end();
        // cleans up the socket.
        socket.destroy();

});*/