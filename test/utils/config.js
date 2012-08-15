/**
 * @author Grigore András Zsolt
 */

var config = require("../../utils/config");
var fs = require("fs");


console.time('---config.createGlobalConfig');
console.log(config.createGlobalConfig(fs.readFileSync('../../mos.config.json', 'utf-8')));
console.timeEnd('---config.createGlobalConfig');
