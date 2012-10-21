/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	var paper = require('paper');

	var DigitNumber = require('mds/display/model/DigitNumber');
	var utils = require('mds/utils');
	
	var DisplayController = module.exports = function(config) {
		this.controlPoint = config.controlPoint;
		this.numberGroup = false;
		
		/* init - paperize */
		this.controlPoint = new paper.Point(this.controlPoint);
		//FF needs this
		paper.view.draw();
	};

	DisplayController.prototype.drawDisplay = function() {

	};

	DisplayController.prototype.drawNumber = function(num) {
		var digitsArray = utils.digitsToArray(num);
		var ruler = new DigitNumber(-1, {position: paper.view.center, dilatation: 0});
		var xDistance = ruler.bounds.width*1.5;
		
		if (this.numberGroup) {
			console.log("remove");
			this.numberGroup.removeChildren();
		} else {
			this.numberGroup = new paper.Group();
		}
		
		console.log(xDistance);
		console.log(digitsArray);
		
		if (digitsArray.length == 1) {
			// FIXME: size attribute is not handled
			if (utils.isNegative(num)) {
				this.numberGroup.addChild(ruler);
				console.log(ruler.bounds);
			}
			
			for (var i = 0; i < digitsArray.length; i++) {
				for (var d = 1; d <= digitsArray[i].length; d++) {
					var intNum = parseInt(digitsArray[i][d-1]);
					var position = i % 2 == 0 ? -d : d;
					var digitGroup = new DigitNumber(intNum, {
							position: paper.view.center.subtract([position * xDistance, 0])
							, dilatation: 2
						}
					);
					
					this.numberGroup.addChild(digitGroup);
				}
				//this.numberGroup.tarnslate([-300,0]);
			}
			
			this.numberGroup.fillColor = '#eb3d00';
			
			paper.view.draw();
		}
	};
});