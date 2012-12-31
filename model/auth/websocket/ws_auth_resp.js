/**
 * @author Grigore András Zsolt
 */

var ws_auth_resp = module.exports = function (auth_status) {
	this.header = {
		name: "ws_auth_resp"
	};
	this.data = {
		authenticated: auth_status
	}
}