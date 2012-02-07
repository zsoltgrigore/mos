/**
 * @author Grigore András Zsolt
 */

/**
 * Converts an enumerable to an array.
 */

exports.toArray = function (enu) {
  var arr = [];

  for (var i = 0, l = enu.length; i < l; i++)
    arr.push(enu[i]);

  return arr;
};