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
		for (var key in req.params.data) {
			var value = req.params.data[key];
			if (commonUtils.isNumber(value)) {
				//for dixel we use 10*value, this arithmetic function must descrbed by gui page config
				sendDataToDb(path + "::register_value::" + key, 10*value)
			} else {
				alert("Nem szám!");
			}
		}
	};

	function sendDataToDb(path, value) {
		var memDbSetReq = new memdb_set_req();
		memDbSetReq.data.path = path;
		memDbSetReq.data.value = "" + value;
		console.log(memDbSetReq);
		esbclient.sendObject(memDbSetReq);
	}

});