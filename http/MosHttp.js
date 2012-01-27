/**
 * @author Grigore András Zsolt
 */

var express = require("express"),
	util = require("util"),
	fs = require("fs"),
	MemoryStore = express.session.MemoryStore;

var server = express.createServer(),
	sessionStore = new MemoryStore(),
	runEnv = process.env.NODE_ENV || 'development';

var _core = false;

var listen = function() {
	configure();
	server.listen(_core.config.http[runEnv].port, _core.config.http[runEnv].host, function () {
  		var addr = server.address();
  		console.log('   M-O-S http listening on http://' + addr.address + ':' + addr.port);
	});
}

var init = function(core, routes) {
	_core = core;
	var routeConfig = null;
	/* merge general and currEnv routes
	 * TODO: test
	var routeConfig = _core.config.http.general.routes;
	for (var i=0; i<_core.config.http[runEnv].routes.length; i++)
		routeConfig.push(_core.config.http[runEnv].routes[i]);
	*/
	routes(server, routeConfig);
}

var add = function(key, value) {
	server[key] = value;
}

/******************Public variables*********/
exports.server = server;
/******************Public functions*********/
exports.init = init;
exports.add = add;
exports.listen = listen;
/*******************************************/

var configure = function() {
	server.configure(function(){
    	configfn('general');
	});

	server.configure('development', function(){
    	configfn('development');
	});

	server.configure('production', function(){
  		configfn('production');
	});
	server.sessionStore = sessionStore;
}

var configfn = function(current_runEnv) {
	for (var index in _core.config.http[current_runEnv].use) {
    		server.use(eval(_core.config.http[current_runEnv].use[index]));
    }
}
