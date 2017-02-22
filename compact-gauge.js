var blessed = require("blessed");
var Canvas = require("blessed-contrib/lib/widget/canvas");
var ansiTerm = require("ansi-term");

var Node = blessed.Node;

var leftOffset = 1;
var rightOffset = 1;
var topOffset = 0;
var topTextOffset = 1;
var cent = 100;
var gaugeHeight = 2;
var half = 0.5;

var CompactGauge = function CompactGauge(options) {

  var self = this;

  options = options || {};
  self.options = options;
  self.options.stroke = options.stroke || "magenta";
  self.options.fill = options.fill || "white";
  self.options.data = options.data || [];
  self.options.showLabel = options.showLabel !== false;

  if (!(this instanceof Node)) {
    return new CompactGauge(options);
  }

  Canvas.call(this, options, ansiTerm);

  this.on("attach", function () {
    if (self.options.stack) {
      var stack = self.stack = self.options.stack;
      self.setStack(stack);
    } else {
      var percent = self.percent = self.options.percent || 0;
      self.setData(percent);
    }
  });
};

CompactGauge.prototype = Object.create(Canvas.prototype);

CompactGauge.prototype.calcSize = function () {
  this.canvasSize = {
    width: this.width - leftOffset - rightOffset - 1,
    height: this.height
  };
};

CompactGauge.prototype.type = "gauge";

CompactGauge.prototype.setData = function (data) {
  if (typeof data === "number") {
    this.setPercent(data);
  }
};

CompactGauge.prototype.setPercent = function (percent) {
  if (!this.ctx) {
    throw new Error(
      "error: canvas context does not exist. " +
      "setData() for gauges must be called after the gauge has been added " +
      "to the screen via screen.append()"
    );
  }

  var c = this.ctx;

  c.strokeStyle = this.options.stroke;
  c.fillStyle = this.options.fill;

  c.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);

  var width = percent / cent * (this.canvasSize.width - leftOffset);
  c.fillRect(leftOffset, topOffset, width, gaugeHeight);

  var textX = Math.floor(this.canvasSize.width * half - 1);
  if (width < textX) {
    c.strokeStyle = "normal";
  }

  if (this.options.showLabel) {
    c.fillText(percent + "%", textX, topTextOffset);
  }
};

CompactGauge.prototype.getOptionsPrototype = function () {
  return {
    percent: 10
  };
};


module.exports = CompactGauge;
