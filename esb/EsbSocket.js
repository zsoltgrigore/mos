/**
 * @author Grigore András Zsolt
 */
var EventEmitter = require('events').EventEmitter
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
 * 			password : {String} password,
 * 			host : {String} host;
 * 			port : {Number} port;
 * 		}
 */
var EsbSocket = function (esbSocketConfig) {
	EventEmitter.call(this);
	
	//Publikus változók
	//-----------------
	this.host = esbSocketConfig.host || "localhost";
	this.port = esbSocketConfig.port || 5521;
	this.source = esbSocketConfig.source || "test";
	this.password = esbSocketConfig.password || "test2";
	this.sessionId = esbSocketConfig.sessionId || "" + Math.floor(Math.random()*65535) + "";
	this.destination = esbSocketConfig.destination || "ANY";
	this.helloInterval = esbSocketConfig.helloInterval || 1000;
	
	//Nem annyira publikus változók
	//-----------------------------
	this.securityId = "";			//Sikeres bejelentkezés után kapott biztonsági azonosító
	this.esbSocketBuffer = "";		//Több soros (\n) üzenetek darabokban érkeznek ezért kell egy string buffer
	this.connection = false;		//Kapcsolódási infók illetve maga az esb kapcsolat miután felépült
	this.isConnected = false;
	this.helloTimerId = null;
	
	//Statisztika info
	//----------------
	this.reconnectTimes = 0;		//Mennyi újrakapcsolódás történt
	this.flushed = 0;
	this.wrote = 0;		
	
	
	
	
	
	//this.setTimeout(3000);
	
	//EsbSocket specifikus események a többi eseményt EsbMsgProcessor kezeli
	this.on("succesfull login", this.startHeartBeat);
	this.on("remote heartbeat", this.connectionLive);
	this.on("access denied", this.accessDenied);
}

util.inherits(EsbSocket, EventEmitter);

EsbSocket.prototype.connectToEsb = function () {
	this.connection = net.createConnection(this.port, this.host);
	this.connection.setNoDelay(true);
	
	//this.connection.on("timeout", timeOutHandler);
	//this.connection.on("error", errorHandler);
	//this.connection.on("close", closeHandler);
	//this.connection.on("end", endHandler);
	
	this.connection.on("connect", this.sendLoginRequest.bind(this));
	this.connection.on("data", this.dataBufferHandler.bind(this));
	
	console.info("[%s] kapocsolódni próbál a következőn %s:%d", this.source, this.host, this.port);
}

/*
 * Kapcsolódákor elküld egy login request-et a megfelelő adatokkal kitöltve
 * 		source és password a socketpéldányban van
 * 		sessionId-t majd generálni kell vagy a webes loginnál kapottat adjuk
 * 
 */
EsbSocket.prototype.sendLoginRequest = function() {
	console.info("[%s] kapocsolódott a következőn %s:%d", this.source, this.connection.remoteAddress, this.connection.remotePort);
	if (this.esb_login_req === undefined) {											//ha van már kitöltött login request akkor haszbáljuk azt, ha nem akkor adjunk hozzá újat
		this.esb_login_req = new esb.api.esb_login_req();
		this.esb_login_req.header.source = this.source;
		this.esb_login_req.header.destination = this.destination;
		this.esb_login_req.header.sessionid = this.sessionId;
		this.esb_login_req.data.password = this.password;
	}
	
	this.connection.write(JSON.stringify(this.esb_login_req), "utf8", function(){
		this.flushed++;
		console.log("[%s] Login request flushed to the kernel. %d", this.source, this.flushed);
	}.bind(this));
	this.wrote++;
	console.info("[%s] esb_login_req üzenetet írt a socketre. Mérete: %d  | %d", this.source, this.connection.bytesWritten, this.wrote);
	
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
EsbSocket.prototype.dataBufferHandler = function (dataChunk){
	//console.info(dataChunk);
	this.esbSocketBuffer += dataChunk.toString();									//minden üzenetet Stringgé alakít, ha szükséges akkor bináris buffer is használható (pl.: videó Stream)
	
	var esbJsonMsg = this.stringBufferIsJson();
	
	if (!(esbJsonMsg instanceof SyntaxError)) {
		
		switch(esbJsonMsg.header.name) {
			case "esb_login_resp":
				esbJsonMsg.data.login_success === "1" ?
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
	
	} else {
		console.info("JSON ERROR!");
		console.info(dataChunk.toString());
	}
	
}

/*
 * Sikeres authentikációt követően a mesh ESB szabvány szerinti HeartBeat (hello_req) csomagot küldünk 1s-es időközökkel
 * 
 * @param {String}
 * 		Sikeres bejelenkezés után kapott válasz üzenet, ez alapján töltödik ki a HeartBeat csomag
 */
EsbSocket.prototype.startHeartBeat = function(esb_login_resp) {
	
	if (this.esb_hello_req === undefined) {
		this.esb_hello_req = new esb.api.esb_hello_req();
		this.esb_hello_req.header.source = this.esb_login_req.header.source;
		this.esb_hello_req.header.destination = this.esb_login_req.header.destination;
		this.esb_hello_req.header.security_id = esb_login_resp.header.security_id;
	}

//	this.esb_hello_req.header.session_id = "123456";//esb_login_resp.header.session_id;				//minden adott, csak a seurity Id változik ha újra kell kapcsolódni

	// Random session_id: 0..65535
	this.esb_hello_req.header.session_id = "" + Math.floor(Math.random()*65535) + "";				// J.
	
	this.helloTimerId = setInterval(this.sendEsbHelloReq.bind(this), this.helloInterval);
}

/*
 * Alapértelmezett timeout kezelő függvény, ha meghívódik akkor újrakapcsolódunk
 */
EsbSocket.prototype.timeOutHandler = function() {
	console.error("A socket-en (%s) 3 másodperce nem volt adatforgalom.", this.source);
	//reconnect(this);
}

/*
 * Alapértelmezett hibakezelő függvény, ha meghívódik akkor újrakapcsolódunk
 */
EsbSocket.prototype.errorHandler = function(exception) {
	console.error("Hiba történt a %s felhasználóhoz rendelt socket-en. Kivétel: ", this.esbSocketConfig.source);
	console.error(exception);
	//reconnect(this);
}

EsbSocket.prototype.closeHandler = function(had_error) {
	console.log(had_error);
	if (had_error) {
		console.error("A %s felhasználóhoz rendelt socket váratlanul bezárult!", this.esbSocketConfig.source);
		this.connection.destroy();
	} else {
		console.log("A %s felhasználóhoz rendelt socket sikeresen bezárult", this.esbSocketConfig.source);
	}
	//reconnect(this);
}

/*
 * Alapértelmezett szívdobbanás válasz kezelő függvény. Logba írja hogy minden ok.
 */
EsbSocket.prototype.connectionLive = function(esb_hello_resp) {
	console.info("ESB kapcsolat él! Csomag neve: %s", esb_hello_resp.header.name);
}

/*
 * Ha hibásak a bejelentkezési attribútumok akkor hívódik meg ez a függvény és ebben az esetben nem is próbálunk újrakapcsolódni
 */
EsbSocket.prototype.accessDenied = function(esb_login_resp) {
	console.error("Sikertelen bejelentkezés...");
	this.connection.end();
}

/*
 * Ha bármilyen oknál fogva megszakad a kapcsolat akkor újrakapcsolódik ESB-hez
 * 
 * @param {EsbSocket}
 * 		EsbSocket ami leszakadt valamelyik ESB szerverrről
 */
EsbSocket.prototype.reconnect = function(socket) {
	socket.reconnectTimes++;
	if (socket.helloTimerId) {
		console.log("Hello Timer törlése");
		clearInterval(socket.helloTimerId);
		socket.helloTimerId = 0;
	}
	
	console.log("socket.end()");
	socket.end();
	
	setTimeout(function() {
		console.log("Újrakapcsolódás most.");
		socket.connectToEsb();
	}, 1000);
}

/*
 * Ha a socket példányban van nyoma sikeres authentikációnak akkor küldünk egy hello csomagot
 * 
 * @param {EsbSocket}
 * 		EsbSocket példány
 */
EsbSocket.prototype.sendEsbHelloReq = function(){
	if (this.esb_hello_req != undefined) {
		this.connection.write(JSON.stringify(this.esb_hello_req), "utf8", function(){
			this.flushed++;
			console.log("Login request flushed to the kernel. %d", this.flushed);
			console.info("Output: %s", JSON.stringify(this.esb_hello_req));			// J.
		}.bind(this));
		this.wrote++;
		console.info("Write happened esb_hello_req message! %d", this.wrote);
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
EsbSocket.prototype.stringBufferIsJson = function () {
	console.log("JSON vagy JSON szelet (input) : \n" + this.esbSocketBuffer);
	try {
		var json = JSON.parse(this.esbSocketBuffer);
		this.esbSocketBuffer = "";							// J.
		return json;
	} catch(e) {
		console.log(e.stack);
		console.log(e.message);
		this.esbSocketBuffer = "";							// J. - Itt van a kutya elásva!
		return e;
	}
}

module.exports = EsbSocket;
