/**
 * @author Grigore András Zsolt
 */

function rootReqHandler(req, res) {
	var toc = "" +
  			"<a href='login'>Login</a><br/>" +
  			"<a href='tester'>Tester</a>";
  		
  	res.end(toc);
}

function loginReqHandler(req, res) {
	var loginsrc = "" +
  			"<h1>login lesz</h1>";
  		
  	res.end(loginsrc);
}

function testerReqHandler(req, res) {
	res.sendfile('/nodejs_dev/aptanaWS/mesh-owners-site/http/staticview/tester.html');
}

exports.rootReqHandler = rootReqHandler;
exports.loginReqHandler = loginReqHandler;
exports.testerReqHandler = testerReqHandler;