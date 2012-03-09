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
 * Megkeresi hogy van-e bármilyen szinten ilyen kulcs az objektumban.
 *
 * @param {Object} obj
 * 		bármilyen objektum
 * @param {String} key
 * 		kulcs
 *
 * @return {value | function}
 * 		kulcshoz tartozó érték, lehet függvény is!
 */
//TODO: fabejárás
exports.objectGetKeyValue = function(obj, key) {
	var keyfound = false;
	while (!keyfound) {
		for (var realKey in obj) {
			if (realKey == key) {
				return obj[key];
				break;
			}
		}
		
	}
	
	return false;
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