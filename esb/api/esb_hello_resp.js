/**
 * @author Grigore András Zsolt
 */

var esb_hello_resp = function () {
  	this.header = {
    	protocol : "mcp5",
    	name : "esb_hello_resp",
    	source : "",
    	destination : "",
    	session_id : "",
    	security_id : ""
  	};
  	this.data = {};
}

module.exports = esb_hello_resp;