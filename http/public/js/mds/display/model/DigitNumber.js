/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	var paper = require('paper');
	
	var Bar = require('mds/display/model/Bar');	
	
	/**
	 * DigitNumber built from Bars
	 * 
	 * @param number 1..9
	 * @param config Object
	 */
	var DigitNumber = module.exports = function(number, config) {
		if (number == "-") number = -1;
		if (-1 > number || number > 9) throw "Construct with number between -1 and 9.";
		
		this.number = number;
		this.position = config.position || [0, 0];
		//into utils as scaleToSize()
		this.size = config.size || [0, 0];
		this.dilatation = config.dilatation || 2;
		
		/* Number Descriptors*/
		this.prefix = ["MIDDLE"];
		this.zero	= ["TOP", "TOPRIGHT", "BOTTOMRIGHT", "BOTTOM", "BOTTOMLEFT", "TOPLEFT"];
		this.one	= ["TOPRIGHT", "BOTTOMRIGHT"];
		this.two	= ["MIDDLE", "TOP", "TOPRIGHT", "BOTTOM", "BOTTOMLEFT"];
		this.three	= ["MIDDLE", "TOP", "TOPRIGHT", "BOTTOMRIGHT", "BOTTOM"];
		this.four	= ["MIDDLE", "TOPRIGHT", "BOTTOMRIGHT", "TOPLEFT"];
		this.five	= ["MIDDLE", "TOP", "BOTTOMRIGHT", "BOTTOM", "TOPLEFT"];
		this.six	= ["MIDDLE", "TOP", "BOTTOMRIGHT", "BOTTOM", "BOTTOMLEFT", "TOPLEFT"];
		this.seven	= ["TOP", "TOPRIGHT", "BOTTOMRIGHT"];
		this.eight	= ["MIDDLE", "TOP", "TOPRIGHT", "BOTTOMRIGHT", "BOTTOM", "BOTTOMLEFT", "TOPLEFT"];
		this.nine	= ["MIDDLE", "TOP", "TOPRIGHT", "BOTTOMRIGHT", "BOTTOM", "TOPLEFT"];
		/*********************/
		
		
		/* init - paperize */
		this.position = new paper.Point(this.position);
		return this.create();
	};
	
	DigitNumber.prototype.create = function() {
		switch(this.number) {
			case -1:
				return this.buildNumber(this.prefix);
			case 0:
				return this.buildNumber(this.zero);
			case 1:
				return this.buildNumber(this.one);
			case 2:
				return this.buildNumber(this.two);
			case 3:
				return this.buildNumber(this.three);
			case 4:
				return this.buildNumber(this.four);
			case 5:
				return this.buildNumber(this.five);
			case 6:
				return this.buildNumber(this.six);
			case 7:
				return this.buildNumber(this.seven);
			case 8:
				return this.buildNumber(this.eight);
			case 9:
				return this.buildNumber(this.nine);
			default:
				throw "Value is not a number between -1 and 9!";
		}
	};
	
	DigitNumber.prototype.buildNumber = function(description) {
		var group = new paper.Group();
		for (var i = 0, len = description.length; i < len; i++) {
			group.addChild(this.transformBar(description[i], new Bar(this.position)));
		}
		return group;
	};
	
	DigitNumber.prototype.transformBar = function(orientation, bar) {
		var width = bar.bounds.width > bar.bounds.height ? bar.bounds.width : bar.bounds.height;
		//var height = bar.bounds.height > bar.bounds.width ? bar.bounds.width : bar.bounds.height;
		var leftRightDistance = new paper.Point(width/2, width/2);
		var topBottomDistance = new paper.Point(0, width);
		leftRightDistance.length = leftRightDistance.length * (1 + (this.dilatation/100));
		topBottomDistance.length = topBottomDistance.length * (1 + (this.dilatation/100));

		/*console.log("topBottom: " + topBottomDistance.x + "x" + topBottomDistance.y + " length: " + topBottomDistance.length
					+ " leftRight: " + leftRightDistance.x + "x" + leftRightDistance.y + " length: " + leftRightDistance.length);
		console.log(orientation + " before: " + bar.position);*/

		switch(orientation) {
			case "BOTTOM":
				bar.rotate(90);
				bar.translate(topBottomDistance);
				break;
			case "MIDDLE":
				bar.rotate(90);
				break;
			case "TOP":
				bar.rotate(90);
				bar.translate(topBottomDistance.multiply([1, -1]));
				break;
			case "TOPLEFT":
				bar.translate(leftRightDistance.multiply([-1, -1]));
				break;
			case "TOPRIGHT":
				bar.translate(leftRightDistance.multiply([1, -1]));
				break;
			case "BOTTOMLEFT":
				bar.translate(leftRightDistance.multiply([-1, 1]));
				break;
			case "BOTTOMRIGHT":
				bar.translate(leftRightDistance.multiply([1, 1]));
				break;
		}
		
		//console.log("after: " + bar.position)
		return bar;
	};

});