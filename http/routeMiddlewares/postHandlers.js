/**
 * @author Grigore András Zsolt
 */
var accountHandlers = require("./accountHandlers");

exports.processLoginData = function(req, res) {
	var mosHttp = this;

	accountHandlers.authenticate.call(mosHttp, req.body.username, req.body.password, function(err, user){
		if (user) {
			//var chan = esbSocket.user.source;
			//mosHttp.emit("new auth chan req", esbSocket.user.source);
			//Regenerate session when signing in
			// to prevent fixation
			req.session.regenerate(function(){
				// Store the user's primary key
				// in the session store to be retrieved,
				// or in this case the entire user object
				// mosHttp vagy sessionstore, valahol a user-t össze kell mappelni az esbsockettel
				req.session.user = {
					source: user.source,
					hash: user.hash
				};
	
				mosHttp.socketMap[user.source] = {
					user: user,
					restrictConnections: false,
					esbSocket: false
				};
	
				var redirectAfterLogin = '/';
				try {
					redirectAfterLogin = res.locals.redirect || mosHttp.defualtLanding;
				} catch (e) {
					mosHttp.logger.warn("No redirection path found! %s", e.message);
				}
				
				//generate a name and add passwordhash, on client side get it from the browser (document.cookies)
				//if client has a cookie with this name and contains valid hash than user is ok
				//httpOnly: false means that anybody could read this cookie
				//	so BE CAREFUL even if you sign it, delete form browser after user auth: http://www.quirksmode.org/js/cookies.html
				//	function eraseCookie(name) {
				//		createCookie(name,"",-1);
				//	}
				res.cookie('hash', user.hash, { signed: true, httpOnly: false });
				res.redirect(redirectAfterLogin);
			});
		} else {
			mosHttp.logger.info(err.message);
			req.session.error = err.message;
			res.redirect('/login');	
		}
	});
}