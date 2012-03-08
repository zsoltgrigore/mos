/**
 * @author Grigore András Zsolt
 */

function accessLogger(req, res, next) {
  console.log('/restricted accessed by %s', req.session.user.name);
  next();
}

exports.accessLogger = accessLogger;