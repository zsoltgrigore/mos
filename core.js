/**
 * @author Grigore András Zsolt
 */

/* Dependencies */
var fs = require('fs');
var config = require('./utils/config');
var	MosHttp = require('./http/MosHttp');
var	MosWebSockets = require('./websockets/MosWebSockets');

/* Parse config to memory */
configuration = config.createGlobalConfig(fs.readFileSync('mos.config.json', 'utf-8'));
/* Logger defaults */
logger = configuration.logger;

var mosHttp = new MosHttp(configuration.http);
var mosWebSockets = new MosWebSockets(configuration.websockets)
mosHttp.listen();
mosWebSockets.listen(mosHttp);
