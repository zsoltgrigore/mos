/**
 * @author Grigore András Zsolt
 */

var express = require("express");
var util = require("util");
var fs = require("fs");


/*
 * @classDescription 
 * 		MdsHttp osztály
 *
 * 
 * @param {Object} config
 * 		A http osztályhoz tartozó konfigurációs objektum
 * 		mosHttpConfig = {
 * 			host : {String} //host amin hallgatózunk
 * 			port : {Number} //port amin hallgatózunk
 * 			config : {Object} // configuration ojjektum
 * 			router : {Object} // router ojjektum
 * 		}
 */
var MosHttp = function(mosHttpConfig){
	this.host = mosHttpConfig.host || "localhost";
	this.port = mosHttpConfig.port || 8080;
	
	this.server = express.createServer();
	
	this.server.configure(function(){
    	this.server.use(express.methodOverride());
    	this.server.use(express.bodyParser());
    	this.server.use(this.server.router);  //itt kerül a router a képbe
	}.bind(this));

	this.server.configure('development', function(){
    	this.server.use(express.static(__dirname + '/public'));
    	this.server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	}.bind(this));

	this.server.configure('production', function(){
  		var oneYear = 31557600000;
  		this.server.use(express.static(__dirname + '/public', { maxAge: oneYear }));
  		this.server.use(express.errorHandler());
	}.bind(this));

}

MosHttp.prototype.start = function() {
	this.server.listen(8080);
	console.info("Server running on %s:%d", "localhost", 8080);
}

module.exports = MosHttp;