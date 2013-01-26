/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {

	var $ = require("jquery");
	var Handlebars = require("handlebars");
	var esbclient = require("mds/connection/esbClient");
	var helper = require("mds/template/helper");
	var commonUtils = require("mds/utils/common");
	
	var memdb_set_req = require("mds/model/mcp/memdb_set_req");
	
	module.exports = function(req) {
		var app = this;
		//változásokat a loca datas tömbbe is bevésni!
		var path = decodeURIComponent(req.params.device);
		
		console.log(req.params.data_key);
		var key = req.params.data_key;
		var value = 0;
		if (req.params.data) {
			value = req.params.data[key] ? 1 : 0;
		}
		
		sendDataToDb(path + "::register_value::" + key, 10*value);
	};

	function sendDataToDb(path, value) {
		var memDbSetReq = new memdb_set_req();
		memDbSetReq.data.path = path;
		memDbSetReq.data.value = "" + value;
		console.log(memDbSetReq);
		esbclient.sendObject(memDbSetReq);
	}

});