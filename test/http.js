/**
 * @author Grigore András Zsolt
 */

var MosHttp = require('../http/MosHttp.js');
var mosRoutes = require('../http/mosRoutes.js')

var mosHttp = new MosHttp({});
mosRoutes.registerRoutes(mosHttp.server, {});
mosHttp.start();