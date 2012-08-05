/**
 * @author Grigore András Zsolt
 */

var Logger = require('../utils/Logger');
var isArray = require('../utils/general').isArray;

var global = {};
var configObj;
var log = new Logger({target: "utils/config", level: 3, enabled: true})
var env = process.env.NODE_ENV || 'development';

exports.createGlobalConfig = function(configjson) {
	log.info("Aktuális futtatókörnyzet (NODE_ENV): %s", env);
	if (env == "production") {
		log.warn("Session store memóriafolyása miatt production átmenetileg tiltva!");
		process.exit(1);
	}
	configObj = parseConfig(configjson);
	if (configObj) {
		for (var modul in configObj) {
			mergeGeneralWithEnv(modul);
		}
		return global;
	} else {
		return false;
	}
}

var parseConfig = function(configjson) {
	try {
		return configjson = JSON.parse(configjson);
	} catch (e) {
		log.error("Hiba a konfigurációban!");
		//console.log(configjson);
		return false;
	}
};

var mergeGeneralWithEnv = function(modul) {
	if (modul != "global") global[modul] = {};
	for(var option in configObj[modul][env]) {
		if (modul != "global"){
			global[modul][option] = configObj[modul][env][option];
		} else {
			global[option] = configObj[modul][env][option];
		}
	}
};