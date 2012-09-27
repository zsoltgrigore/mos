/**
 * @author Grigore András Zsolt
 */

define(function(require, exports, module) {
	
	var Fridge = module.exports = function(config) {
		this.ctx = config.ctx;
		this.controlPoint = {x: config.x, y:config.y};
	};

	Fridge.prototype.drawFrame = function() {
		this.ctx.beginPath();
		this.ctx.moveTo(this.controlPoint.x, this.controlPoint.y);
		this.ctx.lineTo(this.controlPoint.x + 200, this.controlPoint.y);
		this.ctx.lineTo(this.controlPoint.x + 200, this.controlPoint.y+150);
		this.ctx.lineTo(this.controlPoint.x, this.controlPoint.y+150);
		this.ctx.closePath();
		this.ctx.strokeStyle="black";
		this.ctx.stroke();
	};

});