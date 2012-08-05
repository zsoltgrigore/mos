/**
 * @author Grigore András Zsolt
 */

var NotFound = require("../../model/error").NotFound;

exports.notFound = function(req, res, next){
	throw new NotFound("Nem található tartalom! " + req.host + req.path);
}

exports.error = function(err, req, res, next) {
	// we may use properties of the error object
	// here and next(err) appropriately, or if
	// we possibly recovered from the error, simply next().
	var status = err.status || 500;
	var name = err.name == "Error" ? 'Internal Server Error!' : err.name;
	var title = status + " - " + name;
	var message = name
	var stack = false

	if (this.showErrorStack) {
		message = err.message;
		stack = err.stack;
	}
	
	res.status(status);
	res.render('error', { 
		title : title
		,description: ''
		,author: ''
		,analyticssiteid: 'XXXXXXX'
		,status: status
		,errorMsg: message
		,errorStack: stack}
	);
}
