var Backbone = require('backbone');
var debug = require('debug')('collections:Playlists')

var URI = require('URIjs');
var _ = require('underscore');

var clientId = require('../config').clientId;
var Playlist = require('../models/Playlist');

module.exports = Backbone.Collection.extend({

  initialize: function (models, options) {
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
    var saved = 0, deleted = 0;
    this.map(function (playlist) {
      // only do playlists
      if (playlist.get('linxType') === 'playlist') {
        // delete if marked for delete
        if (playlist.get('delete')) {
          playlist.destroy();
          deleted++;
        // else save
        } else {
          playlist.save();
          saved++;
        }
      }
    });
    // TODO: make this count how many actually changed
    alert("Saved " + saved + " playlists. Deleted " + deleted + " playlists.");
  },

  model: Playlist,
});