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
	this.routes = mosHttpConfig.routes || [{ path: "/", method: "get", middlewares: []}];
	this.expressMiddlewares = mosHttpConfig.use || {};
	
	//Nem annyira publikus változók
	//-----------------------------
	this.address = false;
	this.httpPath = __dirname;
	this.server = express.createServer();
	this.sessionStore = new MemoryStore();
	this.logger = new Logger({target : "MosHttp<Server>"});
	
	//Init
	this.addExpressMiddleWares();
	this.applyMosMiddlewares();
}

MosHttp.prototype.addExpressMiddleWares = function () {
	for (var index in this.expressMiddlewares) {
			this.logger.info("M-O-S use: %s", this.expressMiddlewares[index]);
    		this.server.use(eval(this.expressMiddlewares[index]));
    }
};

MosHttp.prototype.applyMosMiddlewares = function () {
	for (var routeIt in this.routes) {
		var numOfAvailableMW = 0;
		var availableMW = [];
		for (var middlewareIt in this.routes[routeIt].middlewares) {
			var middlewareImpl = getMiddlewareValue(this.routes[routeIt].middlewares[middlewareIt]);
			if (middlewareImpl){
				availableMW.push(middlewareImpl.bind(this)); //minden routeHandler-nek a mosHttp a kontextusa
				numOfAvailableMW++;
			}
		}
		if (this.routes[routeIt].middlewares.length == numOfAvailableMW) {
			this.logger.info("'%s' útvonalhoz tartozó '%s' method kérés lekezelhető. Hozzáadva!",
					this.routes[routeIt].path, this.routes[routeIt].method);
			//hozzáad a szerverhez egy "method" típusú és "path" elérésű útvonalat a megtalált kezelő fügvényekkel
			this.server[this.routes[routeIt].method](this.routes[routeIt].path , availableMW);
		} else {
			this.logger.warn("'%s' útvonalhoz tartozó '%s' method kérés lekezeléséhez nincs háttér logika. Eldobva!",
					this.routes[routeIt].path, this.routes[routeIt].method);
		}
		//console.log(availableMW.shift());
		//console.log(availableMW.length);
	}
	//console.log(middlewares); elérhető middleware implementációk akár tesztelni is lehetne őket a jövőben
	//és csak működő implementációt használni az egyes útvonalakon
};

//áthidalás, ki kell majd dobni és
//TODO: kicserélni util/general.objectGetKeyValue
function getMiddlewareValue(middlewareName) {
	for (var category in middlewares) {
		for (var middlewareDefName in middlewares[category]) {
			if (middlewareName == middlewareDefName)
				return middlewares[category][middlewareDefName];
		}
	}
	return false;
}


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