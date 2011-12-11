/**
 * @author Grigore András Zsolt
 */

var esb_hello_req = function () {
  	this.header = {
    	protocol : "mcp5",
    	name : "esb_hello_req",
    	source : "",
    	destination : "",
    	session_id : "",
    	security_id : ""
  	};
  	this.data = {};
}

module.exports = esb_hello_req;
