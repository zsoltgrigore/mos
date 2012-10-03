/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	var paper = require('paper');
	
	/**
	 * BarSymbol
	 *
	 * /\
	 * ||
	 * ||
	 * \/
	 */
	var Bar = module.exports = function(position) {
		this.position = position;
		return this.create();
	};
	
	Bar.prototype.create = function() {
		with (paper) {
			var barPath = new Path();
			barPath.add(new Point(0, 0));
			barPath.add(new Point(10, 10));
			barPath.add(new Point(10, 90));
			barPath.add(new Point(0, 100));
			barPath.add(new Point(-10, 90));
			barPath.add(new Point(-10, 10));

			barPath.closed = true;
			
			barPath.translate(this.position.subtract(barPath.position));
			
			return barPath;
		}
	}

});