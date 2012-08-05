/**
 * @author Grigore András Zsolt
 */

var express = require("express");
var util = require("util");
var Logger = require('../utils/Logger');
var secUtils = require('../utils/security');
var middlewares= require('./middlewares/');
var	MemoryStore = express.session.MemoryStore;
var EventEmitter = require('events').EventEmitter;

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
	this.server = express.createServer();
	this.logger = new Logger({target : "MosHttp<Server>"});
	//memorystore helyett esb!!
	this.sessionStore = new MemoryStore();

	//set
	this.server.set('view engine', mosHttpConfig.viewEngine);
	this.server.set("view options", { layout: false });
	this.server.set('views', __dirname + '/views');

	//Init
	this.addExpressMiddleWares();
	this.applyMosMiddlewares();
	this.applyErrorHandling();
}
util.inherits(MosHttp, EventEmitter);

MosHttp.prototype.addExpressMiddleWares = function () {
	for (var index in this.expressMiddlewares) {
		this.logger.info("M-O-S use: %s", this.expressMiddlewares[index]);
		//access log: "express.logger('short')"
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
	}
	//console.log(middlewares); elérhető middleware implementációk akár tesztelni is lehetne őket a jövőben
	//és csak működő implementációt használni az egyes útvonalakon
};

MosHttp.prototype.applyErrorHandling = function () {
	if (getMiddlewareValue('notFound')) {
		this.server.use(getMiddlewareValue('notFound').bind(this));
	};
	if (getMiddlewareValue('error')) {
		this.server.use(getMiddlewareValue('error').bind(this));
	};
}

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