/**
 * @author Grigore András Zsolt
 */

var express = require("express");
var util = require("util");
var fs = require("fs");

var server = express.createServer();
var runEnv = process.env.NODE_ENV || 'development';
var config = {};
var core = false;

var listen = function() {
	configure();
	server.listen(config[runEnv].port, config[runEnv].host, function () {
  		var addr = server.address();
  		console.log('   M-O-S http listening on http://' + addr.address + ':' + addr.port);
	});
}

var init = function(httpConfig, routes) {
	config = httpConfig;
	routes(server, config.routes);
}

/******************Public variables*********/
exports.core = core;
exports.server = server;
/******************Public functions*********/
exports.listen = listen;
exports.init = init;
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
}

var configfn = function(current_runEnv) {
	for (var index in config[current_runEnv].use) {
    		server.use(eval(config[current_runEnv].use[index]));
    }
}
