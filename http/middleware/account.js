/**
 * @author Grigore András Zsolt
 */

function authenticate(name, pass, fn) {
  console.log("   %s próbál kapcsolódni", name);
  var user = global.users[name];
  // a kapott usernévvel megkérdezni system socketen hogy van-e ilyen user
  // ha van akkor tovább ha nincs akkor Error
  if (!user) return fn(new Error('cannot find user'));
  // a talált userre hash(pass,salt) és ha ugyanaz a hash akkor megvan a user és error = null
  console.log("   %s létezik, vajon jó a jelszva?", name);
  if (user.pass == global.hash(pass, user.salt)) return fn(null, user);
  console.log("   %s hibás jelszót adott meg");
  // Minden egyébb esetben hibás a pass
  fn(new Error('invalid password'));
}

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

exports.authenticate = authenticate;
exports.restrict = restrict;
exports.accessLogger = accessLogger;