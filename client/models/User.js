var Backbone = require('backbone');

var Tracks = require('../collections/Tracks');
var Playlists = require('../collections/Playlists');
var clientId = require('../config').clientId;

module.exports = Backbone.Model.extend({

  url: function () {
    return "https://api.soundcloud.com/users/" + this.id +
      "?client_id=" + clientId;
  },
  
  defaults: function () {
    return {
      id: null,
    };
  },

  tracks: function () {
    return new Tracks([], {
      'userId': this.id,
    });
  },

  playlists: function () {
    return new Playlists([], {
      'userId': this.id,
    });
  },

});