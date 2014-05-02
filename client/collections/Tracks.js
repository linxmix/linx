var Backbone = require('backbone');
var debug = require('debug')('collections:Tracks')

var clientId = require('../config').clientId;

var Track = require('../models/Track');

module.exports = Backbone.Collection.extend({

  initialize: function (models, options) {
    debug("MAKING TRACKS", options);
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
    if (this.options.favorites) {
      url += "/favorites";
    } else {
      url += "/tracks";
    }
    url += "?client_id=" + clientId;
    debug("TRACKs URL", url);
    return url;
  },

  model: Track,
});