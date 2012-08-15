/**
 * @author Grigore András Zsolt
 */

/**
 * enum -> array
 */
exports.toArray = function(enu) {
  var arr = [];

  for (var i = 0, l = enu.length; i < l; i++)
    arr.push(enu[i]);

  return arr;
};

exports.isArray = function(obj) {
  return obj.constructor == Array;
};

/*
 * Megkeresi hogy van-e bármilyen szinten ilyen kulcs az objektumban és visszaadja az étékét.
 * Használat: 
 * 		general.objectGetKeyValue(require("../../http/middlewares/"))['middlewareName'];
 *
 * @param {Object} tree
 * 		bármilyen összetett objektum
 * @param {Objetc} ret
 * 		rekurzióban használt egydimenziós ojjektum a fában található levelek key-vel
 *
 * @return {Object}
 * 		a fából összegyűjtött levelek asszociatív tömbben
 */
exports.objectGetKeyValue = function(tree, ret) {
	var ret = ret || {};
	for (var node in tree ) {
		typeof tree[node] === 'object'
			? exports.objectGetKeyValue(tree[node], ret) 
			: ret[node] = tree[node];
	}
	return ret;
};

exports.cloneConfig = function(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}


exports.rndbtw = function() {
	var min = 0;
	var max = 1;
	if (arguments.length <= 2 && arguments.length > 0) {
		if (arguments.length < 2) {
			max = arguments[0];
		} else {
			if (arguments[0] > arguments[1]) {
				max = arguments[0];
				min = arguments[1];
			} else {
				max = arguments[1];
				min = arguments[0];
			}
		}
	}
	return min+(Math.floor(Math.random()*(max-min+1)));	
}