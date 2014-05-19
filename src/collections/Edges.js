var Backbone = require('backbone');
var debug = require('debug')('collections:Edges')

var config = require('../config');
var clientId = config.clientId;
var apiServer = config.apiServer;

var Edge = require('../models/Edge');

module.exports = Backbone.Collection.extend({

  initialize: function (options) {
    this.on("add", function(edge) {
      debug("added edge", edge);
    });
    this.options = options;
  },

  url: apiServer + "/edges",
  model: Edge,
});