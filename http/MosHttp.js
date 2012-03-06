/**
 * @author Grigore András Zsolt
 */

var express = require("express"),
	util = require("util"),
	MemoryStore = express.session.MemoryStore;

var server = express.createServer(),
	sessionStore = new MemoryStore();

//TODO: van olyan hogy singleton és hogyan lehet elérni? Ha van akkor ezt arra kell cserélni
var _core = false;

var listen = function() {
	server.listen(_core.config.http[_core.runEnv].port, _core.config.http[_core.runEnv].host, function () {
  		var addr = server.address();
  		console.log('   M-O-S http listening on http://' + addr.address + ':' + addr.port);
	});
}

var init = function(core, addRoutes) {
	_core = core;
	var generalMiddleWares = _core.config.http.general.use;
	var envMiddleWares = _core.config.http[_core.runEnv].use;
	var generalRoutes = _core.config.http.general.routes;
	var envRoutes = _core.config.http[_core.runEnv].routes;
	
	server.sessionStore = sessionStore;
	
	addExpressMiddleWares(generalMiddleWares.concat(envMiddleWares));
	addRoutes(server, generalRoutes.concat(envRoutes));
}

/******************Public variables*********/
exports.server = server;
/******************Public functions*********/
exports.init = init;
exports.listen = listen;
/*******************************************/

var addExpressMiddleWares = function(middleWares) {
	for (var index in middleWares) {
    		server.use(eval(middleWares[index]));
    }
}
