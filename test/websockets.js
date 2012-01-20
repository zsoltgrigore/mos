/**
 * @author Grigore András Zsolt
 */
var mosHttp = require('../http/MosHttp.js');
var mosRoutes = require('../http/MosRoutes.js');
var mosWebSockets = require('../websockets/MosWebSockets.js');

mosHttp.registerRoutes(mosRoutes);
mosHttp.listen();
mosWebSockets.listen(mosHttp.server);
