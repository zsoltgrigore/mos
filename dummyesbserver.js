/**
 * @author Grigore András Zsolt
 */
var net = require("net");
var fs = require("fs");
var filecontent = fs.readFileSync("dummy.json", "utf8")



var server = net.createServer(function (socket) {
  socket.write(filecontent.slice(0,300));
  setTimeout(function () {  
  	socket.end(filecontent.slice(300));;  
  }, 2000) 
});

server.listen(2525, "localhost");