/**
 * @author Grigore András Zsolt
 */

require(["mds/EsbWebClient"], function(EsbWebClient) {
   
   var esbWebClient = new EsbWebClient({channel: channel});
   console.log(esbWebClient.channel);
});
