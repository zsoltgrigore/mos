/**
 * ESB kapcsolódáshoz és a kapott csomagok feldolgozásához használt osztályok 
 * "esb" namespace-en belülre kerülnek.
 * 
 * @author Grigore András Zsolt
 */

exports.EsbSocket = require("./EsbSocket");

//api
exports.api = {};
exports.api.esb_login_req = require("./api/esb_login_req.js");
exports.api.esb_login_resp = require("./api/esb_login_resp.js");
exports.api.esb_hello_req = require("./api/esb_hello_req.js");
exports.api.esb_hello_resp = require("./api/esb_hello_resp.js");