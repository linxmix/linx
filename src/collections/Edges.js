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

  url: ((process.env.NODE_ENV === 'production') ?
    'http://api.linx.dj/edges' : 'http://localhost:5000/edges'),
  model: Edge,
});