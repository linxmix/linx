var Backbone = require('backbone');
var debug = require('debug')('collections:Widgets')

// TODO: is there a better way to write this?
var Widget = (require('../config').widgetModel === 'SC') ?
  require('../models/Widget_SC') : require('../models/Widget_Wave');

module.exports = Backbone.Collection.extend({

  initialize: function (options) {
    this.on("add", function(widget) {
      debug("added widget", widget);
    });
    this.options = options;
    this.activeWidget = 0;
  },

  getActiveWidget: function (offset) {
    if (typeof offset !== 'number') { offset = 0; }
    return this.findWhere({ 'index': this.activeWidget + offset })
  },

  incrementActiveWidget: function () {
    this.activeWidget = mod(this.activeWidget + 1, widgets.length);
    return this.activeWidget;
  },

  decrementActiveWidget: function () {
    this.activeWidget = mod(this.activeWidget - 1, widgets.length);
    return this.activeWidget;
  },

  // widgets are sorted by their index
  comparator: 'index',
  model: Widget,
});

// hand-made mod since javascript's % doesn't play with negative numbers
function mod(x, n) {
  return ((x % n) + n) % n;
}