/**
 * @author Grigore András Zsolt
 */
var EventEmitter = require('events').EventEmitter
var net = require("net");
var esb = require("./");
var util = require("util");

/*
 * @classDescription 
 * 		EsbSocket osztály aEventEmitter osztályból származik
 * 		ESB specifikus adatok és eseményekezelők illetve maga a socket ojjektum
 *
 * @param {Object} config
 * 		A esbSocket példányhoz rendelt konfigurációs objektum
 * 		TODO: Egyelőre csak paraméterként adódnak hozzá de ha szükséges akkor függvények is kerülhetnek bele
 * 		esbSocketConfig = {
 * 			host : {String} //host amihez kapcsolódunk
 * 			port : {Number} //port amihez kapcsolódunk
 * 			source : {String} //username
 * 			password : {String} //password
 * 			destination : {String} //ide küldjük az üzenetet
 * 			helloInterval : {Number} //a szívdobbanások közti szünet
 * 			webSocket : {Object} //a kapcsolódott user web socket példánya
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
	this.destination = esbSocketConfig.destination || "ANY";
	this.helloInterval = esbSocketConfig.helloInterval || 1000;
	this.webSocket = esbSocketConfig.webSocket || false;
	
	//Nem annyira publikus változók
	//-----------------------------
	this.securityId = "";			//Sikeres bejelentkezés után kapott biztonsági azonosító
	this.esbSocketBuffer = "";		//Több soros (\n) üzenetek darabokban érkeznek ezért kell egy string buffer
	this.connection = false;		//Kapcsolódási infók illetve maga az esb kapcsolat miután felépült
	this.sessionId = "" + Math.floor(Math.random()*65535) + "";
	this.isConnected = false;
	this.helloTimerId = null;
	
	//Statisztika info
	this.reconnectTimes = 0;		//Mennyi újrakapcsolódás történt
	this.flushed = 0;
	this.wrote = 0;		
	
	//Service flags
	this._reconnecting = false;
	
	//this.setTimeout(3000);
	
	//EsbSocket specifikus események a többi eseményt EsbMsgProcessor kezeli
	this.on("succesfull login", this.startHeartBeat);
	this.on("remote heartbeat", this.connectionLive);
	this.on("access denied", this.accessDenied);
}

util.inherits(EsbSocket, EventEmitter);

EsbSocket.prototype.connectToEsb = function () {
	this._reconnecting = false;
	this.connection = net.createConnection(this.port, this.host);
	this.connection.setNoDelay(true);
	
	this.connection.on("timeout", this.timeOutHandler.bind(this));
	this.connection.on("error", this.errorHandler.bind(this));
	this.connection.on("close", this.closeHandler.bind(this));
	this.connection.on("end", this.endHandler.bind(this));
	
	this.connection.on("connect", this.sendLoginRequest.bind(this));
	this.connection.on("data", this.dataBufferHandler.bind(this));
	
	console.info("[%s] kapocsolódni próbál a következőn %s:%d", this.source, this.host, this.port);
}

/*
 * Kapcsolódáskor elküld egy login request-et a megfelelő adatokkal kitöltve
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
		this.esb_login_req.header.session_id = this.sessionId;
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
	this.esbSocketBuffer += dataChunk.toString("utf-8");									//minden üzenetet Stringgé alakít, ha szükséges akkor bináris buffer is használható (pl.: videó Stream)
	
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
        console.info(esbJsonMsg); 
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
	
	this.helloTimerId = setInterval(this.sendEsbHelloReq.bind(this), this.helloInterval);
}

/*
 * Alapértelmezett timeout kezelő függvény, ha meghívódik akkor újrakapcsolódunk
 */
EsbSocket.prototype.timeOutHandler = function() {
	console.error("A socket-en (%s) 3 másodperce nem volt adatforgalom.", this.source);
	this.reconnect();
}

/*
 * Alapértelmezett hibakezelő függvény, ha meghívódik akkor újrakapcsolódunk
 */
EsbSocket.prototype.errorHandler = function(exception) {
	if(!this.connection) this._reconnecting = false;
	console.error("Hiba történt a %s felhasználóhoz rendelt socket-en. Kivétel: ", this.source);
	console.error(exception);
	this.reconnect();
}

EsbSocket.prototype.closeHandler = function(had_error) {
	console.log("Volt error? " + had_error);
	if (had_error) {
		console.error("A %s felhasználóhoz rendelt socket váratlanul bezárult!", this.source);
	} else {
		console.log("A %s felhasználóhoz rendelt socket sikeresen bezárult", this.source);
	}
	this.reconnect();
}

EsbSocket.prototype.endHandler = function() {
	console.error("A %s felhasználóhoz rendelt socket FIN-el zárult. end event!", this.source);
}

/*
 * Alapértelmezett szívdobbanás válasz kezelő függvény. Logba írja hogy minden ok.
 */
EsbSocket.prototype.connectionLive = function(esb_hello_resp) {
	console.info("ESB kapcsolat él! Csomag neve: %s", esb_hello_resp.header.name);
	if (this.webSocket) this.webSocket.emit('mcp message', "ESB2me", esb_hello_resp.header.name);
}

/*
 * Ha hibásak a bejelentkezési attribútumok akkor hívódik meg ez a függvény és ebben az esetben nem is próbálunk újrakapcsolódni
 */
EsbSocket.prototype.accessDenied = function(esb_login_resp) {
	console.error("Sikertelen bejelentkezés...");
	this.connection.end();
	this.connection.destroy();
	console.info("this.connection = ");
	console.info(this.connection);
}

/*
 * Ha bármilyen oknál fogva megszakad a kapcsolat akkor újrakapcsolódik ESB-hez
 * 
 * @param {EsbSocket}
 * 		EsbSocket ami leszakadt valamelyik ESB szerverrről
 */
EsbSocket.prototype.reconnect = function() {
	if (!this._reconnecting) {
		
		this._reconnecting = true;
		this.reconnectTimes++;
		
		if (this.helloTimerId) {
			console.log("Hello Timer törlése");
			clearInterval(this.helloTimerId);
			this.helloTimerId = null;
		}
	
		this.connection.end();
		console.log("socket.end() eredménye:");
		console.log(this.connection);
		this.connection.destroy();
		console.log("socket.destroy() eredménye");
		console.log(this.connection);
		this.connection = false;
	
		console.log("Újrakapcsolódás 10 másodperc múlva...");
		setTimeout(function() {
			console.log("Újrakapcsolódás most.");
			console.log(this);
			this.connectToEsb();
		}.bind(this), 10000);
	}
}

/*
 * Ha a socket példányban van nyoma sikeres authentikációnak akkor küldünk egy hello csomagot
 * 
 * @param {EsbSocket}
 * 		EsbSocket példány
 */
EsbSocket.prototype.sendEsbHelloReq = function(){
	if (this.esb_hello_req != undefined) {
		// Random session_id: 0..65535 
		this.esb_hello_req.header.session_id = "" + Math.floor(Math.random()*65535) + "";
		
		this.connection.write(JSON.stringify(this.esb_hello_req), "utf8", function(){
			this.flushed++;
			console.info("Output: %s", JSON.stringify(this.esb_hello_req));
			console.log("Login request flushed to the kernel. %d", this.flushed);
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
	console.log("JSON vagy JSON szelet (input): \n %s \n", this.esbSocketBuffer);
	try {
		var json = JSON.parse(this.esbSocketBuffer);
		return json;
	} catch(e) {
		console.log(e.stack);
		console.log(e.message);
		this.esbSocketBuffer = "";
		return e;
	}
}

module.exports = EsbSocket;