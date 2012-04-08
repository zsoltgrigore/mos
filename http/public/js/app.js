/**
 * @author Grigore András Zsolt
 */

require(["mds/EsbWebClient"], function(EsbWebClient) {
   
   var esbWebClient = new EsbWebClient();
   console.log(esbWebClient.getConnection());
});
