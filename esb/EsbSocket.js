/**
 * @author Grigore András Zsolt
 */

var EventEmitter = require('events').EventEmitter
var net = require("net");
var util = require("util");

var Logger = require('../utils/Logger');
var esb = require("./");
var json_parse = require("../utils/json_parse_rec.js");

/**
 * @classDescription 
 * 		EsbSocket osztály EventEmitter osztályból származik
 * 		ESB specifikus adatok és eseményekezelők illetve maga a socket ojjektum alkotják
 * 
 * @events
 * 		"connect"			@see net.Socket
 * 		"data" 				@see net.Socket
 * 		"error"				@see net.Socket
 * 		"close"				@see net.Socket
 * 		"end"				@see net.Socket
 * 
 * 		"successfull login"	Sikeres bejelentkezést tartalmazó esb_login_resp üzenet után dobódik
 * 				data : teljes esb_login_resp üzenet //User felé csak login_success értéke mehet
 * 		"access denied"		Sikertelen bejelentkezést tartalmazó esb_login_resp üzenet után dobódik
 * 				data : teljes esb_login_resp üzenet //User felé csak login_success értéke mehet
 * 		"reconnecting"      Ha lebomlik a kapcsolat valami oknál fogva akkor dobódik
 * 				data : mikor próbálja újrakapcsolni
 * 		"<esb.api.*>"		Ezek olyan események melyek valamilyen esb.api üzenetet tartalmaznak,
 * 								elkapásukhoz az adott típusú ESB üzenetre kell figyelni
 *
 * @param {Object} esbSocketConfig
 * 		A esbSocket példányhoz rendelt konfigurációs objektum
 * 		esbSocketConfig = {
 * 			host : {String} //host amihez kapcsolódunk
 * 			port : {Number} //port amihez kapcsolódunk
 * 			user : {Object} //user objektum
 * 			destination : {String} //ide küldjük az üzenetet
 * 			helloInterval : {Number} //a szívdobbanások közti szünet
 * 			reconnectDelay : {Number} //újrakapcsolódások közti idő
 * 			reconnectAllowed : {Boolean} //újrakapcsolódhat?
 * 		}
 */
var EsbSocket = function (esbSocketConfig) {
	esbSocketConfig = esbSocketConfig || {};
	EventEmitter.call(this);
	
	//Publikus változók
	//-----------------
	this.host = esbSocketConfig.host || "localhost";
	this.port = esbSocketConfig.port || 5521;
	this.user = esbSocketConfig.user || {};
	this.salt = esbSocketConfig.salt || "";
	this.destination = esbSocketConfig.destination || "ANY";
	this.helloInterval = esbSocketConfig.helloInterval || 1000;
	this.reconnectDelay = esbSocketConfig.reconnectDelay || 3000;
	this.reconnectAllowed = esbSocketConfig.reconnectAllowed || true;
	
	//Nem annyira publikus változók
	//-----------------------------
	this.securityId = "";			//Sikeres bejelentkezés után kapott biztonsági azonosító
	this.priBuffer = "";		
	this.secBuffer = "";
	this.priBufferLock = false;
	this.connection = false;		//Kapcsolódási infók illetve maga az esb kapcsolat miután felépült
	this.sessionId = "" + Math.floor(Math.random()*65535) + "";
	this.isConnected = false;
	this.helloIntervalId = false;
	this.reconnectTimeoutId = false;
	this.logger = new Logger({target : "EsbSocket<"+this.user.source+">"});
	//this.msgproc = new esb.EsbMsgProcessor(); parent dolog???
		
	//Statisztika info
	this.reconnectTimes = 0;		//Mennyi újrakapcsolódás történt
	this.flushed = 0;
	this.wrote = 0;		
	
	//Service flags
	this._reconnecting = false;
	
	//EsbSocket authentikációs események
	this.on("successfull login", this.startHeartBeat);
	this.on("access denied", this.accessDenied);
	//esb api események
	this.on("esb_login_resp", this.loginRespHandler);
	this.on("esb_hello_resp", this.helloRespHandler); //connectionLive;
};
util.inherits(EsbSocket, EventEmitter);

/**
 * Kapcsolódáshoz használt függvény. Működéshez szükséges események és eseménykezelők regisztrálása.
 */
EsbSocket.prototype.connect = function () {
	this._reconnecting = false;
	this.connection = net.createConnection(this.port, this.host);
	//this.connection.setNoDelay(true); //kifelé kell Nagle de lehet hogy nem
	
	this.connection.on("connect", this.sendLoginRequest.bind(this));
	this.connection.on("data", this.dataHandler.bind(this));
	
	//this.connection.on("timeout", this.timeOutHandler.bind(this)); //Nincs timeout, ha megszakad akkor reconnect
	this.connection.on("error", this.errorHandler.bind(this));
	this.connection.on("close", this.closeHandler.bind(this));
	this.connection.on("end", this.endHandler.bind(this));
	
	this.logger.info("Kapcsolódás... %s:%d", this.host, this.port);
};

/**
 * Osztálypéldány megfelelő lebontásához használt függvény. Mielőtt zárjuk a kapcsolatot,
 * azelőtt feltétlenül le kell állítani minden időzített függvényhívást illetve érdemes
 * letörölni minden, korábban csatolt eseménykezelőt. Ezt követően zárható a kapcsolat.
 */
EsbSocket.prototype.end = function () {
	if (this.helloIntervalId) {
		clearInterval(this.helloIntervalId);
	}
	if (this.reconnectTimeoutId) {
		clearTimeout(this.reconnectTimeoutId);
	}
	if (this.connection) {
		this.connection.removeAllListeners();
	}
	this.removeAllListeners();
	this.connection.end();
	this.logger.info("%s:%d esb kapcsolat (source:%s) lezárva.",
			this.connection.remoteAddress, this.connection.remotePort, this.user.source);
};

/**
 * A paraméterben kapott Objektumot JSON sztringgé alakítjuk.
 * A natív socket.write metódus segítségével küldjük tovább a szervernek.
 * 
 * @param {Object} obj
 * 		esb api szerinti objektumok
 */
EsbSocket.prototype.writeObject = function (obj) {
	if (!this._reconnecting && this.connection) {
		var msg = JSON.stringify(obj);
		this.connection.write(msg, "utf8", function(){
			this.logger.debug("Kiküldött Üzenet: %s", msg);
			this.flushed++;
			this.logger.info("--> Üzenet küldés. Típusa: %s; Cél: %s, SeddionID: %d, Eddig kiküldve: %d", 
					obj.header.name, obj.header.destination, obj.header.session_id, this.wrote);
			this.logger.debug("%s üzenet -> kernel | sorszám: %d", obj.header.name, this.flushed);
		}.bind(this));
		this.wrote++;
		this.logger.debug("%s üzenet (méret: %d, sessionid: %d) -> socket | sorszám: %d",
				obj.header.name, this.connection.bytesWritten, obj.header.session_id, this.wrote);
	}
};

/**
 * Kapcsolódáskor elküld egy login request-et a megfelelő adatokkal kitöltve.
 * Source, password a webes loginból jön, sessionId-t pedig konstruktorban generálunk
 */
EsbSocket.prototype.sendLoginRequest = function() {
	this.logger.info("Kapocsolódott: %s:%d", this.connection.remoteAddress, this.connection.remotePort);
	if (this.esb_login_req === undefined) {
		this.esb_login_req = new esb.api.esb_login_req();
		this.esb_login_req.header.source = this.user.source;
		this.esb_login_req.header.destination = this.destination;
		this.esb_login_req.header.session_id = this.sessionId;
		this.esb_login_req.data.password = this.user.pass;
	}
	
	this.writeObject(this.esb_login_req);
}

/**
 * A core Socket-hez rendelt "data" eseménykezelő.
 * Amikor meghívódik, akkor a chunk paraméter vagy egy töredék, vagy több vagy pontosan egy darab JSON sztringet
 * 		tartalmazhat. Ameddig kivesszük ezeket és JS Objektumokká alakítjuk addig egy zászló (priBuferLock) jelzi,
 * 		hogy éppen feldolgozás alatt van az elsődleges buffer.
 * Ha feldolgozás közben ismét kiváltódik a "data" esemény akkor addig a másodlagos bufferbe írunk,
 * 		majd a feldolgozás végeztével hozzáadjuk az elsődlege buferhez a másodlagos tartalmát és feloldjuk a zárat.
 * 
 * @param {Buffer} chunk
 * 		A beérkezett csomagok, csomag vagy csomag darab
 */
EsbSocket.prototype.dataHandler = function (chunk){
	this.logger.debug("data chunk (%d) -> socket", chunk.length);

	var chunkUTF = chunk.toString("utf-8");						//minden üzenetet Stringgé alakít, ha szükséges akkor bináris buffer is használható (pl.: videó Stream)
	
	this.priBufferLock ? 
			this.logger.debug("Elsődleges Buffer zárolva"): 
			this.logger.debug("Elsődleges Buffer írható");
	if (!this.priBufferLock){
		this.priBuffer += chunkUTF;
		this.priBufferLock = true;
		this.processPriBuffer(function() {
			//sorrend: összemásoljuk a kettőt feloldjuk a zárat és csak utána ürítjük a másodlagost
			this.priBuffer += this.secBuffer;
			this.priBufferLock = false;
			this.secBuffer = "";
		}.bind(this));
	} else {
		this.secBuffer += chunkUTF;
	}
	
}

/**
 * Az elsődleges bufferben található JSON sztringeket és töredékeket választja szét és
 * 		a valid JSON sztringeket JS Objektumokká alakítja.
 * Ez a logika nem a natív JSON parser metódust használja hanem egy külső rekurzív megvalósítást.
 * 
 * @param {Function} callback
 * 		A beérkezett csomagok, csomag vagy csomag darab
 */
EsbSocket.prototype.processPriBuffer = function (callback) {
	this.logger.debug("priBuffer tárolva, processBuffers() elkezdi kiolvasni a helyes JSON sztringeket:"
			+ "\nPRI: %s\nSEC: %s", this.priBuffer, this.secBuffer);
	
	var hasObject = true;
	var error = {};
	var num = 0;
	while(hasObject) {
		var incomingObj = {};
		this.logger.debug("Van benne Object?(true): %s; hiba helye: %d, Mennyi Object: %d", hasObject, error.at, num);
		
		try {
			var untilPos = error.at-1 || this.priBuffer.length;
			this.logger.debug("Parse eddig: charAt(%d) = %s", untilPos, this.priBuffer.charAt(untilPos));
			
			incomingObj = json_parse(this.priBuffer.slice(0, untilPos));
			num++;
			this.logger.debug("Sorszám a bufferben: %d. JSO: %s", num, incomingObj.header.name);
			
			this.priBuffer = this.priBuffer.slice(untilPos);
			this.logger.debug("Bufferben maradt: %s", this.priBuffer);
		} catch (err) {
			error.at ? hasObject = false : error = err;
		}
		
		if(incomingObj.header) {
			if (!this._events.hasOwnProperty(incomingObj.header.name)) {
				this.logger.debug("%s csomagtípushoz nincs eseménykezelő. Web felé dobva!", incomingObj.header.name);
				this.emit("web message", incomingObj.header.name, incomingObj);
			} else {
				this.emit(incomingObj.header.name, incomingObj);
			}
			this.logger.info("<-- Üzenet a bufferből: %s", incomingObj.header.name);
		}
		
		if (this.priBuffer.length == 0 || !hasObject) { //ha kiürült vagy már csak töredék akkor lépjünk ki
			this.logger.debug("Kiürült a buffer!");
			hasObject = false;
			callback();
		}
	}
}

/**
 * Login válasz üzenetet feldolgozó eseménykezelő.
 * Ha a login_success mező értékétől függő üzenetet dobunk.
 * 
 * @param {api.esb_login_resp} esb_login_resp
 * 		Sikeres bejelenkezés után kapott válasz üzenet (login_resp)
 */
EsbSocket.prototype.loginRespHandler = function(esb_login_resp) {
	if (esb_login_resp.data.login_success == "1") {
		this.logger.info("Sikeres bejelentkezés.");
		this.esb_login_resp = esb_login_resp;
		this.securityId = esb_login_resp.data.security_id;
		this.emit("successfull login", esb_login_resp);
	} else {
		this.logger.info("Sikertelen bejelentkezés.");
		this.emit("access denied", esb_login_resp);
	}
}

/**
 * Sikeres authentikációt követően a mesh ESB szabvány szerinti HeartBeat (hello_req) csomagot küldünk 
 * 		1s-es időközökkel.
 * 
 * @param {api.esb_login_resp} esb_login_resp
 * 		Sikeres bejelenkezés után kapott válasz üzenet (login_resp), ez alapján töltödik ki a HeartBeat csomag
 */
EsbSocket.prototype.startHeartBeat = function(esb_login_resp) {
	
	if (this.esb_hello_req === undefined) {
		this.esb_hello_req = new esb.api.esb_hello_req();
		this.esb_hello_req.header.source = this.esb_login_req.header.source;
		this.esb_hello_req.header.destination = this.esb_login_req.header.destination;
		this.esb_hello_req.header.security_id = this.securityId;
	}
	
	this.logger.info("Hello csomagok küdése %d másodpercenként", this.helloInterval/1000)
	this.helloIntervalId = setInterval(this.sendEsbHelloReq.bind(this), this.helloInterval);
}

/**
 * Ha hibásak a bejelentkezési adatok akkor hívódik meg ez a függvény.
 * Ebben az esetben nem is próbálunk újrakapcsolódni.
 * 
 * @param {api.esb_login_resp} esb_login_resp
 * 		login válasz üzenet benne a hibás adatokkal
 */
EsbSocket.prototype.accessDenied = function(esb_login_resp) {
	this.connection.end();
	this.connection.destroy();
	this.logger.warn("Hibás authentikációs adatok %s/%s", this.user.source, this.user.pass);
}

/**
 * Ha a socket példányban van nyoma sikeres authentikációnak, azaz van felparaméterezett "hello" csomag
 * 		akkor azt random sessionId-vel elküldjük
 */
EsbSocket.prototype.sendEsbHelloReq = function(){
	if (this.esb_hello_req != undefined) {
		// Random session_id: 0..65535 
		this.esb_hello_req.header.session_id = "" + Math.floor(Math.random()*65535) + "";
		this.writeObject(this.esb_hello_req);
	} else {
		this.logger.error("Authorizált socket szükséges Hello csomag küldéséhez!");
	}
	
}

/**
 * Alapértelmezett szívdobbanás válasz kezelő függvény. Logba írja hogy minden ok.
 * TODO: ennek segítségével mérhetünk kapcsolat sebességet req és resp közti időt használva
 * 			kb a console.time('parse-1'); console.timeEnd('parse-1') mintára
 * 
 * @param {api.esb_hello_resp} esb_hello_resp
 * 		hello válasz üzenet
 */
EsbSocket.prototype.helloRespHandler = function(esb_hello_resp) {
	this.logger.debug("ESB kapcsolat él!");
}

/**
 * Alapértelmezett hibakezelő függvény, ha meghívódik akkor újrakapcsolódunk
 * 
 * @param {Exception} exception
 * 		Arról ad némi infót hogy mi lehet a hiba
 */
EsbSocket.prototype.errorHandler = function(exception) {
	if(!this.connection) this._reconnecting = false;
	this.logger.error("Hiba történt!");
	this.logger.error(exception.toString);
	this.reconnect();
}

/**
 * Kapcsolat megszakadását kezelő függvény, ha meghívódik akkor újrakapcsolódunk
 * 
 * @param {boolean} had_error
 * 		hibával záródott (true) vagy másik oldal kezdeményezte a bezárást
 */
EsbSocket.prototype.closeHandler = function(had_error) {
	if (had_error) {
		this.logger.error("Kapcsolat valami hiba folytán bezárult!");
	} else {
		this.logger.warn("Kapcsolat bezárult, semmi jele hibának!");
	}
	this.reconnect();
}

/**
 * Ha close vagy error meghívódik akor end is ezért itt nem hívjuk feleslegesen a reconnect() fgvt.
 */
EsbSocket.prototype.endHandler = function() {
	this.logger.error("Kapcsolat FIN-el zárult. end event!");
}

/**
 * Ha bármilyen oknál fogva megszakad a kapcsolat akkor újrakapcsolódik ESB-hez.
 * Ha már folyamatban van újrakapcsolódás akkor nem teszünk semmit egyébként billentjük a zászlót
 * 		és megpróbálunk ismét kapcsolódni, egészen addig amíg nem sikerül..
 */
EsbSocket.prototype.reconnect = function() {
	if (!this._reconnecting && this.reconnectAllowed) {
		this._reconnecting = true;
		this.emit("reconnecting", this.reconnectDelay);
		this.logger.warn("Újrakapcsolódás %d.", this.reconnectTimes);

		this.reconnectTimes++;
		
		if (this.helloIntervalId) {
			this.logger.debug("Hello Timer törlése");
			clearInterval(this.helloIntervalId);
			this.helloIntervalId = false;
		}
	
		this.connection.end();
		this.connection.destroy();
		this.connection = false;
		this.logger.debug("Kapcsolat lebontása: end->destroy->false");
	
		this.logger.debug("Újrakapcsolódás %d másodperc múlva...", this.reconnectDelay);
		this.reconnectTimeoutId = setTimeout(function() {
			this.logger.debug("Újrakapcsolódás most.");
			this.connect();
		}.bind(this), this.reconnectDelay);
	}
	//Ha nem lehet újrakapcsolódni akkor szoljunk hogy vége és takarítsunk fel magunk után
	if (!this.reconnectAllowed) {
		this.emit("end");
		this.end();
	}
}

module.exports = EsbSocket;
