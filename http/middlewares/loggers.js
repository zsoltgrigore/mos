/**
 * @author Grigore András Zsolt
 */

exports.accessLogger = function(req, res, next) {
	var mosHttp = this;
	var user = 'anonymus';
	
	mosHttp.logger.info("[accessLogger]: %s útvonalra %s kérés", req.url, req.method);
	
	try {
		user = req.session.user.source;
	} catch (e) {
		mosHttp.logger.debug("[accessLogger]: Nincs user információ a headerben.");
	}
	
	//Ha POST akkor log-ba hogy mit postolt
	//if (req.method == "POST") {mosHttp.logger.info(form adatai!)}
  	next();
}