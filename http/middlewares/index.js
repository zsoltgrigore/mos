/**
 * Express route-ok kezeléséhez használt middleware függvények.
 * Egyenlőre ezt a 5 nagy csoportot határoztam meg, idővel könnyedén bővíthető, 
 * illetve további alcsoportok is megadhatóak
 * 
 * @author Grigore András Zsolt
 */

//requestHandlers
exports.getHandlers = require("./getHandlers");

//postProcessors
exports.postHandlers = require("./postHandlers");

//accountHandlers
exports.accountHandlers = require("./accountHandlers");

//security
exports.security = require("./security");

//loggers
exports.loggers = require("./loggers");

//errorHandlers
exports.errorHandlers = require("./errorHandlers");