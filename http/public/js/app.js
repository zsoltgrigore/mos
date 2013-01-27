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

require([  "mds/controller/router", "mds/connection/esbClient",
			"text!mds/i18n/hu.json", "mds/controller/navController", "plugins/domReady",
			"davis", "jquery"],
	function(router, esbclient, intern13n, navController, domReady, davis, jquery) {
		//ha el akarna navigálni szinkron hívással akkor figyelmeztessük
		window.onbeforeunload = function() {
			//TODO: rendes i18n szöveget neki! 
			return "Amennyiben elhagyja az oldalt, később újra be kell jelentkezzen!";
		};
		//ha elnavigál akkor kapcsoljuk le a WS-t
		window.onunload = function() {
			esbclient.close(1001, "User has navigated away!");
		};
		
		// add imported i18n pack. see require array!
		try {
			window.i18n = JSON.parse(intern13n);
		} catch (e) {
			if (console) console.error(e);
			throw e;
		}
		
		var app = davis(router.main);
		
		domReady(function(){
			esbclient.url = "ws://192.168.1.103:8080";
			esbclient.connect();
			
			app.$content = $("#content");
			app.$navigation = $("#navigation");
			app.datas = false;
			
			router.init.call(app);
			
			app.start();
		});
	}
);

