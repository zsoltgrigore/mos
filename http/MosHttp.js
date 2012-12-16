/**
 * @author Grigore András Zsolt
 */

var express = require("express");
var http = require("http");
var util = require("util");
var Logger = require('../utils/Logger');
var routeMiddlewares = require('./routeMiddlewares/');
var appMiddlewares = require('./appMiddlewares/');
var	MemoryStore = express.session.MemoryStore;
var EventEmitter = require('events').EventEmitter;
var objectGetKeyValue = require('../utils/general').objectGetKeyValue;

/*
 * moshttp.emit("new auth chan req", esbSocket);
 */
var MosHttp = module.exports = function (mosHttpConfig) {
	mosHttpConfig = mosHttpConfig || {};
	EventEmitter.call(this);
	
	//Publikus változók
	//-----------------
	this.host = mosHttpConfig.host || "localhost";
	this.port = mosHttpConfig.port || 8080;
	this.salt = mosHttpConfig.salt || "";
	this.defualtLanding = mosHttpConfig.defaultLanding || "/";
	this.showErrorStack = mosHttpConfig.showErrorStack || false;
	this.routes = mosHttpConfig.routes || [{ path: "/", method: "get", middlewares: []}];
	this.expressMiddlewares = mosHttpConfig.use || {};
	
	//Nem annyira publikus változók
	//-----------------------------
	this.address = false;
	this.httpPath = __dirname;
	this.socketMap = {};
	this.app = express();
	this.server = http.createServer(this.app);
	this.logger = new Logger({target : "MosHttp<Server>"});
	//memorystore helyett esb!!
	this.sessionStore = new MemoryStore();

	//set
	this.app.set('view engine', mosHttpConfig.viewEngine);
	this.app.set('view options', {layout: false});
	this.app.set('views', __dirname + '/views');
	
	//Init
	this.addExpressMiddleWares();
	this.applyMosMiddlewares();

}
util.inherits(MosHttp, EventEmitter);

MosHttp.prototype.addExpressMiddleWares = function () {
	//access log: "express.logger('short')"
	for (var index in this.expressMiddlewares) {
		var middlewareName = this.expressMiddlewares[index];
		try {
			var middlewareScript;
			if (typeof this.expressMiddlewares[index] === 'object') {
				var customMiddleware = this.expressMiddlewares[index];
				// a custom middleware-ek (key-value pár) objektumok a konfigban; key - a tároló neve
				var middlewareContainer = Object.keys(customMiddleware)[0];
				//                                                              ; value a middleware neve
				middlewareScript = objectGetKeyValue(eval(middlewareContainer))[customMiddleware[middlewareContainer]].bind(this);
				middlewareName = middlewareContainer+"."+customMiddleware[middlewareContainer];
			} else {
				middlewareScript = eval(this.expressMiddlewares[index])
			}
			this.app.use(middlewareScript);
			this.logger.info("M-O-S use: %s", middlewareName);
		} catch (e) {
			this.logger.warn("A %s application middleware hozzáadása nem sikerült: %s", 
								middlewareName, e.message);
		}
	}
};

MosHttp.prototype.applyMosMiddlewares = function () {
	for (var routeIt in this.routes) {
		var numOfAvailableMW = 0;
		var availableMW = [];
		for (var middlewareIt in this.routes[routeIt].middlewares) {
			var middlewareImpl = objectGetKeyValue(routeMiddlewares)[this.routes[routeIt].middlewares[middlewareIt]];
			if (middlewareImpl){
				availableMW.push(middlewareImpl.bind(this)); //minden routeHandler-nek a mosHttp a kontextusa
				numOfAvailableMW++;
			}
		}
		if (this.routes[routeIt].middlewares.length == numOfAvailableMW) {
			this.logger.info("'%s' útvonalhoz tartozó '%s' method kérés lekezelhető. Hozzáadva!",
					this.routes[routeIt].path, this.routes[routeIt].method);
			//hozzáad a szerverhez egy "method" típusú és "path" elérésű útvonalat a megtalált kezelő fügvényekkel
			this.app[this.routes[routeIt].method](this.routes[routeIt].path , availableMW);
		} else {
			this.logger.warn("'%s' útvonalhoz tartozó '%s' method kérés lekezeléséhez nincs háttér logika. Eldobva!",
					this.routes[routeIt].path, this.routes[routeIt].method);
		}
	}
	//console.log(middlewares); elérhető middleware implementációk akár tesztelni is lehetne őket a jövőben
	//és csak működő implementációt használni az egyes útvonalakon
};

MosHttp.prototype.listen = function() {
	var mosHttp = this;
	
	mosHttp.server.listen(mosHttp.port, mosHttp.host, function (data) {
		mosHttp.address = mosHttp.server.address();
		mosHttp.logger.info("M-O-S HTTP szerver indult @ http://%s:%s", mosHttp.address.address, mosHttp.address.port)
	});
};

MosHttp.prototype.getSourceToHash = function(hash) {
	for (var i in this.socketMap) {
		if (hash == this.socketMap[i].user.hash)
			return this.socketMap[i].user.source;
	}
	return false;
};