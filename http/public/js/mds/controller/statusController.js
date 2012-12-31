/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {

	var $ = require("jquery");
	var Handlebars = require("handlebars");
	var helper = require("mds/template/helper");
	var status = require("text!mds/template/status/status.hbrs");
	var esbclient = require("mds/connection/esbClient");
	var commonUtils = require("mds/utils/common");
	
	var eps_get_memory_profile_and_value_req = require("mds/model/mcp/eps_get_memory_profile_and_value_req");
	
	module.exports = function(req) {
		try {
			if (Handlebars.helpers.i18n == null) {
				helper.i18n();
			}
		} catch (e) {
			if (console) console.warn(e);
			helper.i18n();
		}

		var epsGetMemoryProfileAndValueReq = new eps_get_memory_profile_and_value_req();
		esbclient.sendObject(epsGetMemoryProfileAndValueReq);
		//ez minden kattintásra hozzáadódik az eseménykezelők listájához ezért
		//	ha jön egy üzenet akkor lehet h 3-4 alkalommal is lefut
		//	kell esbclient.of("eps_get_memory_profile_and_value_resp")
		esbclient.on("eps_get_memory_profile_and_value_resp",
				eps_get_memory_profile_and_value_resp_handler.bind(this));
	};

	function eps_get_memory_profile_and_value_resp_handler(profileAndValueResp) {
		var pageName = "status_page";
		var mm_devices = profileAndValueResp.data.devices;
		var memory_map_dto = {
			"eps": []
		};
		
		for (var mm_key in mm_devices) {
			var register_map = mm_devices[mm_key]["device"]["register_map"];
			var value = mm_devices[mm_key]["device"]["value"];
			var description = mm_devices[mm_key]["device"]["description"]
			var status_page_map = mm_devices[mm_key]["gui"][pageName];
			var eps_name = mm_key;
			
			for (var rowIndex in status_page_map) {
				var column = status_page_map[rowIndex];
				var eps_memory_desc = { 
					eps_name: eps_name,
					sensor_name: column["sensor_name"], 
					value: commonUtils.regValuesToInt(column["value"], value),
					high_alarm_value: commonUtils.regValuesToInt(column["high_alarm_value"], value),
					low_alarm_value: commonUtils.regValuesToInt(column["low_alarm_value"], value),
					high_limit_alarm_enabled: commonUtils.regValuesToInt(column["high_limit_alarm_enabled"], value),
					low_limit_alarm_enabled: commonUtils.regValuesToInt(column["low_limit_alarm_enabled"], value),
					high_alarm_ack: commonUtils.regValuesToInt(column["high_alarm_ack"], value),
					low_alarm_ack: commonUtils.regValuesToInt(column["low_alarm_ack"], value),
				}
				memory_map_dto.eps.push(eps_memory_desc);
			}
		}
		
		console.log(memory_map_dto);
		
		var statusT = Handlebars.compile(status);
		var probeGHtml = statusT(memory_map_dto);
		this.$content.append(probeGHtml);
	}
});