/**
 * @author Grigore András Zsolt
 */

/* Dependencies */
var fs = require('fs'),
	crypto = require('crypto'),
	mosHttp = require('./http/MosHttp.js'),
	mosRoutes = require('./http/MosRoutes.js'),
	mosWebSockets = require('./websockets/MosWebSockets.js');

/* Public properties */
var runEnv = process.env.NODE_ENV || 'development';										//running environment
exports.runEnv = runEnv;

var config = eval('(' + fs.readFileSync('mos.config.json', 'utf-8') + ')');
exports.config = config;

/*
 * DB-ből egy global system socketen keresztül lehet lecopkodni
 */
function hash(msg, key) {
  return crypto.createHmac('sha256', key).update(msg).digest('hex');
}
var users = {
  grigo: {
    name: 'test',
    salt: 'essé-mán-le-a-fárúl',
    pass: hash('test2', 'essé-mán-le-a-fárúl')
  }
};
exports.users = users;
global.hash = hash;
global.users = users;

/*
 * Init & Listen
 */
mosHttp.init(this, mosRoutes);
mosHttp.listen();
mosWebSockets.listen(mosHttp.server);

