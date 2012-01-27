/**
 * @author Grigore András Zsolt
 */
//TODO: ide bevarázsolni valahogy a különböző middleware-eket
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
	
	server.get("/chat" /*,restrict*/  ,function (req, res) {
  		res.sendfile(__dirname +'/staticview/chat.html');
	});
	
	/*
	 loginhoz szükséges routok get és post /login illetve get chat (restricted)!!! 
	 * */
		
	console.info("Routes registered");
}

module.exports = mosroutes;