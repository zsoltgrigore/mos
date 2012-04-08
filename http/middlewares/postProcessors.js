/**
 * @author Grigore András Zsolt
 */
var accountHandlers = require("./accountHandlers")

function processLoginData(req, res) {
	var mosHttp = this;
	accountHandlers.authenticate(req.body.username, req.body.password, function(err, esbSocket){
		if (esbSocket) {
			var channel = esbSocket.source;
			moshttp.emit("new channel", esbSocket);
			// Regenerate session when signing in
			// to prevent fixation
			req.session.regenerate(function(){
	        	// Store the user's primary key
	        	// in the session store to be retrieved,
	        	// or in this case the entire user object
				// mosHttp vagy sessionstore, valahol a user-t össze kell mappelni az esbsockettel
	        	req.session.esbSocket = esbSocket;
	        	//location.search.substring(1).split("=")--> így a kliensnek megmondjuk hogy hova kell csatlakozzon
				//aztán el is takarítjuk ha megvan :) location.search = "";
				res.redirect('app?channel=user00012');
	      	});
	    } else {
	      req.session.error = 'Authentication failed, please check your '
	        + ' username and password.'
	        + ' (use "tj" and "foobar")';
	      res.redirect('login');
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