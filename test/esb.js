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
//var meshConf = { host: "meshnetwork.hu"};

for (var i=0; i<numOfSockets; i++) {
	esbSockets.push(new esb.EsbSocket({ host: "meshnetwork.hu", source: "test"+i, helloInterval: 1000}));
	esbSockets[i].connectToEsb();
}

setTimeout(function(){
	esbSockets[0].getLoadAvg("esbd1.prod@meshnetwork.hu");
}, 3500)
