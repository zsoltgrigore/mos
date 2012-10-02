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
	
	Fridge.prototype.drawBar = function() {
		with (paper) {
			var barPath = new Path();
			barPath.add(new Point(10, 0));
			barPath.add(new Point(0, 10));
			barPath.add(new Point(0, 90));
			barPath.add(new Point(10, 100));
			barPath.add(new Point(20, 90));
			barPath.add(new Point(20, 10));
			barPath.closed = true;
			//barPath.strokeColor = 'black';
			barPath.fillColor = 'orange'
			barPath.position = view.center;
			
			view.onFrame = function() {
				barPath.rotate(2);
			};
			
			
		}
	}
	
	Fridge.prototype.rotate = function() {

	};

});