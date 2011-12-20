/**
 * @author Grigore András Zsolt
 */

var express = require("express");
var util = require("util");
var fs = require("fs");

var MdsHttp = function(mdsHttpConfig){
	this.mdsHttpConfig = mdsHttpConfig;
}

MdsHttp.prototype.createServer = function() {
	this.server = express.createServer();
	console.log(this);
},

module.exports = MdsHttp;