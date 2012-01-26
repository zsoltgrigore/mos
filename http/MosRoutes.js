function mosroutes(server, routeConfig) {
	server.get("/", function (req, res) {
  		var toc = ""+
  			"<a href='load_chart'>Avarege Load Chart</a><br>" + 
  			"<a href='chat'>Chat</a>";
  		
  		res.end(toc);
  		//res.sendfile(__dirname +'/staticview/index.html');
	});
	
	server.get("/load_chart", function (req, res) {
  		res.sendfile(__dirname +'/staticview/load_chart.html');
	});
	
	server.get("/chat", function (req, res) {
  		res.sendfile(__dirname +'/staticview/chat.html');
	});
		
	console.info("Routes registered");
}

module.exports = mosroutes;