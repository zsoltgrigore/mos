/**
 * @author Grigore András Zsolt
 */

var esb_login_req = function () {
	this.header = {
		protocol : "mcp5",
		name : "esb_login_req",
		source : "",
		destination : "",
		session_id : "",
		security_id : ""
	},
	this.data =	 {
		password : ""
  	}
}

module.exports = esb_login_req;