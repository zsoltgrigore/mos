/**
 * @author Grigore András Zsolt
 */

function rootReqHandler(req, res) {
	var toc = "" +
  			"<a href='login'>Login</a>";
  		
  		res.end(toc);
}

function loginReqHandler(req, res) {
	var loginsrc = "" +
  			"<h1>login lesz</h1>";
  		
  		res.end(loginsrc);
}

exports.rootReqHandler = rootReqHandler;
exports.loginReqHandler = loginReqHandler;