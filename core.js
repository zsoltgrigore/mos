/**
 * @author Grigore András Zsolt
 */

/* Dependencies */
var fs = require('fs');
var	hash = require('./utils/security').hash;
var config = require('./utils/config');
var	MosHttp = require('./http/MosHttp.js');
//var	mosRoutes = require('./http/MosRoutes.js');
var	MosWebSockets = require('./websockets/MosWebSockets.js');

/* Parse config to memory */
configuration = config.createGlobalConfig(fs.readFileSync('mos.config.json', 'utf-8'));

var mosHttp = new MosHttp(configuration.http);
var mosWebSockets = new MosWebSockets(configuration.websockets)
mosHttp.listen();
mosWebSockets.listen(mosHttp); //ki kell tudja szedni a memoryStore-t és a server-t

/*
 * Utils és memorydb :)
 */
/*
var users = {
  test: {
    name: 'test',
    salt: 'essé-mán-le-a-fárúl',
    pass: hash('test2', 'essé-mán-le-a-fárúl')
  }
};
//exports.users = users;
//global.hash = hash;					//mehet ki mos.commons.utils-ba
//global.users = users;				//ehelyett egy system socket amin keresztül db-től lehet lekérdezni

/*
 * Init & Listen
 */
//mosHttp.init(this, mosRoutes);
//mosHttp.listen();
//mosWebSockets.listen(mosHttp.server);

