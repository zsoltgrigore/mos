/**
 * @author Grigore András Zsolt
 */

define(["mds/connection/EsbWSClient"], function(EsbClient) {
	var instance = null;

	/*https://gist.github.com/1106973*/
	function esbClient(){
		if(instance !== null){
			throw new Error("Cannot instantiate more than one esbClient, use esbClient.getInstance()");
		}
	}

	esbClient.getInstance = function(){
		if(instance === null){
			instance = new EsbClient({
				
			});
		}
		return instance;
	};

	return esbClient.getInstance();
});