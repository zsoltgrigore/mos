/**
 * @author Grigore András Zsolt
 */

function accessLogger(req, res, next) {
	var mosHttp = this;
	var user = 'anonymus';
	
	try {
		user = req.session.user.name;
	} catch (e) {
		mosHttp.logger.debug("Nincs session cookie");
	}
	
	mosHttp.logger.info("%s útvonalra %s kérést küldött %s", req.url, req.method, user);
	//Ha POST akkor log-ba hogy mit postolt
	//if (req.method == "POST") {mosHttp.logger.info(form adatai!)}
  	next();
}

exports.accessLogger = accessLogger;