/**
 * @author Grigore András Zsolt
 */

function restrict(req, res, next) {
  if (req.session.user && req.session.user.hash) {
	if(this.socketMap[req.session.user.source].user.isValidHash(req.session.user.hash)) {
		console.log("beengedve");
    	next();
	} else {
		console.log("rossz hash");
		req.session.error = 'Bad hash provided!';
		res.redirect('/login');
	};

  } else {
	console.log("acces denied");
    req.session.error = 'Access denied!';
	res.redirect('/login');
  }
}

exports.restrict = restrict;
