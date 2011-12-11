/**
 * Üres esb_login_resp Javascript reprezentációja
 *
 * @author Grigore András Zsolt
 */

var esb_login_resp = {
	header : {
		protocol : "mcp5",
		name : "esb_login_resp",
		source : "",
		destination : "",
		session_id : "",				//random szám 10000 és 50000 közt
		security_id : ""
	},
	data : {
		login_success : "",				//1 ha success 0 ha failure
  	}
};

module.exports = esb_login_resp;