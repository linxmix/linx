var Backbone = require('backbone');
var debug = require('debug')('collections:Nodes')

var Node = require('../models/Node');

module.exports = Backbone.Collection.extend({

  initialize: function (models, options) {
    this.on("add", function(node) {
      debug("added node: " + node.id);
    });
    this.options = options;
  },

  model: Node,
});