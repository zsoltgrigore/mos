var socket = io.connect();
var msgsent = 0;
var msgreceived = 0;

var source = "";
var destination = "agv1.miskolc@dev.gammadigital.hu";
var sendmsgEnabled = false;

var setIntervalId = false;
var setTimeoutId = false;
var esbHeartBeat = 1000;
var esbHeartBeatStart = false;
var speed = 0;

var coords = new Array();
var coordsHistory = 10;
var arrowPhi = 0;
var agv_map = false;
var agv_map_ctx = false;
var agv_map_scale = 1;


// random map xy val.
var isDemo = false;

var tblUrl = document.location.href.split('/');

$(document).ready(function(){
	if (tblUrl[3] == 'demo') {
		$(".agv_tester_area").hide();
		startInterval();
	}	
});

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

socket.on('connect', function () {
	socket.emit("ready", init);
});

function init(esbName, heartbeat) {
	source = esbName;
	sendmsgEnabled = true;
	esbHeartBeat = heartbeat || 1000;
	$('#log').append("Kapcsolódott!\n");
	initMap();
}

socket.on('live', function (msg) {
	if (!esbHeartBeatStart) {
		esbHeartBeatStart = (new Date).getTime();
	} else {
		speed = (new Date).getTime() - esbHeartBeatStart - esbHeartBeat;
		esbHeartBeatStart = (new Date).getTime();	
	}
});

socket.on('agv_get_xy_resp', function (agv_get_xy_resp) {
	writeLog(agv_get_xy_resp);

	if (isDemo == true) {
		processCoordinates(Math.floor(Math.random()*1600)-800, Math.floor(Math.random()*1600)-600, agv_get_xy_resp.data.phi);
	} else {
		processCoordinates(agv_get_xy_resp.data.x, agv_get_xy_resp.data.y, agv_get_xy_resp.data.phi);
	}
});

socket.on('agv_get_status_resp', function (agv_get_status_resp) {
	writeLog(agv_get_status_resp);
});

socket.on('agv_set_dir_resp', function (agv_set_dir_resp) {
	writeLog(agv_set_dir_resp);
});

function writeLog(msg_obj){
	$('#log').append("\n"+ ++msgreceived + ". recieved: " + msg_obj.header.name + ".header.session_id: " + msg_obj.header.session_id + " \n");
	$('#log').append(JSON.stringify(msg_obj) + "\n");
}

function startInterval() {
	var interval = $('#interval').val();
	var timeout = $('#timeout').val();

	interval = (interval == undefined ? 1000 : interval);
	timeout = (timeout  == undefined ? 1000 : timeout);

	setIntervalId = setInterval(sendGetXYReq, interval);

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
		$('#log').append("\n"+ ++msgsent + ". sent: " + msg_obj.header.name + ".header.session_id: " + msg_obj.header.session_id + "\n");
		$('#log').append(JSON.stringify(msg_obj) + "\n");
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

function initMap(){
	agv_map = document.getElementById("agv_map");
	if (agv_map.getContext) {
		agv_map_ctx = agv_map.getContext('2d');
		agv_map_ctx.strokeStyle="#fff";
		agv_map_ctx.fillStyle = '#777';
		agv_map_ctx.translate(agv_map.width/2, agv_map.height/2);
		agv_map_ctx.scale(agv_map_scale,-agv_map_scale);
		//800x500-ból 3200x2000
		//agv_map_scale *= 0.25;
		//agv_map_ctx.scale(agv_map_scale, agv_map_scale);
	}
}

function processCoordinates (numX, numY, phi) {
	arrowPhi = phi;
	var lastCoordPos = coords.length - 1;
	if (lastCoordPos == -1) {
		coords.push({x:numX,y:numY});
		setScale(numX, numY, phi);
	} else {
		if (coords[lastCoordPos]['x'] != numX||coords[lastCoordPos]['y'] != numY) {
			coords.push({x:numX,y:numY});
			setScale(numX, numY, phi);
			if (coords.length > coordsHistory) {
				coords.shift();
			}
		}
	}
}

function setScale(numX, numY){
	var scale = 1;
	if (Math.abs(numX) > agv_map.width*agv_map_scale/2){
		scale = (Math.abs(numX)*2)/agv_map.width*agv_map_scale;
	}
	if (Math.abs(numY) > agv_map.height*agv_map_scale/2){
		scale = Math.max(scale,(Math.abs(numY)*2)/agv_map.height*agv_map_scale);
	}
	
scale = 4;
	agv_map_ctx.clearRect(-agv_map.width*agv_map_scale/2, agv_map.height*agv_map_scale/2, agv_map.width*agv_map_scale, -agv_map.height*agv_map_scale);

	if (agv_map_scale < scale) {
		agv_map_scale = Math.ceil(scale);
		agv_map_ctx.lineWidth = agv_map_scale;
		agv_map_ctx.scale(1/agv_map_scale, 1/agv_map_scale);
	} else {
		//alert(1)
	}

	//clearRect


//	agv_map_ctx.clearRect(0, 0, agv_map.width, agv_map.height);

	reDrawPath();
	drawArrow();
	//console.log(agv_map_scale);
}

function reDrawPath(){
	agv_map_ctx.beginPath();
	for (coordIndex in coords) {
		if (coordIndex == 0){
			agv_map_ctx.moveTo(coords[coordIndex].x,coords[coordIndex].y);
		} else {
			agv_map_ctx.save();
			agv_map_ctx.beginPath();
			agv_map_ctx.moveTo(coords[coordIndex-1].x,coords[coordIndex-1].y);
			agv_map_ctx.lineTo(coords[coordIndex].x,coords[coordIndex].y);
			agv_map_ctx.globalAlpha = coordIndex/10;
			agv_map_ctx.stroke();
			agv_map_ctx.restore();


			agv_map_ctx.save();
			agv_map_ctx.beginPath();

			agv_map_ctx.globalAlpha = 1;

			agv_map_ctx.translate(coords[coordIndex].x+10,coords[coordIndex].y-5);
			agv_map_ctx.rotate(Math.PI*2/(6));
			agv_map_ctx.arc(0,12.5,10,0,Math.PI*2,true);
			agv_map_ctx.fill();
			agv_map_ctx.restore();

//			agv_map_ctx.lineTo(coords[coordIndex].x,coords[coordIndex].y);
		}
	}			
	agv_map_ctx.stroke();
}

function drawArrow(){
	var arrowHalfSide = 7*agv_map_scale;
	var arrowHeight = 15*agv_map_scale;

	agv_map_ctx.save();
	agv_map_ctx.translate(coords[coords.length-1].x,coords[coords.length-1].y);
	agv_map_ctx.rotate(-arrowPhi*Math.PI/180);
	agv_map_ctx.beginPath();
	agv_map_ctx.moveTo(0,0);
	agv_map_ctx.lineTo(arrowHalfSide,-arrowHeight);
	agv_map_ctx.moveTo(0,0);
	agv_map_ctx.lineTo(-arrowHalfSide,-arrowHeight);

	agv_map_ctx.lineTo(arrowHalfSide,-arrowHeight);
	agv_map_ctx.fill();
	agv_map_ctx.stroke();
	agv_map_ctx.restore();
}