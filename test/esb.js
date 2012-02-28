/**
 * ESB tesztek
 * 
 * 
 * @author Grigore András Zsolt
 */
json_parse = require("../utils/json_parse_rec.js");
logger = {"level" : 2};
var esb = require("../esb/");
var fs = require("fs");

var esbSockets = new Array();
var numOfSockets = 1;
//var meshConf = { host: "meshnetwork.hu"};

for (var i=0; i<numOfSockets; i++) {
	esbSockets.push(new esb.EsbSocket({ /*host: "meshnetwork.hu",*/ source: "test"+i, helloInterval: 1000}));
	esbSockets[i].connect();
}

setTimeout(function(){
//	esbSockets[0].getLoadAvg("esbd1.prod@meshnetwork.hu");
	esbSockets[0].getLoadAvg("gyerman1@dev.meshnetwork.hu");
}, 3500)
