/**
 * @author Grigore András Zsolt
 */

function root(req, res) {
	res.render('index')
}
exports.root = root;

function login(req, res) {
	res.render('login');
}
exports.login = login;

function tester(req, res) {
	res.render('tester');
}
exports.tester = tester;

function internalServerError(req, res) {
	res.render('500.jade', {
		locals: {
			title : 'The Server Encountered an Error'
			,description: ''
			,author: ''
			,analyticssiteid: 'XXXXXXX'
			,error: err
		},
		status: 500 
	});
}
exports.internalServerError = internalServerError;

function notFound(req, res) {
	res.render('404.jade', {
		locals: {
			title : '404 - Not Found'
			,description: ''
			,author: ''
			,analyticssiteid: 'XXXXXXX'
		},
		status: 404 
	});
}
exports.notFound = notFound;