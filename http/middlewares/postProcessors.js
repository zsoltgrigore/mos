/**
 * @author Grigore András Zsolt
 */
var accountHandlers = require("./accountHandlers")

function processLoginData(req, res) {
	var mosHttp = this;
	accountHandlers.authenticate(req.body.username, req.body.password, function(err, esbSocket){
		if (esbSocket) {
			var chan = esbSocket.source;
			mosHttp.emit("new auth chan req", esbSocket.source);
			// Regenerate session when signing in
			// to prevent fixation
			req.session.regenerate(function(){
	        	// Store the user's primary key
	        	// in the session store to be retrieved,
	        	// or in this case the entire user object
				// mosHttp vagy sessionstore, valahol a user-t össze kell mappelni az esbsockettel
	        	req.session.user = esbSocket.source;
				mosHttp.socketMap[esbSocket.source] = {
					user: esbSocket.source,
					esbSocket: esbSocket
				};
	
				res.redirect('/app?chan='+chan);
	      	});
	    } else {
	      console.log(err);
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

exports.processLoginData = processLoginData;