/**
 * @author Grigore András Zsolt
 */
var net = require("net");
var fs = require("fs");
var filecontent = fs.readFileSync("dummy.json", "utf8");
var os = require("os");
var esbapi = require("../esb/").api;
var getted = 0;

var server = net.createServer(function (socket) {
  socket.setNoDelay(true);
  socket.on("data", function(data) {
  	var dataStr = data.toString("utf-8");
  	console.log(dataStr);
  	var obj = JSON.parse(dataStr);
  	getted++;
  	console.log(obj.header.name + " ez a " + getted + ". csomag");
  	if (obj.header.name === 'esb_login_req') {
  		console.log('login_req');
  		socket.write(filecontent); 
  	} else {
  		
  	}
  	
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

listen(5521, "localhost");