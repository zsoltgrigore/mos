/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	
	var eps_get_memory_profile_and_value_req = module.exports = function() {
		this.data = {
			devices : [
			]
		},
		this.header = {
			destination : "",
			name : "eps_get_memory_profile_and_value_req",
			protocol : "mcp5",
			security_id : "",
			session_id : "",
			source : ""
		}
	};
});