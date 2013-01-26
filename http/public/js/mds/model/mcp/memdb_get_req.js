/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	
	 var memdb_get_req = module.exports = function memdb_get_req() {
		this.data = {
			path: ""
		},
		 this.header = {
			destination : "ANY",
			name : "memdb_get_req",
			protocol : "mcp5",
			security_id : "",
			session_id : "",
			source : ""
		}
	}
});