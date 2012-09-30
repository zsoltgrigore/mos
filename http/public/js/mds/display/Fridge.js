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
			
			//this.frame.position = [300, 75];
			
			var destination = new Point([300, 75]);
			var self = this;
			view.onFrame = function(event) {
				var vector = destination.subtract(self.frame.position);
				if (vector.length > 5) {
					self.frame.position = self.frame.position.add(vector.divide(30));
				}
			}
		}
	};
	
	Fridge.prototype.rotate = function() {

		with (paper) {
			var copy = this.frame.clone();
			copy.strokeColor = 'red';
			view.onFrame = function(event) {
				// Each frame, rotate the copy by 1 degree:
				
				copy.rotate(1);
			}
		}
	};

});