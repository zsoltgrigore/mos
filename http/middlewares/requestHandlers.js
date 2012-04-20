/**
 * @author Grigore András Zsolt
 */

function rootReqHandler(req, res) {
	var toc = "" +
  			"<a href='login'>Login</a><br/>" +
  			"<a href='tester'>Tester</a>";
  	// DEMO redirect
    res.redirect('/demo');
  	res.end(toc);
}

function loginReqHandler(req, res) {
	res.sendfile(this.httpPath + '/staticview/login.html');
}

function testerReqHandler(req, res) {
	res.sendfile(this.httpPath + '/staticview/tester.html');
}

function appReqHandler(req, res) {
	//csak teszt restriction-t be kell még izzítani mert addig nem biztos hogy van req.session.user
	this.socketMap[req.session.user.source].esbSocket.end();
	res.sendfile(this.httpPath + '/staticview/app.html');
}

exports.rootReqHandler = rootReqHandler;
exports.loginReqHandler = loginReqHandler;
exports.testerReqHandler = testerReqHandler;
exports.appReqHandler = appReqHandler;
