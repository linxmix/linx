var Backbone = require('backbone');
var debug = require('debug')('collections:Widgets')

// TODO: is there a better way to write this?
var Widget = (require('../config').widgetModel === 'SC') ?
  require('../models/Widget_SC') : require('../models/Widget_Wave');

module.exports = Backbone.Collection.extend({

  initialize: function (options) {
    this.on("add", function(widget) {
      debug("added widget: " + widget.get('index'));
    });
    this.options = options;
  },

  model: Widget,
});