/**
 * @author Grigore András Zsolt
 */

var general = require("../../utils/general");

var Osztaly = function(conf) {
	this.valami = conf || "semmi";
	this.num = 6;
}

var fgv = function(conf) {
	
}

var peldanyS = new Osztaly();
var peldanyNS = new Osztaly("nemsemmi");
var fgv = new fgv();
var szam = 6;

console.time('---general.objectGetKeyValue');
console.log(general.objectGetKeyValue(require("../../http/routeMiddlewares/"))['vmi']);
console.log(typeof general.objectGetKeyValue);
console.log(typeof Osztaly);
console.log(Osztaly);
console.log(typeof peldanyS);
console.log(peldanyS);
console.log(typeof peldanyNS);
console.log(peldanyNS);
console.log(typeof fgv);
console.log(fgv);
console.log(typeof szam);
console.log(szam);
console.timeEnd('---general.objectGetKeyValue');
