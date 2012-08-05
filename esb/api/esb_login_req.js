/**
 * @author Grigore András Zsolt
 */

module.exports = function () {
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