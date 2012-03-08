/**
 * Express route-ok kezeléséhez használt middleware függvények.
 * Egyenlőre ezt a 4 nagy csoportot határoztam meg, idővel könnyedén bővíthatő, 
 * illetve további alcsoportok is megadhatóak lásd a acc/one.js
 * 
 * @author Grigore András Zsolt
 */

//accountHandlers
exports.accountHandlers = require("./accountHandlers");


//postProcessors
exports.postProcessors = require("./postProcessors");

//requestHandlers
exports.requestHandlers = require("./requestHandlers");

//loggers
exports.loggers = require("./loggers");