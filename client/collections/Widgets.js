var Backbone = require('backbone');
var debug = require('debug')('collections:Widgets')

var Widget_SC = require('../models/Widget_SC');

module.exports = Backbone.Collection.extend({

  initialize: function (options) {
    this.on("add", function(widget) {
      debug("added widget: " + widget.get('index'));
    });
    this.options = options;
  },

  model: Widget_SC,
});