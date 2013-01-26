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
		this.position = new paper.Point(position);
		return this.create();
	};
	
	Bar.prototype.create = function() {
		var barPath = new paper.Path();
		barPath.add([0, 0]);
		barPath.add([10, 10]);
		barPath.add([10, 90]);
		barPath.add([0, 100]);
		barPath.add([-10, 90]);
		barPath.add([-10, 10]);

		barPath.closed = true;
		
		barPath.translate(this.position.subtract(barPath.position));
		
		return barPath;
	};

});