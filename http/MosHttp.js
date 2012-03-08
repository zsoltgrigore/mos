/**
 * @author Grigore András Zsolt
 */

var express = require("express");
var	util = require("util");
var Logger = require('../utils/Logger');
var middlewares= require('./middlewares/');

var	MemoryStore = express.session.MemoryStore;

var MosHttp = function (mosHttpConfig) {
	mosHttpConfig = mosHttpConfig || {};
	
	//Publikus változók
	//-----------------
	this.host = mosHttpConfig.host || "localhost";
	this.port = mosHttpConfig.port || 8080;
	this.expressMiddlewares = mosHttpConfig.use || {};
	
	//Nem annyira publikus változók
	//-----------------------------
	this.address = false;
	this.mosMiddlewares = false;
	this.server = express.createServer();
	this.sessionStore = new MemoryStore();
	this.logger = new Logger({target : "MosHttp<Server>"});
	
	//Init
	this.addExpressMiddleWares();
	this.collectMosMiddlewares();
	//this.addWorkingRoutes();
	this.addTester();
}

MosHttp.prototype.addExpressMiddleWares = function () {
	for (var index in this.expressMiddlewares) {
			this.logger.info("M-O-S use: %s", this.expressMiddlewares[index]);
    		this.server.use(eval(this.expressMiddlewares[index]));
    }
};

MosHttp.prototype.addTester = function() {
	var mosHttp = this;
	mosHttp.server.get("/", function (req, res) {
		mosHttp.logger.info("'/'-re érkezett req");
  		res.sendfile(__dirname +'/staticview/tester.html');
	})
}

MosHttp.prototype.collectMosMiddlewares = function () {
	
	console.log(middlewares);
};

MosHttp.prototype.listen = function () {
	var mosHttp = this;
	mosHttp.server.listen(mosHttp.port, mosHttp.host, function () {
  		mosHttp.address = mosHttp.server.address();
  		mosHttp.logger.info("M-O-S HTTP szerver indult @ http://%s:%s", mosHttp.address.address, mosHttp.address.port);
	});
};

module.exports = MosHttp;
/*
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
//exports.server = server;
/******************Public functions*********/
//exports.init = init;
//exports.listen = listen;
/*******************************************/
/*
var addExpressMiddleWares = function(middleWares) {
	for (var index in middleWares) {
    		server.use(eval(middleWares[index]));
    }
}
*/