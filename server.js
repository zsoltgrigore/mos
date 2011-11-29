var net = require("net");
var express = require("express");
var sio = require("socket.io");
var fs = require("fs");

/**
 * Load content
 */
var index = fs.readFileSync('staticview/index.html', 'utf-8'); 

/**
* App.
*/

var app = express.createServer();

/**
* App configuration.
*/

app.configure(function () {
  app.use(express.static(__dirname + '/public'));
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

var io = sio.listen(app), nicknames = {};

io.sockets.on('connection', function (websocket) {
  websocket.on('user message', function (msg) {
    websocket.broadcast.emit('user message', websocket.nickname, msg);
  });
  
  websocket.on('mcp connect', function (msg) {
    console.log("connect to mcp");
    /*itt meghívjuk az mcp connect függvényt aminek a callback-je visszaír webre egy connected-t*/
    /*és beteszi magát a nicknames objectbe a username mellé */
    /*ezután használhatjuk azt a referenciát az üzenet továbbítására és fogadására*/
    /*de a visszaérkező üzenet vajon hogyan kerül ehhez a userhez??? hát egyelőre broadcast*/ 
  });
  
  websocket.on('mcp message', function (msg) {
    console.log(msg + " <- sended by:" + websocket.nickname);
    websocket.emit('mcp message', websocket.nickname, "ide jön a socket response")
    /*itt esbsocket.send aminek a callback-je megkapja a websocketet*/
  });

  websocket.on('nickname', function (nick, fn) {
    if (nicknames[nick]) {
      fn(true);
    } else {
      fn(false);
      nicknames[nick] = websocket.nickname = nick;
      websocket.broadcast.emit('announcement', nick + ' connected');
      io.sockets.emit('nicknames', nicknames);
    }
  });

  websocket.on('disconnect', function () {
    if (!websocket.nickname) return;

    delete nicknames[websocket.nickname];
    websocket.broadcast.emit('announcement', websocket.nickname + ' disconnected');
    websocket.broadcast.emit('nicknames', nicknames);
  });
});

/**
 * PostFix connection
 */
/*
var socket = net.createConnection(2525, "91.82.98.3");
socket.setEncoding("utf8");
socket.setTimeout(1000, sendHi);

function sendHi(){
	socket.write("hello\r\n")
}
 
socket.on("connect", function(){
        socket.on("data", function(data){
                //ha jön data akkor az menjen ki websocketen a kliensnek
                //majd a beírt utasítást küldjük socketen telnetnek
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