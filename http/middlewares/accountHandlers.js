/**
 * @author Grigore András Zsolt
 */

var EsbSocket = require("esbSocket!!!");

function authenticate(name, pass, fn) {
  	//itt valami olyasmi hogy, ellenőrizni hogy van-e már ehhez a user-hez esbSocket
	//ha van akkor minden onnan érkező üzenetet megkap, sőt valahogyan ugyanazt is kéne lássa mindkét böngészőben,
	//ha nézetet vált egyikben akkor változzon a másik is, de egyenlőre csak szóljunk hogy már be van lépve és rakjuk ki
  	var tempEsbSocket = new EsbSocket(configuration.esb);
	tempEsbSocket.esbSocketClient.source = name;
	tempEsbSocket.esbSocketClient.password = pass;
	tempEsbSocket.esbSocketClient.connect();
  	tempEsbSocket.on("succesfull login", function (resp){
		fn(null, this);
	}.bind(tempEsbSocket));
  	tempEsbSocket.on("access denied", function (resp){
		fn(new Error('Hibás felhasználói adatok!'));
		this.end();
	}.bind(tempEsbSocket));
	tempEsbSocket.on("end", function (){
		fn(new Error('Szolgáltatás nem elérhető'));
		this.end();
	}.bind(tempEsbSocket));
	
}

exports.authenticate = authenticate;