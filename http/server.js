let express = require("express");

module.exports = function(conf) {
    let server = express().listen(conf.port || 8080, conf.host || "localhost", function () {
        console.log(server.address());
	});
    
    return Object.freeze({
      server  
    })
}