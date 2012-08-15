/**
 * @author Grigore András Zsolt
 */

exports.sessionMessages = function(req, res, next){
  var error = req.session.error;
  var info = req.session.info;
  var redirect = req.session.redirect;
  delete req.session.error;
  delete req.session.info;
  res.locals.message = {};
  if (info) {
  	res.locals.message.type = "info";
  	res.locals.message.text = info;
  }
  if (error) {
  	res.locals.message.type = "error";
	res.locals.message.text = error;
  }
  if (redirect) {
  	res.locals.redirect = redirect;
  }
  next();
}

exports.i18n = function(req, res, next){
	//console.log(req.acceptedLanguages);
	//console.log(req.path);
  	next();
}