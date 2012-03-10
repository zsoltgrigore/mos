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

	mosHttp.logger.info("'%s'-t megnézte %s.", req.url, user);
  	next();
}

exports.accessLogger = accessLogger;