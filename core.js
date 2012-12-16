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

/* DELETE if has working memdb */
var hash = require("./utils/security").hash;
global.users = JSON.parse(fs.readFileSync('users.json', 'utf-8'));
for (var user in global.users) {
	global.users[user] = hash(global.users[user], global.configuration.http.salt);
}
/*******************************/

process.title = "node - Refrigeratory backend";

var mosHttp = new MosHttp(global.configuration.http);
mosHttp.listen();

if (global.configuration.websockets.enabled) {
	var mosWebSockets = new MosWebSockets(global.configuration.websockets)
	mosWebSockets.listen(mosHttp);
}