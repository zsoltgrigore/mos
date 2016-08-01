/**
 * @author Grigore András Zsolt
 */

let httpServer = require('./http/server');
let config = require('./utils/config');
let Logger = require('./utils/Logger');

var log = new Logger({target: "core", level: 3, enabled: true})

log.info("Current environment is (NODE_ENV): %s", process.env.NODE_ENV || 'development');

httpServer(config({fileName : "development.config.json"}).http);
