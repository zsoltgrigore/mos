/**
 * @author Grigore András Zsolt
 */

var EsbSocket = require('../../esb/').EsbSocket;
var	User = require("../../model/auth/User");
var	hash = require("../../utils/security").hash;
var	cloneConfig = require("../../utils/general").cloneConfig;

exports.authenticate = function(name, pass, callback) {
  	//itt valami olyasmi hogy, ellenőrizni hogy van-e már ehhez a user-hez esbSocket
	//ha van akkor minden onnan érkező üzenetet megkap, sőt valahogyan ugyanazt is kéne lássa mindkét böngészőben,
	//ha nézetet vált egyikben akkor változzon a másik is
	// TODO: console.log(typeof this); <------ ennek MosHttp-t kellene visszaadnia nem pedig object-et
	
	if (this.socketMap[name]) return callback(new Error('Már be van jelentkezve!'));
	
	var userSocketConfig = cloneConfig(global.configuration.esb);
	userSocketConfig.user = new User(name, pass);
	userSocketConfig.reconnectAllowed = false;
	
  	var tempEsbSocket = new EsbSocket(userSocketConfig);
	tempEsbSocket.connect();
	
  	var successfullLoginHandler = function (resp){
		tempEsbSocket.reconnectAllowed = global.configuration.esb.reconnectAllowed;
		tempEsbSocket.user.hash = hash(pass, tempEsbSocket.salt);
		tempEsbSocket.removeListener("successfull login", successfullLoginHandler);
		return callback(null, tempEsbSocket);
	}
	tempEsbSocket.on("successfull login", successfullLoginHandler);
	
	var accessDeniedHandler = function (resp){
		tempEsbSocket.end();
		tempEsbSocket.removeListener("access denied", accessDeniedHandler);
		//lehet dobni a megfelelő errort
		return callback(new Error('Hibás felhasználói adatok!'));
	}
  	tempEsbSocket.on("access denied", accessDeniedHandler);
	
	var endHandler = function (){
		tempEsbSocket.end();
		tempEsbSocket.removeListener("access denied", endHandler);
		return callback(new Error('Szolgáltatás nem elérhető'));
	}
	tempEsbSocket.on("end", endHandler);
}