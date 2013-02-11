/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {

	var $ = require("jquery");
	var paper = require("paper");
	var Handlebars = require("handlebars");
	var helper = require("mds/template/helper");
	var status = require("text!mds/template/status/status.hbrs");
	var status_page = require("text!mds/template/status/status.json");
	var esbclient = require("mds/connection/esbClient");
	var commonUtils = require("mds/utils/common");
	var DisplayController = require("mds/display/DisplayController");
	
	var deviceList = false;
	var numOfDevices = 0;
	var addedDevices = 0;
	var dc = false;
	
	module.exports = function(req) {
		var app = this;
		
		helper.i18n();
		helper.ifCond();

		if (!app.datas) {
			app.$content.append($("<div></div>", {"class": "loading one column centered"}));
			app.datas = {};
			esbclient.getDataFromDb(esbclient.user + "::business_details::device_list");
			esbclient.on("memdb_get_resp", getUserDevicesHandler.bind(this));
		} else {
			renderContent.call(app);
		}
	};

	function getUserDevicesHandler(payload) {
		esbclient.off("memdb_get_resp", getUserDevicesHandler.bind(this));
		
		deviceList = JSON.parse(payload.data.value);
		numOfDevices = deviceList.length;
		
		/*set event handler and send request to db*/
		esbclient.on("memdb_get_resp", getUserDeviceDetailsHandler.bind(this));
		for (var i in deviceList) {
			this.datas[deviceList[i]] = {};
			esbclient.getDataFromDb(deviceList[i]+"::::");
			commonUtils.pause(50);
		}
	}
	
	function getUserDeviceDetailsHandler(payload) {
		var app = this;
		this.datas[deviceList[addedDevices]] = JSON.parse(payload.data.value);
		addedDevices++;
		//console.log("Parsed and added one device's details. Num of added details: " + addedDevices);

		if (deviceList.length == addedDevices) {
			esbclient.off("memdb_get_resp", getUserDeviceDetailsHandler.bind(this));
			renderContent.call(app);
		}
	}

	function epsMemoryChangeHandler(payload) {
		var names = new Array();
		for (var name in payload.data) {
			var cssClsName = commonUtils.stringToCssCls(name);
			for (var changedSensor in payload.data[name]) {
				var $changedField = $("tr."+cssClsName + " ."+changedSensor);
				var changedValue = payload.data[name][changedSensor];
				//console.log("The changedfield is:");
				//console.log($changedField);
				//console.log("Value is " + changedValue);
				//input has value but any other tag has text or html
				if ($changedField.is("input")) {
					//BUG: input ami set-limit típusú ott /10
					//ezt a többivel együtt kitenni switch-case - be
					$changedField.val(changedValue/10);
				} else {
					if ($changedField.is("canvas")) {
						//console.log(payload);
						$changedField.text(changedValue/10);
						//TODO: use $changedField instead
						renderCanvas($changedField.attr("id"));
					} else {
						if ($changedField.hasClass("limit-active"))
							renderLimitActive($changedField, changedValue);
						if ($changedField.hasClass("limit-error"))
							renderLimitError($changedField, changedValue);
					}
				}
			}
		}
	}

	function renderContent() {
		var app = this;
		
		var statusT = Handlebars.compile(status);
		var probeGHtml = statusT(transformData.call(app));
		app.$content.empty();
		this.$content.append(probeGHtml);
		
		registerFormHandlers();
		setupCanvases($("canvas.fridge_temp"));
		
		esbclient.on("eps_memory_change_notify", epsMemoryChangeHandler.bind(this));
	}
	
	function registerFormHandlers() {
		$(".limit-active input, .limit-error a").each(
			function( index ) {
				$(this).live("click", function (event) {
					if ($(this).is("a")) {
						event.preventDefault();
						var $oldContent = $(this).parent().clone();
						var $oldWrapper = $(this).parent().parent();
						//--var $oldContent = $(this).parent();
						$oldContent.removeClass("alert");
						$oldContent.appendTo($oldWrapper);
					}
					$(this).parents("form:first").submit();
				})
			}
		);
	}
	
	function setupCanvases($canvases) {
		paper.setup("buffer");
		
		var width = paper.view.size.width;
		var height = paper.view.size.height;
		dc = new DisplayController({boundaries: new paper.Rectangle(0, 0, width, height)});
		
		$canvases.each(
			function (index) {
				var key = $(this).attr("id");
				renderCanvas(key);
			}
		);
	}
	
	function renderCanvas(canvasId) {
		var $target = $("#"+canvasId);
		var inputNumber = $target.text();
		var bufferCtx = $("#buffer")[0].getContext("2d");
		var targetCtx = $target[0].getContext("2d");
		
		if (commonUtils.isNumber(inputNumber)) {
			var number = commonUtils.repCommaToDot(inputNumber);
			dc.drawNumber(parseFloat(inputNumber));
			
			var imgData = bufferCtx.getImageData(0, 0, $target[0].width, $target[0].height);
			targetCtx.putImageData(imgData, 0, 0);
		}
	}

	function renderLimitActive($changedField, changedValue) {
		changedValue == 1 ?
			$("input:checkbox", $changedField).prop('checked', true)
			: $("input:checkbox", $changedField).prop('checked', false);
	}
	
	function renderLimitError($changedField, changedValue) {
		if ($changedField.hasClass("alert")) {
			$changedField.removeClass("alert");
		}
		if ($changedField.hasClass("success")) {
			$changedField.removeClass("success");
		}
		switch (parseInt(changedValue)) {
			case 0:
				$changedField.addClass("success");
				break;
			case 1:
				$changedField.addClass("alert");
				break;
			case 2:
				break;
			default:
				//console.log("not implemented");
				//console.log(changedValue);
		}
	}

	function transformData() {
		var app = this;
		var mm_devices = app.datas;
		status_page = JSON.parse(status_page);
		var memory_map_dto = {
			"eps": []
		};
		
		for (var mm_key in mm_devices) {
			var value = mm_devices[mm_key]["register_value"];
			var description = mm_devices[mm_key]["register_description"]
			var eps_name = mm_key;
			
			//Needs register arithmetic description eg "1256"/10???
			for (var rowIndex in status_page[mm_key]) {
				var column = status_page[mm_key][rowIndex];
				var eps_memory_desc = {
					eps_name: eps_name,
					eps_short_name: eps_name.split("@")[0],
					eps_csscls_name: commonUtils.stringToCssCls(eps_name),
					sensor_name: column["sensor_name"],
					fridge_temp: (""+commonUtils.regValuesToInt(column["fridge_temp"], value))/10,
					fridge_temp_addr: column["fridge_temp"],
					fridge_temp_id: commonUtils.stringToCssCls(eps_name) + '-'+ column["fridge_temp"],
					high_alarm_value: (""+commonUtils.regValuesToInt(column["high_alarm_value"], value))/10,
					high_alarm_value_addr: column["high_alarm_value"],
					low_alarm_value: (""+commonUtils.regValuesToInt(column["low_alarm_value"], value))/10,
					low_alarm_value_addr: column["low_alarm_value"],
					set_alarm_action: "/refrigeratory/set-alarm/"+encodeURIComponent(eps_name),
					high_limit_active: commonUtils.regValuesToInt(column["high_limit_active"], value),
					high_limit_active_addr: column["high_limit_active"],
					low_limit_active: commonUtils.regValuesToInt(column["low_limit_active"], value),
					low_limit_active_addr: column["low_limit_active"],
					set_limit_active_action: "/refrigeratory/set-limit-active/"+encodeURIComponent(eps_name),
					high_limit_error: commonUtils.regValuesToInt(column["high_limit_error"], value),
					high_limit_error_addr: column["high_limit_error"],
					low_limit_error: commonUtils.regValuesToInt(column["low_limit_error"], value),
					low_limit_error_addr: column["low_limit_error"],
					set_limit_error_action: "/refrigeratory/set-limit-error/"+encodeURIComponent(eps_name),
				}
				memory_map_dto.eps.push(eps_memory_desc);
			}
		}
		return memory_map_dto;
	}
});