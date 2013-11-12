var Linx = require('../');

module.exports = Linx.module('Players.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.SimplePlayer = Views.Player.extend({
    'template': require('templates')['players/SimplePlayer'],

    'events': {
      'click .playPause': 'playPause',
      'click .stop': 'stop',
      'click .destroyTracks': 'destroyTracks',
    },

    'initialize': function () {
      Views.Player.prototype.initialize.call(this);

      // initialize this player's trackList view
      this.trackListView = new App.Players.Tracks.Views.SimpleTrackListView({
        'collection': this.model.trackList,
      });
    },

    'playPause': function () {
      this.model.playPause();
    },

    'stop': function () {
      this.model.stop();
    },

    'destroyTracks': function () {
      this.model.destroyTracks();
    },
    
  });
});