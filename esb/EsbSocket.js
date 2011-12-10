/**
 * @author Grigore András Zsolt
 */

var net = require("net");

/*
 * EsbSocket osztály kiegészíti a core Socket osztályt ESB specifikus adatokkal és eseményekkel
 * A konstruktor bővítésével további szükséges paraméterek is hozzáadhatóak a core Socket-hez
 * 
 */
var EsbSocket = function (esbUserName) {
	var esoc = new net.Socket();
	esoc.esbUserName = esbUserName;
	esoc.esbBuffer = "";
	esoc.fired = 0;
	esoc.on("data", dataBufferHandler);				//Többi esemény is default eseménykezelőkkel ("error")
	return esoc;
}

/*
 * A core Socket-hez rendelt "data" eseménykezelő, mivel hosszabb String vagy bináris adat estén azt a
 * TCP/IP szétvágja ezért minden egyes darab megérkezésekor dobódik "data". A core Socket osztályhoz
 * rendelt esbBuffer mindendaddig tárolja amíg valid JSON nem alakítható belőle. Ha megérkezik minden
 * szükséges csomag akkor "esb data" eseményt dob ami tartalmazza a beérkezett JSON sztringet.
 */
function dataBufferHandler(dataChunk){
	this.fired++;
	console.log(this.esbUserName + ": fired " + this.fired);
	this.esbBuffer += dataChunk.toString();
	var esbJsonMsg = bufferIsJson(this.esbBuffer, this.esbUserName);
	if (esbJsonMsg) {
		this.emit("esb data", esbJsonMsg);
		this.esbBuffer = "";
	}
	return this;
}

/*
 * Megpróbálja a paraméterben kapott Stringet (buffer) javascript objektummá alakítani.
 * Ha sikerül akkor visszaadja az átalakítás után kapott objektumot, ha nem akkor false-t dob.
 */
function bufferIsJson(buffer, name) {
	try {
		var json = JSON.parse(buffer);
		return json;
	} catch(e) {
		console.log(name + ": Buffer még hiányos");
	}
	return false;
}

module.exports = EsbSocket;