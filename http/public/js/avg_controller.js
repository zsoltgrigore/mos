var socket = io.connect();
var msgsent = 0;
var msgreceived = 0;

var source = "";
var destination = "agv1.miskolc@dev.gammadigital.hu";
var sendmsgEnabled = false;

var setIntervalId = false;
var setTimeoutId = false;

//agv_get_xy_req üzenetet reprezentáló osztály
function agv_get_xy_req() {
	this.header = {
		protocol:"mcp5"
		, name: "agv_get_xy_req"
		, source: ""
		, destination: ""
		, session_id: ""
		, security_id: ""
	};
	this.data = {};
}

function agv_get_status_req() {
	this.header = {
		protocol: "mcp5"
		, name: "agv_get_status_req"
		, source: ""
		, destination: ""
		, session_id: ""
		, security_id: ""
	};
	this.data = {};
}

function agv_set_dir_req (strDirection) {
	this.header = {
		protocol: "mcp5"
		, name: "agv_relative_move_req"
		, source: ""
		, destination: ""
		, session_id: ""
		, security_id: ""
	};
	this.data = {
		direction: strDirection
	};
}

function agv_set_tape_dir_req (numTape, strDirection) {
	this.header = {
		protocol: "mcp5"
		, name: "agv_tool_req"
		, source: ""
		, destination: ""
		, session_id: ""
		, security_id: ""
	};

	if (numTape == 1) {
		this.data = {
			conveyor_1: strDirection
		};
	} else if (numTape == 2) {
		this.data = {
			conveyor_2: strDirection
		};		
	}

	this.data = {
		conveyor_id: numTape.toString()
		, command: strDirection
	};
}

socket.on('connect', function () {});

socket.on('succesfull login', function (msg) {
	source = msg.header.destination;
	sendmsgEnabled = true;
	$('#log').append("Kapcsolódott!<br/>");
});

socket.on('agv_get_xy_resp', function (agv_get_xy_resp) {
	$('#log').append(++msgreceived + ". <b>agv_get_xy_resp</b>.header.session_id: " + agv_get_xy_resp.header.session_id + " <br/>" + 
			" X: " + agv_get_xy_resp.data.x +
			", Y: " + agv_get_xy_resp.data.y + 
			", Phi: " + agv_get_xy_resp.data.phi + "<br/>");
});

socket.on('agv_get_status_resp', function (agv_get_status_resp) {
	$('#log').append(++msgreceived + ". <b>agv_get_status_resp</b>.header.session_id: " + agv_get_status_resp.header.session_id + " <br/>" + 
			" Uptime: " + agv_get_status_resp.data.uptime +
			" X: " + agv_get_status_resp.data.x +
			", Y: " + agv_get_status_resp.data.y + 
			", Phi: " + agv_get_status_resp.data.phi + 
			", Max Speed: " + agv_get_status_resp.data.max_speed + "<br/>");
});

socket.on('agv_set_dir_resp', function (agv_set_dir_resp) {
	$('#log').append(++msgreceived + ". <b>agv_set_dir_resp</b>.header.session_id: " + agv_set_dir_resp.header.session_id + " <br/>" + 
			" Uptime: " + agv_set_dir_resp.data.uptime +
			" X: " + agv_set_dir_resp.data.x +
			", Y: " + agv_set_dir_resp.data.y + 
			", Phi: " + agv_set_dir_resp.data.phi + 
			", Max Speed: " + agv_set_dir_resp.data.max_speed + "<br/>");
});

function startInterval() {
	var interval = $('#interval').val();
	var timeout = $('#timeout').val();

	setIntervalId = setInterval(function() {
		var agvGetStatusReq = new agv_get_status_req();
		agvGetStatusReq.header.source = source;
		agvGetStatusReq.header.destination = destination;
		agvGetStatusReq.header.session_id = "" + Math.floor(Math.random()*65535);
		sendReq(agvGetStatusReq);
	}, interval);

	setTimeoutId = setTimeout(function(){
		stopInterval;
	}, timeout)
}

function stopInterval() {
	if (setIntervalId) {
		$('#log').append("TIMER OFF<br/>");
		clearInterval(setIntervalId);
		setIntervalId = false;
	}
}

function sendGetXYReq() {
	var agvGetXYReq = new agv_get_xy_req();
	agvGetXYReq.header.source = source;
	agvGetXYReq.header.destination = destination;
	agvGetXYReq.header.session_id = "" + Math.floor(Math.random()*65535);
	sendReq(agvGetXYReq);
}

function sendCustomReq() {
	var customJsonMsg = $("#custom_msg").val();
	var canSend = false;
	if (customJsonMsg.length > 0) {
		try {
			customJsonMsg = json_parse(customJsonMsg);
			canSend = true;
		} catch (e) {
			alert(e.name + "@" + e.at + ": " + e.message);
		}
	}

	if (canSend && customJsonMsg.hasOwnProperty("header") && customJsonMsg.header.hasOwnProperty("name") && customJsonMsg.header.name.length > 0) {
		customJsonMsg.header.session_id = "" + Math.floor(Math.random()*65535);
		var eventToAttach = customJsonMsg.header.name;
		if(eventToAttach.indexOf("req") > -1){
			eventToAttach = eventToAttach.slice(0,eventToAttach.indexOf("req")) + "resp";
		}
		registerEventHandler(eventToAttach);
		sendReq(customJsonMsg);
	} else {
		if(canSend) alert("Nincs header!");
	}
}

function registerEventHandler(eventName){
	if (!socket.$events.hasOwnProperty(eventName)) {
		socket.on(eventName, function(data){
			$('#log').append(++msgreceived + " Custom üzenet <br/> " +JSON.stringify(data) + "</br>");
		});
	}
}

function sendReq(msg_obj) {
	if (sendmsgEnabled){
		socket.emit('esb message', msg_obj);
		$('#log').append();
		$('#log').append('\n' + ++msgsent + ". <b>" + msg_obj.header.name + "</b>.header.session_id: " + msg_obj.header.session_id + " <br/>");
		$('#log').append(JSON.stringify(msg_obj) + "</br>");
	} else {
		$('#log').append("Küldeném az " + msg_obj.header.name + "csomagot, de esb még nem kapcsolódott! <br/>");
	}

	// auto scoll log
	var logObj = document.getElementById('log');  
	logObj.scrollTop = logObj.scrollHeight; 
}

// AVG BASE MOVEMENT
function avgMoveHandler (strDirection) {
	if (strDirection != undefined) {
		var agvSetDirection = new agv_set_dir_req(strDirection);

		agvSetDirection.header.source = source;
		agvSetDirection.header.destination = destination;
		agvSetDirection.header.session_id = "" + Math.floor(Math.random()*65535);

		sendReq(agvSetDirection);
	} else {
		return false;
	}
}

// AVG's TAPE MOVEMENT
function avgTapeMoveHandler (numTape, strDirection) {
	if (numTape != undefined && strDirection != undefined) {
		var agvSetTapeDirection = new agv_set_tape_dir_req(numTape, strDirection);

		agvSetTapeDirection.header.source = source;
		agvSetTapeDirection.header.destination = destination;
		agvSetTapeDirection.header.session_id = "" + Math.floor(Math.random()*65535);

		sendReq(agvSetTapeDirection);			
	} else {
		return false;
	}
}
