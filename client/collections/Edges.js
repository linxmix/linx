var Backbone = require('backbone');
var debug = require('debug')('collections:Edges')

var clientId = require('../config').clientId;

var Edge = require('../models/Edge');

module.exports = Backbone.Collection.extend({

  initialize: function (options) {
    this.on("add", function(edge) {
      debug("added edge", edge);
    });
    this.options = options;
  },

  url: '/edges',
  model: Edge,
});