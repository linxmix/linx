var Backbone = require('backbone')

var User = require('./User');

module.exports = User.extend({

  url: "https://api.soundcloud.com/me",

  login: function (appTracks) {
    SC.connect(function () {
      SC.get('/me', function (me) {
        this.set(me);

        // fetch user tracks
        // and add to app tracks
        this.tracks().fetch({
          success: function (tracks) {
            appTracks.add(tracks.models);
          }.bind(this),
          error: function () {
            console.error("error fetching user "+this.id+"'s tracks!");
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