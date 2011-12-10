/**
 * @author Grigore András Zsolt
 */
var esb = require("./esb/");


var instance1 = new esb.EsbSocket("i1");
var instance2 = new esb.EsbSocket("i2");
var instance3 = new esb.EsbSocket("i3");

instance1.connect(2525, "localhost");
instance2.connect(2525, "localhost");
instance3.connect(2525, "localhost");

instance1.on("esb data", function(esbdata){
	console.log("1: " + Object.keys(esbdata).length);
})

instance2.on("esb data", function(esbdata){
	console.log("2: " + Object.keys(esbdata).length);
})

instance3.on("esb data", function(esbdata){
	console.log("3: " + Object.keys(esbdata).length);
})