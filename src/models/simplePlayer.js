var Linx = require('../app.js');

module.exports = Linx.module('Players', function (Players, App, Backbone) {

  Players.SimplePlayer = Backbone.Model.extend({

    'defaults': function () {
      return {
        'type': 'player',
        'playerType': 'simple',
        'state': 'stopped'
      };
    },

    'initialize': function () {
      this.trackList = new App.Tracks.TrackList();
      this.trackList.fetch();
    },
  });
});