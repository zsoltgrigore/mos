/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	var paper = require('paper');

	var DigitNumber = require('mds/display/model/DigitNumber');
	var utils = require("mds/utils/common");
	
	var DisplayController = module.exports = function(config) {
		this.boundaries = config.boundaries || false;
		this.controlPoint = config.controlPoint || config.boundaries.center;
		this.numberGroup = false;
		
		/* init - paperize */
		//console.log(config.boundaries);
		this.controlPoint = new paper.Point(this.controlPoint);
		
		//FF needs this
		paper.view.draw();
	};

	DisplayController.prototype.drawDisplay = function() {

	};

	DisplayController.prototype.drawNumber = function(num) {
		var digitsArray = utils.digitsToArray(num);
		//console.log(paper.view.center);
		
		var ruler = new DigitNumber(-1, {position: paper.view.center, dilatation: 0});
		var xDistance = ruler.bounds.width*1.5;
		
		if (this.numberGroup) {
			this.numberGroup.removeChildren();
		}

		this.numberGroup = new paper.Group();
		
		// FIXME: size attribute is not handled*/
		if (utils.isNegative(num)) {
			this.numberGroup.addChild(ruler);
			//console.log(ruler.bounds);
		}
		
		//start position is after the '-/+' sign this is on the 0. postion."+" is not visible.
		var position = 0;
		for (var i = 0; i < digitsArray.length; i++) {
			for (var d = 0; d < digitsArray[i].length; d++) {
				var intNum = parseInt(digitsArray[i][d]);
				//first char positioned after the neg sign
				position--;
				var digitGroup = new DigitNumber(intNum, {
						position: paper.view.center.subtract([position * xDistance, 0])
						, dilatation: 2
					}
				);
				this.numberGroup.addChild(digitGroup);
			}
			
			if (i == 0 && digitsArray[i+1]) {
				var circle = new paper.Path.Circle(paper.view.center.subtract([position * xDistance - 75, -100]), 10);
				this.numberGroup.addChild(circle);
			}
		}
		
		//position to control
		this.numberGroup.position = this.controlPoint;
		//scale to boundaries
		if (this.boundaries) {
			//The bounding rectangle of the item excluding stroke width.
			
			var scaleHeight = this.boundaries.size.height/this.numberGroup.strokeBounds.size.height;
			var scaleWidth = this.boundaries.size.width/this.numberGroup.strokeBounds.size.width;
			var sc = 1;
			//console.log("scaleHeight: "+scaleHeight);
			//console.log("scaleWidth: "+scaleWidth);
			//if (scaleHeight < 1 && scaleWidth < 1) {
				//sc = scaleHeight > scaleWidth ? scaleHeight : scaleWidth;
			//} else {
				sc = scaleHeight > scaleWidth ? scaleWidth : scaleHeight;
			//}
			this.numberGroup.scale(sc);
			//this.numberGroup.style.strokeColor = 'red';
			//this.numberGroup.style.strokeWidth = 2;
		}
		
		this.numberGroup.fillColor = '#ff0000';
		
		paper.view.draw();
	};
});