var Backbone = require('backbone');
var debug = require('debug')('collections:Playlists')

var URI = require('URIjs');
var _ = require('underscore');

var clientId = require('../config').clientId;
var Playlist = require('../models/Playlist');

module.exports = Backbone.Collection.extend({

  initialize: function (models, options) {
    console.log("MAKING PLAYLISTS", models, options);
    this.on("add", function(playlist) {
      debug("added playlist", playlist);
    });
    this.options = options;
  },

  url: function () {
    var url = "https://api.soundcloud.com";
    var userId = this.options.userId;
    var query = {};

    // if user logged in, use his/her playlists
    if (userId) {
      url += "/users/" + userId;
      query = {
        'oauth_token': SC.accessToken(),
        'client_id': clientId,
      }
    }

    url += "/playlists";
    url = new URI(url);
    return url.query(query);
  },

  save: function () {
    debug("save", this.models);
    var num = 0;
    this.map(function (playlist) {
      // only save playlists
      if (playlist.get('type') === 'playlist') {
        num++;
        playlist.save();
      }
    });
    // TODO: make this count how many actually changed
    alert("Successfully saved " + num + " playlists to SoundCloud!");
  },

  model: Playlist,
});