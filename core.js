/**
 * @author Grigore András Zsolt
 */

/*
 * Dependencies
 */
var fs = require('fs'),
	mosHttp = require('./http/MosHttp.js'),
	mosRoutes = require('./http/MosRoutes.js'),
	mosWebSockets = require('./websockets/MosWebSockets.js');

/*
 * Load config
 */
var config = eval('(' + fs.readFileSync('mos.config.json', 'utf-8') + ')');
console.info(config);

mosHttp.init(config.http, mosRoutes);
mosHttp.listen();
mosWebSockets.listen(mosHttp.server);