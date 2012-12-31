/**
 * @author Grigore András Zsolt
 */

var fs = require("fs");

console.time('---config.config_json');
console.log(config.createGlobalConfig(fs.readFileSync('config.json', 'utf-8')));
console.timeEnd('---config.config_json');