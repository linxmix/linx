var Backbone = require('backbone');
var debug = require('debug')('collections:Widgets')

var Widget = require('../models/Widget');

module.exports = Backbone.Collection.extend({

  initialize: function (options) {
    this.on("add", function(widget) {
      debug("added widget: " + widget.get('index'));
    });
    this.options = options;
  },

  model: Widget,
});