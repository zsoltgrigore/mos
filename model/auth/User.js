/**
 * @author Grigore András Zsolt
 */

var	hash = require("../../utils/security").hash;

var User = module.exports = function (source, pass, hash){
	this.source = source || "";
	this.pass = pass || "";
	this.hash = hash || "";
}

User.prototype.createHash = function (salt, callback){
	if (callback) {
		//worker thread-be this.hash = hash(this.pass, salt);
	} else {
		this.hash = hash(this.pass, salt);
	}
}

User.prototype.isValidHash = function (hashToCheck){
  	//console.log("---------------ObjectEquals - %d :: ValueEquals - %d", hashToCheck === this.hash, hashToCheck == this.hash);
	if (hashToCheck == this.hash) return true;
	return false;
}