/**
 * @author Grigore András Zsolt
 */

var EsbSocket = require('../../esb/').EsbSocket;
var	User = require("../../model/auth/User");

exports.authenticate = function(source, pass, callback) {
	//itt valami olyasmi hogy, ellenőrizni hogy van-e már ehhez a user-hez esbSocket
	//ha van akkor minden onnan érkező üzenetet megkap, sőt valahogyan ugyanazt is kéne lássa mindkét böngészőben,
	//ha nézetet vált egyikben akkor változzon a másik is
	// TODO: console.log(typeof this); <------ ennek MosHttp-t kellene visszaadnia nem pedig object-et
	
	if (this.socketMap[source]) return callback(new Error('Már be van jelentkezve!'));
	
	//var userSocketConfig = cloneConfig(global.configuration.esb);
	
	//AFTER working memdb socket implemented the process must be the following
	//1. on the service connection: get user with "name" from memdb (should be async, consider process.nextTick)
	//2. until we are waiting for the result create user and it's hash
	//3. after result will arrive we can check the hash
	var tempUser = new User(source, pass);
	tempUser.createHash(this.salt);
	if (global.users[source] && tempUser.hash == global.users[source].hash) {
		return callback(null, tempUser);
	} else {
		console.log(this.salt);
		console.log(tempUser);
		//lehet dobni a megfelelő errort
		return callback(new Error('Hibás felhasználói adatok!'));
	}

	/*ezt itt ki kell cserélni valami system socket-re amin adatcsere megy, addig is fájl*/
	/*var tempEsbSocket = new EsbSocket(userSocketConfig);
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
	tempEsbSocket.on("end", endHandler);*/
}