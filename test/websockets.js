/**
 * @author Grigore András Zsolt
 */

var MosHttp = require('../http/MosHttp.js');
var mosRoutes = require('../http/mosRoutes.js')
var MosWebSockets = require('../websockets/MosWebSockets.js');

var mosHttp = new MosHttp({});
var mosWebSockets = new MosWebSockets({ httpInstance : mosHttp.server});
mosWebSockets.start();
mosRoutes.registerRoutes(mosHttp.server, {});
mosHttp.start();
console.log(mosHttp);
