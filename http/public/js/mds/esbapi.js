/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	function agv_get_xy_req() {
		this.header = {
			protocol:"mcp5",
			name: "agv_get_xy_req",
			source: "",
			destination: "",
			session_id: "",
			security_id: ""
		};
		this.data = {};
	}
	
	function agv_get_status_req() {
		this.header = {
			protocol: "mcp5",
			name: "agv_get_status_req",
			source: "",
			destination: "",
			session_id: "",
			security_id: ""
		};
		this.data = {};
	}
	
	exports.agv_get_xy_req = agv_get_xy_req;
	exports.agv_get_status_req = agv_get_status_req;
});