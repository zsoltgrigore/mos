/**
 * @author Grigore András Zsolt
 */
json_parse = require("../utils/json_parse_rec.js");
var fs = require("fs");
var filecontent = fs.readFileSync("dummy.json", "utf8");
var fcLength = filecontent.length;
var esb = require("../esb/");
var client = new esb.EsbSocket();

function rndbtw(max, min){
	return min+(Math.floor(Math.random()*(max-min+1)));	
}
var testData = [
				''+filecontent,
				''+filecontent+''+filecontent,
				''+filecontent+''+filecontent+''+filecontent,
				''+filecontent+''+filecontent+''+filecontent+''+filecontent,
				''+filecontent+''+filecontent+''+filecontent+''+filecontent+''+filecontent,
				''+filecontent+''+filecontent+''+filecontent+''+filecontent+''+filecontent+''+filecontent
				];

client.esbSocketBuffer = testData[0]+filecontent.slice(0,rndbtw(fcLength-1,0));
console.log("maradek->" + client.stringBufferToJsonExt()+"<-");			

//setInterval(function () {
/*var rnd = rndbtw(3,1);
for (var i = 0; i < 3; i++) {
	client.esbSocketBuffer += filecontent;
}*/
/*
console.time('parse-1');
for (var j=0; j<1; j++){	
	client.esbSocketBuffer = testData[rndbtw(5,0)]+""+filecontent.slice(0,rndbtw(fcLength-1,0));
	client.stringBufferToJsonExt();
	client.esbSocketBuffer = "";
}	
console.timeEnd('parse-1');

console.time('parse-10');
for (var j=0; j<10; j++){	
	client.esbSocketBuffer = testData[rndbtw(5,0)]+""+filecontent.slice(0,rndbtw(fcLength-1,0));
	client.stringBufferToJsonExt();
	client.esbSocketBuffer = "";
}	
console.timeEnd('parse-10');

console.time('parse-100');
for (var j=0; j<100; j++){	
	client.esbSocketBuffer = testData[rndbtw(5,0)]+""+filecontent.slice(0,rndbtw(fcLength-1,0));
	client.stringBufferToJsonExt();
	client.esbSocketBuffer = "";
}	
console.timeEnd('parse-100');

console.time('parse-1000');
for (var j=0; j<1000; j++){	
	client.esbSocketBuffer = testData[rndbtw(5,0)]+""+filecontent.slice(0,rndbtw(fcLength-1,0));
	client.stringBufferToJsonExt();
	client.esbSocketBuffer = "";
}	
console.timeEnd('parse-1000');

console.time('parse-10000');
for (var j=0; j<10000; j++){	
	client.esbSocketBuffer = testData[rndbtw(5,0)]+""+filecontent.slice(0,rndbtw(fcLength-1,0));
	client.stringBufferToJsonExt();
	client.esbSocketBuffer = "";
}	
console.timeEnd('parse-10000');
/*
console.time('parse-100000');
for (var j=0; j<100000; j++){	
	client.esbSocketBuffer = testData[rndbtw(5,0)]+""+filecontent.slice(0,rndbtw(fcLength-1,0));
	client.stringBufferToJson();
	client.esbSocketBuffer = "";
}	
console.timeEnd('parse-100000');*/