/**
 * @author Grigore András Zsolt
 */

var fs = require('fs');
var Logger = require('../utils/Logger');
var log = new Logger({target: "utils/config", level: 3, enabled: true})

module.exports = function(conf) {

    let fileName = conf.fileName || "config.json";
    let encoding = conf.encoding || "utf-8";

    let configFile = fs.readFileSync(fileName, encoding);

    function parseConfig() {
        try {
	        return JSON.parse(configFile);
        } catch (e) {
	        log.error("Unable to process config");
	        return {};
        }
    };
    
    return Object.freeze(parseConfig());
}
