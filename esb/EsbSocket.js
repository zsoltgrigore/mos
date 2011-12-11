/**
 * @author Grigore András Zsolt
 */

var net = require("net");
var util = require("util");

/*
 * @classDescription 
 * 		EsbSocket osztály kiegészíti a core Socket osztályt ESB specifikus adatokkal és eseményekkel
 * 		A konstruktor bővítésével további szükséges paraméterek is hozzáadhatóak a core Socket-hez
 * @param {Object} config
 * 		A socket objektumhoz rendelt konfigurációs objektum amit a <socketInstance>.esbSocketConfig fog tartalmazni
 * 		TODO: Egyelőre csak paraméterként adódnak hozzá de ha szükséges akkor függvények is kerülhetnek bele
 */
var EsbSocket = function (config) {
	net.Socket.call(this);
	this.setNoDelay(true);															//letiltja a TCP
	this.esbSocketConfig = config;
	this.esbSocketBuffer = "";
	this.on("data", dataBufferHandler);												//Többi esemény is default eseménykezelőkkel (pl.: "error" reconnect)
}

util.inherits(EsbSocket, net.Socket);

/*
 * A core Socket-hez rendelt "data" eseménykezelő, mivel hosszabb String vagy bináris adat estén azt a
 * TCP/IP szétvágja ezért minden egyes darab megérkezésekor dobódik "data". A core Socket osztályhoz
 * rendelt esbSocketBuffer mindendaddig tárolja amíg valid JSON nem alakítható belőle. Ha megérkezik minden
 * szükséges csomag akkor "esb msg" eseményt dob ami tartalmazza a beérkezett JSON sztringet.
 * 
 * @param {Buffer} dataChunk
 * 		A beérkezett csomag vagy csomag darab
 * @return {esb.EsbSocket} 
 * 		Visszaadja az EsbSocket-et hogy az event-ek láncolhatóak legyenek (chainable)
 */
function dataBufferHandler(dataChunk){
	var config = this.esbSocketConfig;
	config.fired++;
	console.log(config.userName + ": fired " + config.fired);
	this.esbSocketBuffer += dataChunk.toString();									//minden üzenetet Stringgé alakít, ha szükséges akkor bináris buffer is használható (pl.: videó Stream)
	var esbJsonMsg = stringBufferIsJson(this.esbSocketBuffer);
	if (!(esbJsonMsg instanceof SyntaxError)) {
		this.emit("esb msg", esbJsonMsg);
		this.esbSocketBuffer = "";
	}
	return this;
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
	console.info(buffer);
	try {
		var json = JSON.parse(buffer);
		return json;
	} catch(e) {
		console.log(e.message);
		return e;
	}
}

module.exports = EsbSocket;