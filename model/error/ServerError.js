/**
 * @author Grigore András Zsolt
 */

var ServerError = module.exports = function (message) {
	var err = new Error('Internal Server Error!');
	err.name = "Server Error";
	err.status = 500;
	return err;
}