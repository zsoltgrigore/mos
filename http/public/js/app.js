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
        }
    }
});

require(["mds/EsbWebClient", "mds/display/Fridge", "plugins/domReady", "jquery"],
	function(EsbWebClient, Fridge, domReady, $) {
		/*var esbWebClient = new EsbWebClient();
		esbWebClient.connect();*/
		
		domReady(function(){
			var canvasCtx = $('#displays')[0].getContext('2d');
			var fridge = new Fridge({ctx: canvasCtx, x: 10, y:10});
			fridge.drawFrame();
			
		});
	}
);

