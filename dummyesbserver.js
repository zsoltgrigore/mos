/**
 * @author Grigore András Zsolt
 */
var net = require("net");
var fs = require("fs");
var filecontent = fs.readFileSync("dummy.json", "utf8")
var os = require("os");
var storeOneSocket;


var server = net.createServer(function (socket) {
  socket.setNoDelay(true);
  storeOneSocket = socket;
});

storeOneSocket.on("data", function(data) {
  	var dataStr = data.toString();
  	console.log(dataStr+"\n");
  	
});

function sendBigJson(socket){
  socket.write(filecontent.slice(0,300));
  setTimeout(function () {  
  	socket.write(filecontent.slice(300));;  
  }, 2000)
}

function sendLoadAvg(socket){
  	socket.write(os.loadavg());
}

server.listen(2525, "localhost");