/**
 * @author Grigore András Zsolt
 */
/* Globals */
json_parse = require("/utils/json_parse_rec.js");
logger = {"level" : 3};

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
 * Utils és memorydb :)
 */
function hash(msg, key) {
  return crypto.createHmac('sha256', key).update(msg).digest('hex');
}
var users = {
  test: {
    name: 'test',
    salt: 'essé-mán-le-a-fárúl',
    pass: hash('test2', 'essé-mán-le-a-fárúl')
  }
};
exports.users = users;
global.hash = hash;					//mehet ki mos.commons.utils-ba
global.users = users;				//ehelyett egy system socket amin keresztül db-től lehet lekérdezni

/*
 * Init & Listen
 */
mosHttp.init(this, mosRoutes);
mosHttp.listen();
mosWebSockets.listen(mosHttp.server);

