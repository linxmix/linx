var Backbone = require('backbone')

var User = require('./User');

module.exports = User.extend({

  url: "https://api.soundcloud.com/me",

  login: function (appTracks, appPlaylists, onLogin) {
    SC.connect(function () {
      SC.get('/me', function (me) {
        this.set(me);

        // fetch user tracks
        // and add to app tracks
        this.tracks().fetch({
          success: function (tracks) {
            appTracks.add(tracks.models);
            onLogin && onLogin();
          }.bind(this),
          error: function () {
            console.error("error fetching user "+this.id+"'s tracks!");
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