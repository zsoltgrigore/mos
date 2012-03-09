/**
 * @author Grigore András Zsolt
 */

function accessLogger(req, res, next) {
  console.log(req);
  console.log('this path accessed by %s', req.session.user.name);
  next();
}

exports.accessLogger = accessLogger;