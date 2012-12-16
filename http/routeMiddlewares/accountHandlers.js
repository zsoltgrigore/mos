/**
 * @author Grigore András Zsolt
 */

var EsbSocket = require('../../esb/').EsbSocket;
var	User = require("../../model/auth/User");

exports.authenticate = function(source, pass, callback) {

	if (this.socketMap[source]) return callback(new Error('Már be van jelentkezve!'));
	
	//var userSocketConfig = cloneConfig(global.configuration.esb);
	
	//AFTER working memdb socket implemented the process must be the following
	//1. on the service connection: get user with "name" from memdb (should be async, consider process.nextTick)
	//2. until we are waiting for the result create user and it's hash
	//3. after result will arrive we can check the hash
	var tempUser = new User(source, pass);
	tempUser.createHash(this.salt);
	if (global.users[source] && tempUser.hash == global.users[source]) {
		return callback(null, tempUser);
	} else {
		//lehet dobni a megfelelő errort
		return callback(new Error('Hibás felhasználói adatok!'));
	}
};