/**
 * @author Grigore András Zsolt
 */

var EsbSocket = require('../../esb/').EsbSocket;
var	User = require("../../model/auth/User");
var	hash = require("../../utils/security").hash;
var	cloneConfig = require("../../utils/general").cloneConfig;

function authenticate(name, pass, callback) {
  	//itt valami olyasmi hogy, ellenőrizni hogy van-e már ehhez a user-hez esbSocket
	//ha van akkor minden onnan érkező üzenetet megkap, sőt valahogyan ugyanazt is kéne lássa mindkét böngészőben,
	//ha nézetet vált egyikben akkor változzon a másik is
	// TODO: console.log(typeof this); <------ ennek MosHttp-t kellene visszaadnia nem pedig object-et
	
	if (this.socketMap[name]) return callback(new Error('Már be van jelentkezve!'));
	
	var userSocketConfig = cloneConfig(configuration.esb);
	userSocketConfig.user = new User(name, pass);
	userSocketConfig.reconnectAllowed = false;
	
  	var tempEsbSocket = new EsbSocket(userSocketConfig);
	tempEsbSocket.connect();
		
  	tempEsbSocket.on("successfull login", function (resp){
		tempEsbSocket.reconnectAllowed = true;
		tempEsbSocket.user.hash = hash(pass, tempEsbSocket.salt);
		return callback(null, tempEsbSocket);
	});
	
  	tempEsbSocket.on("access denied", function (resp){
		tempEsbSocket.end();
		return callback(new Error('Hibás felhasználói adatok!'));
	});
	
	tempEsbSocket.on("end", function (){
		tempEsbSocket.end();
		return callback(new Error('Szolgáltatás nem elérhető'));
	});
}

exports.authenticate = authenticate;
