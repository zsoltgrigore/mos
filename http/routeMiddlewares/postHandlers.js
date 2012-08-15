/**
 * @author Grigore András Zsolt
 */
var accountHandlers = require("./accountHandlers");

exports.processLoginData = function(req, res) {
	var mosHttp = this;
	
	accountHandlers.authenticate.call(mosHttp, req.body.username, req.body.password, function(err, esbSocket){
		if (esbSocket) {
			//var chan = esbSocket.user.source;
			//mosHttp.emit("new auth chan req", esbSocket.user.source);
			// Regenerate session when signing in
			// to prevent fixation
			req.session.regenerate(function(){
	        	// Store the user's primary key
	        	// in the session store to be retrieved,
	        	// or in this case the entire user object
				// mosHttp vagy sessionstore, valahol a user-t össze kell mappelni az esbsockettel
	        	req.session.user = {
					source: esbSocket.user.source,
					hash: esbSocket.user.hash,
				};
				mosHttp.socketMap[esbSocket.user.source] = {
					user: esbSocket.user,
					restrictConnections: false,
					esbSocket: esbSocket
				};
				
				var redirectAfterLogin = '/';
				try {
					redirectAfterLogin = res.locals.redirect || mosHttp.defualtLanding;
				} catch (e) {
					mosHttp.logger.warn("No redirection path found! %s", e.message);
				}
				res.redirect(redirectAfterLogin);
				//res.redirect('/app?chan='+chan);
	      	});
	    } else {
	      mosHttp.logger.info(err.message);
		  req.session.error = err.message;
	      res.redirect('/login');
	    }
	});
}

/*
 *   if (req.body.name) {
    // Typically here we would create a resource
    req.flash('info', 'Saved ' + req.body.name);
    res.redirect('/?name=' + req.body.name);
  } else {
    req.flash('error', 'Error: name required');
    res.redirect('/');
  }
 */