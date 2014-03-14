var Backbone = require('backbone');

var clientId = require('../config').clientId;

var Track = require('../models/Track');

module.exports = Backbone.Collection.extend({

  initialize: function (options) {
    this.options = options;
  },

  url: function () {
    var url = "https://api.soundcloud.com";
    if (this.options.userId) {
      url += "/users/" + this.options.userId;
    }
    url += "/tracks";
    url += "?client_id=" + clientId;
    return url;
  },

  model: Track,
});