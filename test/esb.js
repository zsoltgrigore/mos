/**
 * ESB tesztek
 * 
 * 
 * @author Grigore András Zsolt
 */

var esb = require("../esb/");
var fs = require("fs");

/*var srvMock = require("./dummyesbserver.js");
srvMock.listen(5521, "localhost");*/

var esbSockets = new Array();
var numOfSockets = 1;

var SocketConfig = function (host) {
  	this.source = "";
  	this.password = "test2";
  	this.host = host || "localhost";
  	this.port = 5521;
}

for (var i=0; i<numOfSockets; i++) {
	var conf = new SocketConfig("meshnetwork.hu");
	conf.source = "test"+i;
	esbSockets.push(new esb.EsbSocket(conf));
	esbSockets[i].connectToEsb();
}
