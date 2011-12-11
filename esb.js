/**
 * @author Grigore András Zsolt
 */
var esb = require("./esb/");
var fs = require("fs");

var esb_login_req = JSON.parse(fs.readFileSync("esb_login_req.json", "utf8"));
var esb_login_resp = JSON.parse(fs.readFileSync("esb_login_resp.json", "utf8"));
var esb_hello_req = JSON.parse(fs.readFileSync("esb_hello_req.json", "utf8"));
var esb_hello_req = JSON.parse(fs.readFileSync("esb_hello_resp.json", "utf8"));

var instance1 = new esb.EsbSocket({userName : "grigo@meshnetwork.hu", fired : 0});
var securityId = "";
instance1.connect(5521, "meshnetwork.hu");

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
}