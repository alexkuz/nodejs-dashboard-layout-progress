"use strict";

var contrib = require("blessed-contrib");

module.exports = function (BaseView) {
  var ProgressView = function ProgressView(options) {
    BaseView.call(this, options);

    this.logProvider = options.logProvider;
    this.includeRegex = new RegExp(this.layoutConfig.include);

    this.node = contrib.gauge({
      label: " " + this.layoutConfig.title + " ",
      border: "line",
      style: {
        border: {
          fg: this.layoutConfig.borderColor
        }
      },
      stroke: this.layoutConfig.progressColor,
      fill: this.layoutConfig.textColor
    });

    this.recalculatePosition();

    options.parent.append(this.node);

    var content = options.logProvider.getLog(this.layoutConfig.streams);

    if (content.length > 0) {
      this._update(content);
    }

    this._boundUpdate = this._update.bind(this);

    this.layoutConfig.streams.forEach(function (eventName) {
      this.logProvider.on(eventName, this._boundUpdate);
    }.bind(this));
  };

  ProgressView.prototype = Object.create(BaseView.prototype);

  ProgressView.prototype.getDefaultLayoutConfig = function () {
    return {
      borderColor: "blue",
      progressColor: "green",
      textColor: "white",
      title: "progress",
      streams: ["stderr", "stdout"]
    };
  };

  ProgressView.prototype._update = function (data) {
    var lines = data.replace(/\n$/, "");

    var lastLine = lines.split("\n")
      .filter(function (line) {
        return this.includeRegex.test(line);
      }.bind(this))
      .pop();

    if (lastLine) {
      var match = lastLine.match(this.includeRegex);
      var percent = Math.round(Math.max(0, Math.min(100, parseInt(match[1], 10))));
      this.node.setPercent(percent < 1.001 ? percent / 100 : percent);
    }
  };

  ProgressView.prototype.destroy = function () {
    BaseView.prototype.destroy.call(this);

    this.layoutConfig.streams.forEach(function (eventName) {
      this.logProvider.removeListener(eventName, this._boundUpdate);
    }.bind(this));

    this._boundUpdate = null;
    this.logProvider = null;
  };

  return ProgressView;
};
