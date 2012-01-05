/**
 * ESB tesztek
 * 
 * 
 * @author Grigore András Zsolt
 */

var esb = require("../esb/");
var fs = require("fs");

var esbSockets = new Array();
var numOfSockets = 1;
//var meshConf = { host: "meshnetwork.hu", source: "test"+i };

for (var i=0; i<numOfSockets; i++) {
	esbSockets.push(new esb.EsbSocket({ host: "meshnetwork.hu", source: "test"+i, helloInterval: 10}));
	esbSockets[i].connectToEsb();
}
