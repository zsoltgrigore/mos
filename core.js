/**
 * @author Grigore András Zsolt
 */

/* Dependencies */
var fs = require('fs');
var config = require('./utils/config');
var	MosHttp = require('./http/MosHttp');
var	MosWebSockets = require('./websockets/MosWebSockets');

/* Parse config to memory */
global.configuration = config.createGlobalConfig(fs.readFileSync('mos.config.json', 'utf-8'));

if (global.configuration.http.enabled) {
	var mosHttp = new MosHttp(global.configuration.http);
	mosHttp.listen();
}

if (global.configuration.websockets) {
	var mosWebSockets = new MosWebSockets(global.configuration.websockets)
	mosWebSockets.listen(mosHttp);
}
//Tennivalók:
//
//Express 3-ra migrálás
// - http modul refaktor sessionstore!
// - templétek véglegesítése (login, tester, error)
// - i18n alapok cimkékhez (en/hu pl.: 404 error - Requested content not found! -  Nem található a kért tartalom!)
// - socketio hozzáigazítás
//configolható fícsör (pl.: websockets.enabled = false akkor nem indul a modul.)
// - unit testek (pl.: ha egy adott middleware assertFailure akkor WARN middleware nem indult mert assertFail)
//session store interface és Redis tesztek
//kigyakni minden felesleget:
// - (tester app) HTML refaktor + JS refaktor; statikből ami nem kell kidobni!