function registerRoutes(server, routeConfig) {
	server.get("/", function (req, res) {
  		res.sendfile(__dirname +'/staticview/index.html');
	});
		
	console.info("Routes registered");
}

exports.registerRoutes = registerRoutes;