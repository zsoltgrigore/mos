/**
 * @author Grigore András Zsolt
 */
 
requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'js/libs',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        mds: '../mds',
        socketio: '../../socket.io/socket.io'
    },
    shim: {
        socketio: {
            /*if has dependencies deps: ['jquery', 'underscore'],*/
            exports: 'io'
        },
        paper: {
            exports: 'paper'
        }
    }
});

require(["mds/EsbWebClient", "mds/display/Fridge", "plugins/domReady", "paper", "jquery"],
	function(EsbWebClient, Fridge, domReady, paper, $) {
		/*var esbWebClient = new EsbWebClient();
		esbWebClient.connect();*/
		
		//paper.install(window);
		
		domReady(function(){
			paper.setup('displays');

			with (paper) {
				var fridge = new Fridge({controlPoint: new Point(0, 0)});
				fridge.drawFrame();
				
				view.draw();
			}
		});
	}
);

