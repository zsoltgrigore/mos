/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	var paper = require('paper');
	
	var Fridge = module.exports = function(config) {
		this.controlPoint = config.controlPoint;
		this.frame = false;
	};

	Fridge.prototype.drawFrame = function() {
		with (paper) {
			var size = new Size(200, 150);
			var frameRect = new Rectangle(this.controlPoint, size);
			var cornerSize = new Size(5, 5);
			this.frame = new Path.RoundRectangle(frameRect, cornerSize);
			this.frame.strokeColor = 'blue';
		}
	};
	
	Fridge.prototype.rotate = function() {

		with (paper) {
			var copy = this.frame.clone();
			copy.strokeColor = 'red';
			function onFrame(event) {
				// Each frame, rotate the copy by 1 degree:
				copy.rotate(1);
			}
		}
	};

});