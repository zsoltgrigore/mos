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
	
	function agv_get_xy_resp() {
		this.header = {
			protocol:"mcp5",
			name: "agv_get_xy_resp",
			source: "",
			destination: "",
			session_id: "",
			security_id: ""
		};
		//TODO: üzenet kiegészítése szabványnak megfelelően
	}

	exports.pairs.agv_get_xy = {
		agv_get_xy_req : agv_get_xy_req,
		agv_get_xy_resp : agv_get_xy_resp
	};
	
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
	
	function agv_get_status_resp() {
		this.header = {
			protocol: "mcp5",
			name: "agv_get_status_resp",
			source: "",
			destination: "",
			session_id: "",
			security_id: ""
		};
		//TODO: üzenet kiegészítése szabványnak megfelelően
	}

	exports.pairs.agv_get_status = {
		agv_get_status_req : agv_get_status_req,
		agv_get_status_resp : agv_get_status_resp
	};
	
});