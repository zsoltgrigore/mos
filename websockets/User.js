/**
 * @author Grigore András Zsolt
 */

var User = function (nickname, password, esbConnection){
  	this.nick = nickname || "";
  	this.pass = password || "";
}

module.exports = User;