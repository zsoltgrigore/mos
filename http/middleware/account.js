/**
 * @author Grigore András Zsolt
 */

//TODO: ide valahogy bevarázsolni a usereket!

function authenticate(name, pass, fn) {
  var user = users[name];
  // query the db for the given username
  if (!user) return fn(new Error('cannot find user'));
  // apply the same algorithm to the POSTed password, applying
  // the hash against the pass / salt, if there is a match we
  // found the user
  if (user.pass == hash(pass, user.salt)) return fn(null, user);
  // Otherwise password is invalid
  fn(new Error('invalid password'));
}
/*
function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}

function accessLogger(req, res, next) {
  console.log('/restricted accessed by %s', req.session.user.name);
  next();
}
*/
exports.authenticate = authenticate;