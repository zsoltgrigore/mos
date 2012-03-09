/**
 * @author Grigore András Zsolt
 */

var config = require("../utils/config");
var general = require("../utils/general");
var fs = require("fs");

var testObj = {
	key1: "valu1",
	key2: "valu2",
	emb1obj: {
		add: function(a,b) {
			return a+b;
		},
		divide: function(a,b) {
			return a/b;
		},
		emb2obj: {
			key3: "value3",
			substract: function(a,b) {
				return a-b;
			}
		}
	}
}

console.time('---config.createGlobalConfig');
console.log(config.createGlobalConfig(fs.readFileSync('../mos.config.json', 'utf-8')));
console.timeEnd('---config.createGlobalConfig');

console.time('----general.objectGetKeyValueFromFirstLevel');
console.log(general.objectGetKeyValue(testObj, "key2"));
console.timeEnd('----general.objectGetKeyValueFromFirstLevel');

console.time('-----general.objectGetKeyValueFromSecondLevel');
console.log(general.objectGetKeyValue(testObj, "divide"));
console.timeEnd('-----general.objectGetKeyValueFromSecondLevel');

console.time('------general.objectGetKeyValueFromThirdLevel');
console.log(general.objectGetKeyValue(testObj, "substract"));
console.timeEnd('------general.objectGetKeyValueFromThirdLevel');
