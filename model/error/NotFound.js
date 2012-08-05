/**
 * @author Grigore András Zsolt
 */

var NotFound = module.exports = function (message){
	var err = new Error(message || "Resource not found!");
	err.name = "Not Found";
	err.status = 404;
	return err;
}