/**
 * @author Grigore András Zsolt
 */

var mosHttp = require('../http/MosHttp.js');
var mosRoutes = require('../http/MosRoutes.js')

mosHttp.registerRoutes(mosRoutes);
mosHttp.listen()