/**
 * ESB tesztek
 * 
 * 
 * @author Grigore András Zsolt
 */
json_parse = require("../utils/json_parse_rec.js");
logger = {"level" : 3};
var esb = require("../esb/");
var fs = require("fs");
var esb = require("../esb/");
var esbSockets = new Array();
var numOfSockets = 1;
//var meshConf = { host: "meshnetwork.hu"};

for (var i=0; i<numOfSockets; i++) {
	esbSockets.push(new esb.EsbSocket({ host: "192.168.1.148", port: 5521, source: "test"+i, helloInterval: 1000})); //~25 ms nél 0,03% csomagvesztés, STABLE!
	esbSockets[i].connect();
}

/*getLoadAvg = function (dest, client) {
	//console.info("[%s] get_loadavg_req-t küld %s címre", this.source, dest);
	var get_loadavg_req = new esb.api.get_loadavg_req();
	
	get_loadavg_req.header.source = client.source;
	get_loadavg_req.header.destination = dest;
	get_loadavg_req.header.session_id = "" + Math.floor(Math.random()*65535) + "";
	get_loadavg_req.header.security_id = client.esb_login_resp.header.security_id;
		
	client.writeObject(get_loadavg_req);
}

setTimeout(function(){
//	esbSockets[0].getLoadAvg("esbd1.prod@meshnetwork.hu");
    getLoadAvg("gyerman1@dev.meshnetwork.hu", esbSockets[0]),2000;
}, 2112);

/*setTimeout(function(){
//	esbSockets[0].getLoadAvg("esbd1.prod@meshnetwork.hu");
    getLoadAvg("gyerman1@dev.meshnetwork.hu", esbSockets[0]);
}, 4112);

setTimeout(function(){
//	esbSockets[0].getLoadAvg("esbd1.prod@meshnetwork.hu");
    getLoadAvg("gyerman1@dev.meshnetwork.hu", esbSockets[0]);
}, 6112);*/