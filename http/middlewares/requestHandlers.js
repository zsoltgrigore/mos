/**
 * @author Grigore András Zsolt
 */

function rootReqHandler(req, res) {
    res.redirect('/demo');
}

function loginReqHandler(req, res) {
	res.sendfile(this.httpPath + '/staticview/login.html');
}

function testerReqHandler(req, res) {
	res.sendfile(this.httpPath + '/staticview/tester.html');
}

function appReqHandler(req, res) {
	res.sendfile(this.httpPath + '/staticview/app.html');
}

function notFoundHandler(req, res, next) {
	//https://github.com/robrighter/node-boilerplate/blob/master/templates/app/server.js
	// respond with html page
	if (req.accepts('html')) {
		res.status(404);
		res.end("Ezen a címen nincs elérhető tartalom!");
		//res.render('404', { url: req.url });
		return;
	}
	
	// respond with json
	if (req.accepts('json')) {
		res.send({ error: 'Not found' });
		return;
	}
	
	// d	efault to plain-text. send()
	res.type('txt').send('Not found');
}

exports.rootReqHandler = rootReqHandler;
exports.loginReqHandler = loginReqHandler;
exports.testerReqHandler = testerReqHandler;
exports.appReqHandler = appReqHandler;
exports.notFoundHandler = notFoundHandler;
