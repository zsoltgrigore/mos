/**
 * @author Grigore András Zsolt
 */

var crypto = require('crypto');

exports.hash = function(msg, key) {
  return crypto.createHmac('sha512', key).update(msg).digest('hex');
}