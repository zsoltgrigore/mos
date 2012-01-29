/**
 * @author Grigore András Zsolt
 */

var accountMW = require("./middleware/account.js");

//TODO: ide bevarázsolni valahogy a különböző custom middleware-eket
function mosroutes(server, routeConfig) {
	server.get("/", function (req, res) {
  		var toc = ""+
  			"<a href='load_chart'>Avarege Load Chart</a><br>" + 
  			"<a href='login'>Chat</a>";
  		
  		res.end(toc);
  		//res.sendfile(__dirname +'/staticview/index.html');
	});
	
	server.get("/load_chart", function (req, res) {
		console.log(this);
  		res.sendfile(__dirname +'/staticview/load_chart.html');
	});
	
	server.get("/chat", accountMW.restrict, accountMW.accessLogger ,function (req, res) {
  		res.sendfile(__dirname +'/staticview/chat.html');
	});
	
	server.get("/login", function (req, res) {
		if (req.session.user) {
    		req.session.success = 'Authenticated as ' + req.session.user.name
      			+ ' click to <a href="/logout">logout</a>. '
      			+ ' You may now access <a href="/restricted">/restricted</a>.';
  		}
  		res.sendfile(__dirname +'/staticview/login.html');
	});
	
	server.get('/logout', function(req, res){
  		// destroy the user's session to log them out
  		// will be re-created next request
  		req.session.destroy(function(){
    		res.redirect('home');
  		});
	});
	
	server.post('/login', function(req, res){
  		accountMW.authenticate(req.body.username, req.body.password, function(err, user){
    		if (user) {
      			// Regenerate session when signing in
      			// to prevent fixation
      			req.session.regenerate(function(){
        		// Store the user's primary key
        		// in the session store to be retrieved,
        		// or in this case the entire user object
        		req.session.user = user;
        		res.redirect('back');
      		});
    	} else {
      		req.session.error = 'Authentication failed, please check your '
        	+ ' username and password.'
        	+ ' (use "tj" and "foobar")';
      		res.redirect('back');
    		}
  		});
	});
		
	console.info("Routes registered");
}

module.exports = mosroutes;