/**
 * @author Grigore András Zsolt
 */


var User = function (nick, pass, hash){
  	this.nick = nick || "";
	this.source = nick || "@meshdev"; //+postfix
	this.pass = pass || "";
	this.hash = hash || "";
}

User.prototype.createHash = function (){
	//worker thread-be this.hash = hash(this.pass, salt)
}

User.prototype.isValidHash = function (hashToCheck){
  	//console.log("---------------ObjectEquals - %d :: ValueEquals - %d", hashToCheck === this.hash, hashToCheck == this.hash);
	if (hashToCheck == this.hash) return true;
	return false;
}

module.exports = User;
