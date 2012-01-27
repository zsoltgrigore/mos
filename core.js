/**
 * @author Grigore András Zsolt
 */

/*
 * Dependencies
 */
var fs = require('fs'),
	crypto = require('crypto'),
	mosHttp = require('./http/MosHttp.js'),
	mosRoutes = require('./http/MosRoutes.js'),
	mosWebSockets = require('./websockets/MosWebSockets.js');

/*
 * Load config
 */
var config = eval('(' + fs.readFileSync('mos.config.json', 'utf-8') + ')');
exports.config = config;

/*
 * DB-ből!
 */
function hash(msg, key) {
  return crypto.createHmac('sha256', key).update(msg).digest('hex');
}
var users = {
  grigo: {
    name: 'grigo',
    salt: 'essé-mán-le-a-fárúl',
    pass: hash('gr1g000', 'essé-mán-le-a-fárúl')
  }
};
exports.users = users;

/*
 * Init & Listen
 */
mosHttp.init(this, mosRoutes);
mosHttp.listen();
mosWebSockets.listen(mosHttp.server);

