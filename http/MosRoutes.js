function mosroutes(server, routeConfig) {
	server.get("/", function (req, res) {
  		res.sendfile(__dirname +'/staticview/index.html');
	});
		
	console.info("Routes registered");
}

module.exports = mosroutes;