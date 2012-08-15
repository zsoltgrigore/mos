/**
 * @author Grigore András Zsolt
 */

exports.root = function(req, res) {
	res.render('index', { 
			title : 'Mesh Data Systems Kft.'
		})
}

exports.login = function(req, res) {
	res.render('login', {
		title: 'Mesh Data Systems Kft. - Bejelentkezés',
		message: res.locals.message
	});
}

exports.tester = function(req, res) {
	res.render('tester');
}

exports.test = require("./test/");