var Backbone = require('backbone');
var debug = require('debug')('collections:Playlists')

var Playlist = require('../models/Playlist');

module.exports = Backbone.Collection.extend({

  initialize: function (options) {
    this.on("add", function(playlist) {
      debug("added playlist", playlist);
    });
    this.options = options;
  },

  model: Playlist,
});