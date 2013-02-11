/**
 * @author Grigore András Zsolt
 */
 
requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: '/js/libs',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        mds: '../mds',
        foundation: '../foundation',
        socketio: '../../socket.io/socket.io',
        text: "plugins/text"
    },
	shim: {
	
		davis: {
			deps: ['jquery'],
			exports: 'Davis'
		},
		socketio: {
			/*if has dependencies deps: ['jquery', 'underscore'],*/
			exports: 'io'
		},
		paper: {
			exports: 'paper'
		},
		handlebars: {
			exports: 'Handlebars'
		},
		/*'foundation/jquery.foundation.topbar': ['jquery'],
		'foundation/responsive-tables': ['jquery']*/
	}
});

require([ "mds/controller/router", "mds/connection/esbClient",
			"mds/controller/languageController", "plugins/domReady", "davis", "jquery"],
	function(router, esbclient, languageController, domReady, davis, jquery) {
		
		languageController();
		var app = davis(router.main);
		
		domReady(function(){
			app.$content = $("#content");
			app.$navigation = $("#navigation");
			app.datas = false;
			
			router.init.call(app);
			
			app.start();
			esbclient.url = "ws://"+location.host;
			esbclient.connect();
		});
	}
);

