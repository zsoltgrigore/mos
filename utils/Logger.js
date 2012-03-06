/*!
 * socket.io-node
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var toArray = require('./general').toArray;
var tty = require('tty');

/**
 * Log levels.
 */

var levels = [
    'error'
  , 'warn'
  , 'info'
  , 'debug'
];

/**
 * Colors for log levels.
 */

var colors = [
    31
  , 33
  , 36
  , 90
];

/**
 * Pads the nice output to the longest log level.
 */

function pad (str) {
  var max = 0;

  for (var i = 0, l = levels.length; i < l; i++)
    max = Math.max(max, levels[i].length);

  if (str.length < max)
    return str + new Array(max - str.length + 1).join(' ');

  return str;
};

function nowStr () {
  var now = new Date();
  //2012-02-07T21:46:09
  var str = ''  + now.getFullYear() + 
            '-' + now.getMonth()+1 +
            '-' + now.getDay() +
            'T' + now.getHours() +
            ':' + now.getMinutes() +
            ':' + now.getSeconds();

  return str;
};

/**
 * Logger (console).
 *
 * @api public
 */

var Logger = module.exports = function (opts) {
  opts = opts || {}
  var logger = logger || {};
  this.colors = false !== tty.isatty(process.stdout.fd);
  this.level =  logger.level || opts.level || 3;
  this.enabled = opts.enabled || true;
  this.target = opts.target || "N/A";
};

/**
 * Log method.
 *
 * @api public
 */

Logger.prototype.log = function (type) {
  var index = levels.indexOf(type);

  if (index > this.level || !this.enabled)
    return this;
  
  var msghdr = this.colors
        		? '\033[' + colors[index] + 'm' + nowStr() + ' ' + this.target + ' ' + pad(type) + ' -\033[39m '
        		: nowStr() + ' ' + this.target + ' ' + type + ': ';
  var msg = msghdr + arguments[1]; 
  
  console.log.apply(console, [msg].concat(toArray(arguments).slice(2)));

  return this;
};

/**
 * Generate methods.
 */

levels.forEach(function (name) {
  Logger.prototype[name] = function () {
    this.log.apply(this, [name].concat(toArray(arguments)));
  };
});