/**
 * @author Grigore András Zsolt
 */

exports.restrict = function(req, res, next) {
  try {
  	if (this.socketMap[req.session.user.source].user.isValidHash(req.session.user.hash)) {
		this.logger.debug("[restrict]: Érvényes cookie: %s", req.session.user.source);
		if (this.socketMap[req.session.user.source].restrictConnections) {
			this.logger.debug("[restrict]: Már be van egyszer jelentkezve!");
			req.session.error = 'Csak egy authentikált session engedélyezett!';
			return res.redirect("/login");
		} else {
			this.socketMap[req.session.user.source].restrictConnections = true;
			req.session.info = 'Sikeres bejelentkezés';
			return next();
		}
  	}
  } catch(e) {
  		this.logger.warn("[restrict]: Érvénytelen cookie. Továbbítás: /login");
		req.session.redirect = req.url;
  }
  res.redirect('/login');
}