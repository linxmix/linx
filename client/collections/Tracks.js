var Backbone = require('backbone');
var debug = require('debug')('collections:Tracks')

var clientId = require('../config').clientId;

var Track = require('../models/Track');

module.exports = Backbone.Collection.extend({

  initialize: function (options) {
    this.on("add", function(track) {
      debug("added track: " + track.get('title'));
    });
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