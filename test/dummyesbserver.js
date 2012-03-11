/**
 * @author Grigore András Zsolt
 */
var net = require("net");
var fs = require("fs");
var os = require("os");
var esb = require("../esb/");
var getted = 0;
var xyRespData = 0;
var xyRespSent = 0;

var server = net.createServer(function (socket) {
  socket.setNoDelay(true);
  socket.on("data", function(data) {
  	var dataStr = data.toString("utf-8");
  	console.log(dataStr);
  	try {
  		var obj = JSON.parse(dataStr);
  	} catch (e) {
  		console.log("   nem sikerült parszolni!!!")
  	}
  	getted++;
  	console.log(obj.header.name + " ez a " + getted + ". csomag");
  	switch(obj.header.name) {
		case "esb_login_req":
			var esb_login_resp = new esb.api.esb_login_resp();
			esb_login_resp.header.source = "dummy@localhost";
			esb_login_resp.header.destination = obj.header.source;
			esb_login_resp.header.session_id = obj.header.session_id;
			esb_login_resp.header.security_id = "" + Math.floor(Math.random()*255000) + "";
			esb_login_resp.data.login_success = "1";
			socket.write(JSON.stringify(esb_login_resp));
			break; 
		case "esb_hello_req":
			var esb_hello_resp = new esb.api.esb_hello_resp();
			esb_hello_resp.header.source = "dummy@localhost";
			esb_hello_resp.header.destination = obj.header.source;
			esb_hello_resp.header.session_id = obj.header.session_id;
			esb_hello_resp.header.security_id = obj.header.security_id;
			socket.write(JSON.stringify(esb_hello_resp));
			break;
		case "get_loadavg_req":
			var get_loadavg_resp = new esb.api.get_loadavg_resp();
			get_loadavg_resp.header.source = "dummy@localhost";
			get_loadavg_resp.header.destination = obj.header.source;
			get_loadavg_resp.header.session_id = obj.header.session_id;
			get_loadavg_resp.header.security_id = obj.header.security_id;
			var osloadavg = os.loadavg();
			get_loadavg_resp.data.loadavg = "" + osloadavg[0] + " " + osloadavg[1] + " " + osloadavg[2];
			socket.write(JSON.stringify(get_loadavg_resp));
			break;
		case "agv_get_xy_req":
			var agvGetXYResp = new agv_get_xy_resp();
			agvGetXYResp.header.source = "dummy@localhost";
			agvGetXYResp.header.destination = obj.header.source;
			agvGetXYResp.header.session_id = obj.header.session_id;
			agvGetXYResp.header.security_id = obj.header.security_id;
			agvGetXYResp.data.x = ++xyRespData;
			agvGetXYResp.data.y = 10000 + xyRespData;
			agvGetXYResp.data.phi = 50000 + xyRespData;
			socket.write(JSON.stringify(agvGetXYResp));
			console.log("#getXPResp: %d", ++xyRespSent)
			break;
		default:
			console.log("Ismeretlen üzenet, nincs válasz!");
  	}
  });
});

function agv_get_xy_resp() {
	this.header = {
		protocol :"mcp5",
		name : "agv_get_xy_resp",
        source : "",
        destination : "",
        session_id : "",
        security_id : ""
	};
	this.data = {
		x: "",
       	y:  "",
       	phi: ""
	};
}

function listen (port, host) {
server.listen(port, host);
console.info("dummyserver started on %s: %d", host, port);
}

listen(5521, "localhost");