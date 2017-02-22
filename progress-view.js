"use strict";

var CompactGauge = require("./compact-gauge");

module.exports = function (BaseView) {
  var ProgressView = function ProgressView(options) {
    BaseView.call(this, options);

    this.logProvider = options.logProvider;
    this.includeRegex = new RegExp(this.layoutConfig.include);

    this.node = new CompactGauge({
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
    var lines = data.replace(/\n$/, "").split("\n");

    var lastLine = null;
    for (var i = lines.length - 1; i >= 0; i--) {
      if (this.includeRegex.test(lines[i])) {
        lastLine = lines[i];
        break;
      }
    }

    if (lastLine !== null) {
      var match = lastLine.match(this.includeRegex);
      var percent = Math.round(Math.max(0, Math.min(100, parseInt(match[1], 10))));
      this.node.setPercent(percent);

      this.parent.screen.render();
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
