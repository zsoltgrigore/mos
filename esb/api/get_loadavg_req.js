/**
 * @author Grigore András Zsolt
 */

var get_loadavg_req = function () {
	this.header = {
		protocol : "mcp5",
		name : "get_loadavg_req",
		source : "",
		destination : "esbd1.prod@meshnetwork.hu",
		session_id : "",
		security_id : ""
	},
	this.data =	 {
  	}
}

module.exports = get_loadavg_req;