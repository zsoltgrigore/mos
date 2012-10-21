/**
 * @author Grigore András Zsolt
 */

exports.root = function(req, res) {
	res.redirect(this.defualtLanding)
}

exports.login = function(req, res) {
	res.render('login', {
		title: 'Mesh Data Systems Kft. - Bejelentkezés',
		message: res.locals.message
	});
}

exports.refrigeratory = function(req, res) {
	res.render('refrigeratory', {});
}

exports.test = require("./test/");