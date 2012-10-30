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
		}
	}
});

require([  "mds/controller/router",
			"plugins/domReady",
			"davis", "jquery"],
	function(router, domReady, davis, jquery) {
		//paper.install(window);
		
		var app = davis(router);
		
		domReady(function(){
			app.$content = $("#content");
			app.start();
			app.trans('/refrigeratory/')
			
			/*
			paper.setup('display');
			
			var number = 0;
			var dc = new DisplayController({controlPoint: [0, 0]});
			
			$("#enterNumber").submit(function(event) {
				var inputNumber = $('#number').val();
				if (utils.isNumber(inputNumber)) {
					try {
						number = utils.repCommaToDot(inputNumber);
						//dc.drawDisplay();
						dc.drawNumber(number);
					} catch (e) {
						console.log(e);
					}
				}
				
				event.preventDefault();
				return false;
			});
			/*
				with (paper) {
				var fridge = new Fridge({controlPoint: new Point(0, 0)});
				fridge.drawFrame();
				
				view.draw();
			}
			*/

			
		});

	}
);

