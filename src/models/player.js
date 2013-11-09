var Linx = require('../app.js');

module.exports = Linx.module('Players', function (Players, App, Backbone) {

  Players.Player = Backbone.Model.extend({

    // 
    // must be implemented by inheriters
    //
    'assertState': function () {
      throw new Error("Player.assertState not implemented");
    },

    'getTrackState': function (track) {
      throw new Error("Player.getTrackState not implemented");
    },

    'queue': function (source) {
      throw new Error("Player.queue not implemented");
    },
    //
    // / must be implemented by inheriters
    //

    'defaults': function () {
      return {
        'type': 'player',
        'playerType': 'abstract',
        'state': 'stop',
      };
    },

    'initialize': function () {
      if (!this.trackList) { this.trackList = new App.Tracks.TrackList(); }
      this.trackList.fetch();
      this.on('all', function (name) {
        console.log("player event: "+name);
      });
      // reassert state on state change
      this.on('change:state', this.assertState);
    },

    // toggle player between play and pause
    'playPause': function () {
      switch (this.get('state')) {
        case 'pause': case 'stop':
          this.set('state', 'play'); break;
        case 'play':
          this.set('state', 'pause'); break;
        default:
          console.error("WARNING: player in unknown state");
      }
    },

    'stop': function () {
      this.set({ 'state': 'stop'});
    },

  });
});