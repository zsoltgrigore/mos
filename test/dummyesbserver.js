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
		case "eps_get_memory_profile_and_value_req":
			var epsGetMemoryProfileAndValueResp = new eps_get_memory_profile_and_value_resp();
			epsGetMemoryProfileAndValueResp.header.source = "dummy@localhost";
			epsGetMemoryProfileAndValueResp.header.destination = obj.header.source;
			epsGetMemoryProfileAndValueResp.header.session_id = obj.header.session_id;
			epsGetMemoryProfileAndValueResp.header.security_id = obj.header.security_id;
			socket.write(JSON.stringify(epsGetMemoryProfileAndValueResp));
			break;
		default:
			console.log("Ismeretlen üzenet, nincs válasz!");
  	}
  });
});

/*******Project Specific MCP**********/
/**********Refrigeratory**************/
function eps_get_device_list_req() {
	this.data = {
	},
	 this.header = {
		destination : "control@fridge.integ.meshnetwork.hu",
		name : "eps_get_device_list_req",
		protocol : "mcp5",
		security_id : "",
		session_id : "",
		source : ""
	}
}
console.log(JSON.stringify(new eps_get_device_list_req()));

function eps_get_device_list_resp() {
	this.data = {
		devices : [
			"eps0.attila@fridge.integ.meshnetwork.hu",
			"eps1.attila@fridge.integ.meshnetwork.hu"
		]
	},
	 this.header = {
		destination : "",
		name : "eps_get_device_list_resp",
		protocol : "mcp5",
		security_id : "",
		session_id : "",
		source : "control@fridge.integ.meshnetwork.hu"//fridge_control@dev.meshnetwork.hu
	}
}
console.log(JSON.stringify(new eps_get_device_list_resp()));

function eps_get_memory_profile_and_value_req() {
	this.data = {
		//ha a req-ben a "devices" lista üres akkor minden
		//  saját eps-nek a profilját és snapshot-ját
		//  visszaadja
		devices : [
				"eps0.attila@fridge.integ.meshnetwork.hu",
				"eps1.attila@fridge.integ.meshnetwork.hu"
		]
	},
	this.header = {
		destination : "control@fridge.integ.meshnetwork.hu",
		name : "eps_get_memory_profile_and_snapshot_req",
		protocol : "mcp5",
		security_id : "",
		session_id : "",
		source : ""
	}
}
console.log(JSON.stringify(new eps_get_memory_profile_and_value_req()));

function eps_get_memory_profile_and_value_resp() {
	this.data = {
		devices : {
			"eps0.attila@fridge.integ.meshnetwork.hu": {
				"device": {
					"register_map": {
						"sys":["sys0"],
						"in":["in0", "in1"],
						"ext":["ext0", "ext1"],
					},
					"description": {
						"sys0":"Timer",
						"ext0":"Valami",
						"ext1":"ASD",
						"in0":"",
						"in1":"134",
					},	
					"value": {
						"sys0":"100",
						"ext0":"34",
						"ext1":"144",
						"in0":"4",
						"in1":"134",
					}
				},
				"gui": {
					"status_page": [
						{
							"sensor_name": "Jobb oldali hűtő belső kamrája",
							"value": "ext34*256+ext35",
							"high_alarm_value": "usr0",
							"low_alarm_value": "usr1",
							"high_limit_alarm_enabled": "usr2",
							"low_limit_alarm_enabled": "usr3",
							"high_alarm_ack": "usr4",
							"low_alarm_ack": "usr5"
						},
						{
							"sensor_name": "Bal oldali hűtő belső kamrája",
							"value": "ext134,ext135",
							"high_alarm_value": "usr100",
							"low_alarm_value": "usr101",
							"high_limit_alarm_enabled": "usr102",
							"low_limit_alarm_enabled": "usr103",
							"high_alarm_ack": "usr104",
							"low_alarm_ack": "usr105"
						}
					]
				}
			},
			"eps1.attila@fridge.integ.meshnetwork.hu": {
				"device": {
					"register_map": {
						"sys":["sys0"],
						"in":["in0", "in1"],
						"ext":["ext34", "ext35"],
						"usr": ["usr0", "usr1", "usr2", "usr3", "usr4", "usr5"]
					},
					"description": {
						"sys0":"Timer",
						"in0":"",
						"in1":"134",
						"ext34":"Valami",
						"ext35":"ASD"
					},	
					"value": {
						"sys0":"100",
						"in0":"4",
						"in1":"134",
						"ext34":"34",
						"ext35":"144"
					}
				},
				"gui": {
					"status_page": [
						{
							"sensor_name": "Jobb oldali hűtő belső kamrája",
							"value": "ext34,ext35",
							"high_alarm_value": "usr0",
							"low_alarm_value": "usr1",
							"high_limit_alarm_enabled": "usr2",
							"low_limit_alarm_enabled": "usr3",
							"high_alarm_ack": "usr4",
							"low_alarm_ack": "usr5"
						},
						{
							"sensor_name": "Bal oldali hűtő belső kamrája",
							"value": "ext134,ext135",
							"high_alarm_value": "usr100",
							"low_alarm_value": "usr101",
							"high_limit_alarm_enabled": "usr102",
							"low_limit_alarm_enabled": "usr103",
							"high_alarm_ack": "usr104",
							"low_alarm_ack": "usr105"
						}
					]
				}
			}
		}
	};
	this.header = {
		destination : "",
		name : "eps_get_memory_profile_and_value_resp",
		protocol : "mcp5",
		security_id : "",
		session_id : "",
		source : "control@fridge.integ.meshnetwork.hu"
	}
}
console.log(JSON.stringify(new eps_get_memory_profile_and_value_resp()));

function eps_memory_change_notify() {
	this.data = {
		devices : {
			"eps0.attila@fridge.integ.meshnetwork.hu": {
				"register" : ["sys0", "in1"],
				"value": ["24", "0"]
			},
			"eps1.attila@fridge.integ.meshnetwork.hu": {
				"register" : ["sys0", "in1"],
				"value": ["24", "0"]
			}
		}
	},
	this.header = {
		destination : "",
		name : "eps_memory_change_notify",
		protocol : "mcp5",
		security_id : "",
		session_id : "",
		source : "control@fridge.integ.meshnetwork.hu"
	}
}
console.log(JSON.stringify(new eps_memory_change_notify()));

/***********************************************************/

		function registerValueToInt(string) {
			var valueArray = string.split(",");
			valueArray.reverse();
			console.log(valueArray);
			var ret = 0;
			for (var i = 0; i < valueArray.length; i++){
				ret += valueArray[i] * (256, i);
			}
			return ret;
		}
		
console.log(registerValueToInt("2,100"));

function listen (port, host) {
server.listen(port, host);
console.info("dummyserver started on %s: %d", host, port);
}

listen(5521, "localhost");
