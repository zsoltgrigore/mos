/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	
	 var memdb_set_req = module.exports = function memdb_set_req() {
		this.data = {
			path: "",
			value: ""
		},
		 this.header = {
			destination : "ANY",
			name : "memdb_set_req",
			protocol : "mcp5",
			security_id : "",
			session_id : "",
			source : ""
		}
	}
});