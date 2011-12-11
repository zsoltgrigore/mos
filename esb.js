/**
 * @author Grigore András Zsolt
 */
var esb = require("./esb/");
var fs = require("fs");

var instance1 = new esb.EsbSocket({source : "test", password : "test2"});
instance1.connect(5521, "meshnetwork.hu"); //"localhost");
/*
instance1.on("connect", function(){
	console.log("connected");
	var loginstring = JSON.stringify(esb_login_req);
	console.log("write: " + loginstring);
	this.write(loginstring);
})

instance1.on("esb data", function(esbdata){
	console.log("got: ");
	console.log(esbdata);
	if (esbdata.header.name == "esb_login_resp") {
		securityId = esbdata.data.security_id
		console.log(securityId);
		esb_hello_req.heade.seurity_id = securityId;
		sendHello(this);
	}
})

instance1.on("end", function(esbdata){
	console.log("socket closed");
})

function sendHello(socket){
  setInterval(function () {
  	var helloString = JSON.stringify(esb_hello_req);
  	console.log("write: " + helloString);  
  	socket.write(helloString);  
  }, 1000)
}*/