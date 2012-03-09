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
  console.log("   %s létezik, vajon jó a jelszava?", name);
  if (user.pass == global.hash(pass, user.salt)) return fn(null, user);
  console.log("   %s hibás jelszót adott meg");
  // Minden egyébb esetben hibás a pass
  fn(new Error('invalid password'));
}

exports.authenticate = authenticate;
exports.one = require("./test/one").one;
