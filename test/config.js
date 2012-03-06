/**
 * @author Grigore András Zsolt
 */

var config = require("../utils/config");
var fs = require("fs");

console.log(config.createGlobalConfig(fs.readFileSync('../mos.config.json', 'utf-8')));