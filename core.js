/**
 * @author Grigore András Zsolt
 */

/* Dependencies */
var fs = require('fs');
var config = require('./utils/config');
var	MosHttp = require('./http/MosHttp');
var	MosWebSockets = require('./websockets/MosWebSocketServer');

/* DELETE if has working memdb */
global.users = JSON.parse(fs.readFileSync('users.json', 'utf-8'));

/* Parse config to memory */
global.configuration = config.createGlobalConfig(fs.readFileSync('mos.config.json', 'utf-8'));

process.title = "node - Refrigeratory backend";

var mosHttp = new MosHttp(global.configuration.http);
mosHttp.listen();

if (global.configuration.websockets.enabled) {
	var mosWebSockets = new MosWebSockets(global.configuration.websockets)
	mosWebSockets.listen(mosHttp);
}