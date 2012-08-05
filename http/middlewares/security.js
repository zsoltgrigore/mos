/**
 * @author Grigore András Zsolt
 */

exports.restrict = function(req, res, next) {
  try {
  	if (this.socketMap[req.session.user.source].user.isValidHash(req.session.user.hash)) {
		this.logger.debug("[restrict]: Érvényes cookie: %s", req.session.user.source);
		if (this.socketMap[req.session.user.source].restrictConnections) {
			this.logger.debug("[restrict]: Már be van egyszer jelentkezve!");
			req.flash.error = 'Csak egy authentikált session engedélyezett!';
			return res.redirect("/login");
		} else {
			this.socketMap[req.session.user.source].restrictConnections = true;
			req.flash.success = 'Sikeres bejelentkezés';
			return next();
		}
  	}
  } catch(e) {
  		console.log(e);
  		this.logger.warn("[restrict]: Érvénytelen belépési adatok. Továbbítás a belépő oldalra.");
		req.flash.error = 'Érvénytelen belépési adatok. Próbáljon meg belépni újra!';
		req.flash.redirectAfterLogin = req.url;
  }
  res.redirect('/login');
}