/**
 * Üres esb_login_resp Javascript reprezentációja
 *
 * @author Grigore András Zsolt
 */

var get_loadavg_resp = function() {
	this.header = {
		protocol : "mcp5",
		name : "get_loadavg_resp",
		source : "",
		destination : "",
		session_id : "",
		security_id : ""
	};
	this.data = {
		loadavg : "",							//pl "1.22 1.13 0.94" 
  	};
};

module.exports = get_loadavg_resp;