/**
 * @author Grigore András Zsolt
 */

var EsbSocket = require('../../esb/').EsbSocket;
var	User = require("../../model/auth/User");
var	hash = require("../../utils/security").hash;

function authenticate(name, pass, fn) {
  	//itt valami olyasmi hogy, ellenőrizni hogy van-e már ehhez a user-hez esbSocket
	//ha van akkor minden onnan érkező üzenetet megkap, sőt valahogyan ugyanazt is kéne lássa mindkét böngészőben,
	//ha nézetet vált egyikben akkor változzon a másik is, de egyenlőre csak szóljunk hogy már be van lépve és rakjuk ki
  	var tempEsbSocket = new EsbSocket(configuration.esb);
	tempEsbSocket.user = new User(name, pass);
	tempEsbSocket.reconnectAllowed = false;
	tempEsbSocket.connect();
	
  	tempEsbSocket.on("successfull login", function (resp){
		tempEsbSocket.reconnectAllowed = true;
		console.log("Só: %s",tempEsbSocket.salt);
		tempEsbSocket.user.hash = hash(pass, tempEsbSocket.salt);
		fn(null, tempEsbSocket);
	});
	
  	tempEsbSocket.on("access denied", function (resp){
		fn(new Error('Hibás felhasználói adatok!'));
	});
	
	tempEsbSocket.on("end", function (){
		fn(new Error('Szolgáltatás nem elérhető'));
	});
	
}

exports.authenticate = authenticate;
