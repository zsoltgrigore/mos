var fs = require("fs");

var config_json = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

var data = config_json.data;

//console.log(config_json.data);

for (var iter in data.avrs) {
	//console.log("config_json.data.avrs[iter]");
	//console.log(config_json.data.avrs[iter]);
	for (var devIter in data.avrs[iter].remote_modbus_devices) {
		//console.log("config_json.data.avrs[" + iter+ "].remote_modbus_devices[" + devIter + "]");
		//console.log(config_json.data.avrs[iter].remote_modbus_devices[devIter]);
		for (var regpkgIter in data.avrs[iter].remote_modbus_devices[devIter].register_pkgs) {
			console.log("iter-->: " + iter + " devIter: " + devIter + " regpkgIter: " +  regpkgIter)
			//console.log(config_json.data.avrs[iter].remote_modbus_devices[devIter].register_pkgs[regpkgIter]);
			//Probe name
			console.log(data.avrs[iter].remote_modbus_devices[devIter].register_pkgs[regpkgIter].properties.name);
			//Value
			console.log("Value: " + data.avrs[iter].remote_modbus_devices[devIter].register_pkgs[regpkgIter].data_units.value.value);
			//Last Modified Date
			//console.log(data.avrs[iter].remote_modbus_devices[devIter].register_pkgs[regpkgIter].data_units.register_mod_date);
			//L limit value
			console.log(data.avrs[iter].remote_modbus_devices[devIter].register_pkgs[regpkgIter].data_units.alarm_input_flags);
			//!!! L limit value
			console.log(data.avrs[iter].remote_modbus_devices[devIter].register_pkgs[regpkgIter].data_units.lower_limit);//.value
			//!!! H limit value
			console.log(data.avrs[iter].remote_modbus_devices[devIter].register_pkgs[regpkgIter].data_units.upper_limit);//.value
			//!!! L/H limit enbled/disabled list values ------- alarm_input_flags 
			console.log(data.avrs[iter].remote_modbus_devices[devIter].register_pkgs[regpkgIter].data_units.alarm_input_flags.value);
			/*
			'00_lower_alarm_enabled': 'true',
     		'01_lower_alarm_user_ack': 'false',
		    '02_lower_alarm_notification_ack': 'false',
		    '03_upper_alarm_enabled': 'true',
		    '04_upper_alarm_user_ack': 'false',
		    '05_upper_alarm_notification_ack': 'false'
			
			*/
			//!!! L/H limit enbled/disabled list values ------- alarm_output_flags(avr generated values)
			console.log(data.avrs[iter].remote_modbus_devices[devIter].register_pkgs[regpkgIter].data_units.alarm_output_flags.value);
			/*
			
			*/

		}
		
	}
}