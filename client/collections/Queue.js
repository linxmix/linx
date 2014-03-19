var Backbone = require('backbone');

var clientId = require('../config').clientId;

var Track = require('../models/Track');

module.exports = Backbone.Collection.extend({

  initialize: function (options) {
    this.options = options;
  },

  model: Track,
});