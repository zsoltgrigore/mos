/**
 * @author Grigore András Zsolt
 */


var EsbMsgProcessor = function (esbSocket) {

var parent = module.parent.exports
console.log(parent);

parent.on("succesfull login", function(data){
	parent.emit("bakker", "ez innen jött");
});

parent.on("bakker", function(data){
	console.log("bakkeremit: %s", data);
});

}

module.exports = EsbMsgProcessor