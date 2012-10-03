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
		if (0 > number || number > 9) throw "Construct with number between 0 and 9."
		
		this.number = number;
		this.position = config.position || [0, 0];
		
		
		return this.create();
	};
	
	DigitNumber.prototype.create = function() {
		with (paper) {
			var group = new Group();
			this.position = new Point(this.position);
			
			switch(this.number) {
				case 7:
					var s1 = new Bar(this.position);
					s1.translate(new Point(52, -52));
					var s2 = new Bar(this.position);
					s2.translate(new Point(52, 52));
					var s3 = new Bar(this.position);
					s3.rotate(90);
					var s4 = new Bar(this.position);
					s4.rotate(90);
					s4.translate(new Point(0, -102));
					var s5 = new Bar(this.position);
					s5.rotate(90);
					s5.translate(new Point(0, 102));
					
					group.addChild(s1);
					group.addChild(s2);
					group.addChild(s3);
					group.addChild(s4);
					group.addChild(s5);
					break;
				case 2:
					group.addChild(new Bar(this.position));
					break;
				default:
					group.addChild(new Bar(this.position));
				}
			return group;
		}
	}

});