/**
 * @author Grigore András Zsolt
 */

var express = require("express");
var util = require("util");
var fs = require("fs");

var server = express.createServer();
var core = false;

var attachCore = function (core) {
	core = this.core
}

var listen = function() {
	configure();
	server.listen(8080);
	console.info("Server running on %s:%d", "localhost", 8080);
}

var registerRoutes = function(callback) {
	
	callback(server, core || null);
	
}

/******************Public variables*********/
exports.core = core;
exports.server = server;
/******************Public functions*********/
exports.attachCore = attachCore;
exports.listen = listen;
exports.registerRoutes = registerRoutes;
/*******************************************/

var configure = function() {
	server.configure(function(){
    	server.use(express.methodOverride());
    	server.use(express.bodyParser());
    	server.use(server.router);
	});

	server.configure('development', function(){
    	server.use(express.static(__dirname + '/public'));
    	server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	});

	server.configure('production', function(){
  		var oneYear = 31557600000;
  		server.use(express.static(__dirname + '/public', { maxAge: oneYear }));
  		server.use(express.errorHandler());
	});
}