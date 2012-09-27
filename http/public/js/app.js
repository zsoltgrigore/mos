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

require(["mds/EsbWebClient", "plugins/domReady"], function(EsbWebClient, domReady) {
	var esbWebClient = new EsbWebClient();
	esbWebClient.connect();
	
	domReady(function(){
		
	});
});

