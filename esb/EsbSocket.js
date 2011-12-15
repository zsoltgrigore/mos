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
	//net.Socket core konfig
	net.Socket.call(this);
	this.setNoDelay(true);															//letiltja a TCP default cachelési algurimusát (Nagle)
	this.setTimeout(3000);
	
	//EsbSocket konfig
	this.esbSocketConfig = esbSocketConfig;
	this.security_id = "";
	this.esbSocketBuffer = "";
	//EsbSocket kapcsolat állapot paraméterek
	this.reconnectTimes = 0;
	
	//net.Socket core események
	this.on("connect", sendLoginRequest);
	this.on("data", dataBufferHandler);
	this.on("timeout", timeOutHandler);
	this.on("error", errorHandler);
	
	//EsbSocket specifikus események a többi eseményt EsbMsgProcessor kezeli
	this.on("succesfull login", startHeartBeat);
	this.on("remote heartbeat", connectionLive);
	this.on("access denied", accessDenied);
}

util.inherits(EsbSocket, net.Socket);

EsbSocket.prototype.connectToEsb = function () {
	this.connect(5521, "localhost");												//TODO: Ezeket majd konfigból!
}

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
	
	if (this.esb_login_req == undefined) {											//ha van már kitöltött login request akkor haszbáljuk azt, ha nem akkor adjunk hozzá újat
		this.esb_login_req = new esb.api.esb_login_req();
		this.esb_login_req.header.source = this.esbSocketConfig.source;
		this.esb_login_req.header.destination = "ANY";
		this.esb_login_req.header.sessionid = "123456";
		this.esb_login_req.data.password = this.esbSocketConfig.password;
	}
	
	this.write(JSON.stringify(this.esb_login_req));
	
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
	console.info(dataChunk);
	this.esbSocketBuffer += dataChunk.toString();									//minden üzenetet Stringgé alakít, ha szükséges akkor bináris buffer is használható (pl.: videó Stream)
	
	var esbJsonMsg = stringBufferIsJson(this.esbSocketBuffer);
	
	if (!(esbJsonMsg instanceof SyntaxError)) {
		
		switch(esbJsonMsg.header.name) {
			case "esb_login_resp":
				esbJsonMsg.data.login_success == "1" ?
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

/*
 * Sikeres authentikációt követően a mesh ESB szabvány szerinti HeartBeat (hello_req) csomagot küldünk 1s-es időközökkel
 * 
 * @param {String}
 * 		Sikeres bejelenkezés után kapott válasz üzenet, ez alapján töltödik ki a HeartBeat csomag
 */
function startHeartBeat(esb_login_resp) {
	
	if (this.esb_hello_req == undefined) {
		this.esb_hello_req = new esb.api.esb_hello_req();
		this.esb_hello_req.header.source = this.esb_login_req.header.source;
		this.esb_hello_req.header.destination = this.esb_login_req.header.destination;
		this.esb_hello_req.header.security_id = esb_login_resp.header.security_id;
	}

	this.esb_hello_req.header.session_id = esb_login_resp.header.session_id;				//minden adott, csak a seurity Id változik ha újra kell kapcsolódni
	
	setInterval(sendEsbHelloReq, 1000, this);
}

/*
 * Alapértelmezett timeout kezelő függvény, ha meghívódik akkor újrakapcsolódunk
 */
function timeOutHandler() {
	console.error("A socket-en (%s) 3 másodperce nem volt adatforgalom. Újrakapcsolódás...", this.esbSocketConfig.source);
	setTimeout(reconnect, 1000, this);
}

/*
 * Alapértelmezett hibakezelő függvény, ha meghívódik akkor újrakapcsolódunk
 */
function errorHandler(exception) {
	console.error("Hiba történt a %s felhasználóhoz rendelt socket-en. Kivétel: ", this.esbSocketConfig.source);
	console.error(exception);
	console.log("Újrakapcsolódás...");
	setTimeout(reconnect, 1000, this);
}

/*
 * Alapértelmezett szívdobbanás válasz kezelő függvény. Logba írja hogy minden ok.
 */
function connectionLive() {
	console.info("ESB kapcsolat él!");
}

/*
 * Ha hibásak a bejelentkezési attribútumok akkor hívódik meg ez a függvény és ebben az esetben nem is próbálunk újrakapcsolódni
 */
function accessDenied() {
	console.error("Sikertelen bejelentkezés...");
	this.end();
	this.destroy;
}

/*
 * Ha bármilyen oknál fogva megszakad a kapcsolat akkor újrakapcsolódik ESB-hez
 * 
 * @param {EsbSocket}
 * 		EsbSocket ami leszakadt valamelyik ESB szerverrről
 */
function reconnect(socket) {
	socket.destroy();
	socket.connectToEsb();
}

/*
 * Ha a socket példányban van nyoma sikeres authentikációnak akkor küldünk egy hello csomagot
 * 
 * @param {EsbSocket}
 * 		EsbSocket példány
 */
function sendEsbHelloReq(socket){
	console.info("Send esb_hello_req message!");
	if (socket.esb_hello_req == undefined) {
		socket.write(JSON.stringify(socket.esb_hello_req));
	} else {
		console.error("Authorizált socket szükséges Hello csomag küldéséhez!");
	}
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