/**
 * @author Grigore András Zsolt
 */
var net = require("net");
var fs = require("fs");
var os = require("os");
var esb = require("../esb/");
var jsontool = require('jsontool');
var getted = 0;
var xyRespData = 0;
var xyRespSent = 0;
var randomTimerId = false;
var obj = false;
var iteratorKey = 100;

var server = net.createServer(function (socket) {

randomTimer.call(function() {
		var changeNotify = new eps_memory_change_notify(++iteratorKey);
		changeNotify.header.source = "dummy@localhost";
		if (obj) {
			changeNotify.header.destination = obj.header.source;
			changeNotify.header.session_id = obj.header.session_id;
			changeNotify.header.security_id = obj.header.security_id;
			socket.write(JSON.stringify(changeNotify));
			console.log(changeNotify);
		}
	});

socket.setNoDelay(true);
socket.on("data", function(data) {
	var dataStr = data.toString("utf-8");
	console.log(dataStr);
	try {
		obj = JSON.parse(dataStr);
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
		case "memdb_get_req":
			if (obj.data.path == "attila@integ.meshnetwork.hu::business_details::device_list") {
				var memdbGetResp = new memdb_get_resp1();
				memdbGetResp.header.source = "dummy@localhost";
				memdbGetResp.header.destination = obj.header.source;
				memdbGetResp.header.session_id = obj.header.session_id;
				memdbGetResp.header.security_id = obj.header.security_id;
				socket.write(JSON.stringify(memdbGetResp));
			} else {
				if (obj.data.path == "eps0.attila@fridge.integ.meshnetwork.hu::::") {
					var memdbGetResp = new memdb_get_resp2();
					memdbGetResp.header.source = "dummy@localhost";
					memdbGetResp.header.destination = obj.header.source;
					memdbGetResp.header.session_id = obj.header.session_id;
					memdbGetResp.header.security_id = obj.header.security_id;
					socket.write(JSON.stringify(memdbGetResp));
					console.log(memdbGetResp);
				} else {
					console.log(obj.data.path);
				}
			}
			break;
		default:
			console.log("Ismeretlen üzenet, nincs válasz!");
  	}
  });
});

function randomTimer() {
	this();
	var randomTime = Math.floor((Math.random()*10)+10)*1000;
	console.log(randomTime);
	
	if (randomTimerId) {
		clearTimeout(randomTimerId);
	}
	
	randomTimerId = setTimeout(randomTimer.bind(this), randomTime);
}
/*******DB Specific MCP***********/
function memdb_get_req() {
	this.data = {
		path: ""
	},
	 this.header = {
		destination : "ANY",
		name : "memdb_get_req",
		protocol : "mcp5",
		security_id : "",
		session_id : "",
		source : ""
	}
}

function memdb_get_resp1() {
	this.data = {
		value: "[\"eps0.attila@fridge.integ.meshnetwork.hu\"]"
	},
	 this.header = {
		destination : "ANY",
		name : "memdb_get_resp",
		protocol : "mcp5",
		security_id : "",
		session_id : "",
		source : "esbd1.prod@meshnetwork.hu"
	}
}

/*
            {\"register_description\": {\"101\": \"1. contact Input\",\"102\": \"2. Contact Input\",
            \"301\": \"High Alarm Value\", \"302\": \"Low alarm Value\", \"303\": \"High Limit Alarm Enabled\",
            \"304\": \"Low Limit Alarm Enabled\", \"305\": \"High Alarm Ack\", \"306\": \"Low Alarm Ack\",
            \"1001\": \"External modbus slave #1 register\" },
            \"register_value\": { \"101\": \"0\", \"102\": \"0\", \"301\": \"10\", \"302\": \"4\", \"303\": \"1\",
            \"304\": \"0\", \"305\": \"0\", \"306\": \"0\", \"1001\": \"8\" } }*/

function memdb_get_resp2() {
	this.data = {
		value: "{\"register_description\": {\"301\": \"High Alarm Value\", \"302\": \"Low alarm Value\", \"303\": \"High Limit Alarm Enabled\","
				+"\"304\": \"Low Limit Alarm Enabled\", \"305\": \"High Limit Error\", \"306\": \"Low Limit Error\","
				+"\"1256\": \"External modbus slave #1 register\" },"
				+"\"register_value\": { \"301\": \"350\", \"302\": \"200\", \"303\": \"1\","
				+"\"304\": \"0\", \"305\": \"1\", \"306\": \"0\", \"1256\": \"260\" } }"
	},
	 this.header = {
		destination : "ANY",
		name : "memdb_get_resp",
		protocol : "mcp5",
		security_id : "",
		session_id : "",
		source : "esbd1.prod@meshnetwork.hu"
	}
}

var value = "{\"register_description\": {\"101\": \"1. contact Input\",\"102\": \"2. Contact Input\","
				+"\"301\": \"High Alarm Value\", \"302\": \"Low alarm Value\", \"303\": \"High Limit Alarm Enabled\","
				+"\"304\": \"Low Limit Alarm Enabled\", \"305\": \"High Alarm Ack\", \"306\": \"Low Alarm Ack\","
				+"\"1001\": \"External modbus slave #1 register\" },"
				+"\"register_value\": { \"101\": \"0\", \"102\": \"0\", \"301\": \"10\", \"302\": \"4\", \"303\": \"1\","
				+"\"304\": \"0\", \"305\": \"0\", \"306\": \"0\", \"1001\": \"8\" } }";
console.log(value);

var stringify = {};
stringify.kerdes = JSON.stringify(new memdb_get_resp2());
console.log(JSON.stringify(new memdb_get_resp2()));
console.log(JSON.stringify(stringify));

var object = JSON.parse(JSON.stringify(stringify));
console.log(object.kerdes);

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
console.log(" ");

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
console.log(" ");

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
console.log(" ");

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
console.log(" ");

function eps_memory_change_notify(val) {
	this.data = {
		"eps0.attila@fridge.integ.meshnetwork.hu": {
			"1256": "" + val
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
console.log(" ");

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
console.log(" ");

function listen (port, host) {
server.listen(port, host);
console.info("dummyserver started on %s: %d", host, port);
}

listen(5521, "localhost");
