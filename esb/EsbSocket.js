/**
 * @author Grigore András Zsolt
 */

var net = require("net");
var esb = require("./");
var util = require("util");

/*
 * @classDescription 
 * 		EsbSocket osztály a core Socket osztályból származik
 * 		ESB specifikus adatokkal és eseményekezelőkkel egészül ki

 * @param {Object} config
 * 		A socket objektumhoz rendelt konfigurációs objektum amit a <socketInstance>.esbSocketConfig fog tartalmazni
 * 		TODO: Egyelőre csak paraméterként adódnak hozzá de ha szükséges akkor függvények is kerülhetnek bele
 * 		esbSocketConfig = {
 * 			source : {String} username,
 * 			password : {String} password 
 * 		}
 */
var EsbSocket = function (esbSocketConfig) {
	net.Socket.call(this);
	this.setNoDelay(true);															//letiltja a TCP default cachelési algurimusát (Nagle)
	this.setTimeout(3000);
	this.esbSocketConfig = esbSocketConfig;
	this.security_id = "";
	this.esbSocketBuffer = "";
	
	//net.Socket események
	this.on("connect", sendLoginRequest);
	this.on("data", dataBufferHandler);
	this.on("timeout", timeOutHandler);
	
	//EsbSocket specifikus események a többi eseményt EsbMsgProcessor kezeli
	this.on("succesfull login", startHeartBeat);
	this.on("remote heartbeat", connectionLive);
	this.on("access denied", connectionLive);
}

util.inherits(EsbSocket, net.Socket);

/*
 * Kapcsolódákor elküld egy login request-et a megfelelő adatokkal kitöltve
 * 		source és password a socketpéldányban van
 * 		sessionId-t majd generálni kell vagy a webes loginnál kapottat adjuk
 * 
 * @return {esb.EsbSocket} 
 * 		Visszaadja az EsbSocket-et hogy az event-ek láncolhatóak legyenek (chainable)
 */
function sendLoginRequest() {
	console.log("connected");
	var esb_login_req = new esb.api.esb_login_req();
	esb_login_req.header.source = this.esbSocketConfig.source;
	esb_login_req.header.destination = "ANY";
	esb_login_req.header.sessionid = "123456";
	esb_login_req.data.password = this.esbSocketConfig.password;
	this.write(JSON.stringify(esb_login_req));
	return this;
}

/*
 * A core Socket-hez rendelt "data" eseménykezelő, mivel hosszabb String vagy bináris adat estén azt a
 * TCP/IP szétvágja ezért minden egyes darab megérkezésekor dobódik "data". A core Socket osztályhoz
 * rendelt esbSocketBuffer mindendaddig tárolja amíg valid JSON nem alakítható belőle. Ha megérkezik minden
 * szükséges csomag (nem SyntaxError az átalakítás eredménye) akkor előfeldolgozást végez.
 * 		Ha csomag neve
 * 			esb_login_resp és login_success == 1 akkor "succesfull login",
 * 			esb_login_resp és login_success == 0 akkor "access denied",
 * 			esb_hello_resp akkor "remote heartbeat",
 * 			minden egyéb esetben "esb msg" esemény dobódik.
 * 
 * @param {Buffer} dataChunk
 * 		A beérkezett csomag vagy csomag darab
 * @return {esb.EsbSocket} 
 * 		Visszaadja az EsbSocket-et hogy az event-ek láncolhatóak legyenek (chainable)
 */
function dataBufferHandler(dataChunk){
	console.log(dataChunk.length);
	this.esbSocketBuffer += dataChunk.toString();									//minden üzenetet Stringgé alakít, ha szükséges akkor bináris buffer is használható (pl.: videó Stream)
	var esbJsonMsg = stringBufferIsJson(this.esbSocketBuffer);
	if (!(esbJsonMsg instanceof SyntaxError)) {
		switch(esbJsonMsg.header.name) {
			case "esb_login_resp":
				esbJsonMsg.data.login_success == "true" ?
					this.emit("succesfull login", esbJsonMsg) :
					this.emit("access denied", esbJsonMsg);
				break; 
			case "esb_hello_resp":
				this.emit("remote heartbeat", esbJsonMsg);
				break;
			default:
				this.emit("esb msg", esbJsonMsg);
  		}
		this.esbSocketBuffer = "";
	}
	return this;
}

function timeOutHandler() {
	console.log("socket time outed");
}

function startHeartBeat(esb_login_resp) {
	this.security_id = esb_login_resp.header.security_id;
	
	var esb_hello_req = new esb.api.esb_hello_req();
	esb_hello_req.header.source = this.esbSocketConfig.source;
	esb_hello_req.header.destination = "ANY";
	esb_hello_req.header.session_id = esb_login_resp.header.session_id;
	esb_hello_req.header.security_id = this.security_id;
	setInterval(function (socket) {
		console.log(socket);
		socket.write(JSON.stringify(esb_hello_req));
	},1000, this);
}

function connectionLive() {
	console.log("got remote heartbeat");
}

function accessDenied() {
	console.log("accessDenied");
}

/*
 * Megpróbálja a paraméterben kapott Stringet javascript objektummá alakítani.
 * 
 * TODO: Normális logging arra az esetre ha nem sikerül alakítani látható legyen hogy melyik socketről van szó
 * TODO: Több ehhez hasonlóan független függvény esetén külön modulba tenni azokat
 * 
 * @param {String} buffer
 * 		A beérkezett csomag vagy csomag darab, itt már Stringként
 * 
 * @return {Object}
 * 		Ha sikerül átalakítani akkor kész Object, ha nem akkor SyntaxError Object 
 */
function stringBufferIsJson(buffer) {
	console.log(buffer);
	try {
		var json = JSON.parse(buffer);
		return json;
	} catch(e) {
		console.log(e.stack);
		console.log(e.message);
		return e;
	}
}

module.exports = EsbSocket;