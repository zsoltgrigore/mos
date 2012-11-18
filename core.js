/**
 * @author Grigore András Zsolt
 */

/* Dependencies */
var fs = require('fs');
var config = require('./utils/config');
var	MosHttp = require('./http/MosHttp');
var	MosWebSockets = require('./websockets/MosWebSocketServer');

/* Parse config to memory */
global.configuration = config.createGlobalConfig(fs.readFileSync('mos.config.json', 'utf-8'));

process.title = "node - Refrigeratory backend";

var mosHttp = new MosHttp(global.configuration.http);
mosHttp.listen();

if (global.configuration.websockets.enabled) {
	var mosWebSockets = new MosWebSockets(global.configuration.websockets)
	mosWebSockets.listen(mosHttp);
}

//Tennivalók:
//
//Express 3-ra migrálás
// - http modul refaktor sessionstore!
// - i18n alapok cimkékhez (en/hu pl.: 404 error - Requested content not found! -  Nem található a kért tartalom!)
//configolható fícsör (pl.: websockets.enabled = false akkor nem indul a modul.)
// - unit testek (pl.: ha egy adott middleware assertFailure akkor WARN middleware nem indult mert assertFail)
//session store interface és Redis tesztek
//kliens oldalra logika a tester-hez