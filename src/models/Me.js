var Backbone = require('backbone')
var debug = require('debug')('models:Me');

var Tracks = require('../collections/Tracks');
var Favorites = require('../models/Favorites');
var User = require('./User');

module.exports = User.extend({

  url: "https://api.soundcloud.com/me",

  login: function (appTracks, appPlaylists, onLogin) {
    SC.connect(function () {
      SC.get('/me', function (me) {
        this.set(me);

        // fetch user tracks
        // and add to app tracks
        /*this.tracks().fetch({
          success: function (tracks) {
            appTracks.add(tracks.models);
            onLogin && onLogin();
          }.bind(this),
          error: function () {
            console.error("error fetching user "+this.id+"'s tracks!");
          }.bind(this),
        });*/

        // fetch user favorites
        // and add as playlist to app playlists
        this.favorites().fetch({
          success: function (favorites, response, options) {
            appPlaylists.add(new Favorites({
              'tracks': favorites,
            }), { 'at': 1 });
          },
          error: function () {
            console.error("error fetching user "+this.id+"'s favorites!");
          }.bind(this),
        });

        // fetch user playlists
        // and add to app playlists
        this.playlists().fetch({
          success: function (playlists) {
            // make note that these playlists are on SC
            playlists.forEach(function (playlist) {
              playlist.set({ 'onSC': true });
            });
            appPlaylists.add(playlists.models);
            onLogin && onLogin();
          }.bind(this),
          error: function () {
            console.error("error fetching user "+this.id+"'s playlists!");
          }.bind(this),
        });

      }.bind(this));
    }.bind(this));
  },

  logout: function () {
    SC.disconnect();
    this.clear();
  },
});