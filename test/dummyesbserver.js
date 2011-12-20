/**
 * @author Grigore András Zsolt
 */
var net = require("net");
var fs = require("fs");
var filecontent = fs.readFileSync("dummy.json", "utf8")
var os = require("os");

var server = net.createServer(function (socket) {
  socket.setNoDelay(true);
  socket.on("data", function(data) {
  	var dataStr = data.toString();
  	console.log(dataStr+"\n");
  	socket.write(filecontent); 
  });
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

function listen (port, host) {
server.listen(port, host);
console.info("dummyserver started on %s: %d", host, port);
}

module.export = server;
exports.listen = listen;