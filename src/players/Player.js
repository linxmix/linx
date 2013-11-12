var Linx = require('../');

module.exports = Linx.module('Players', function (Players, App, Backbone, Marionette, $, _) {

  Players.Player = Backbone.Model.extend({

    // 
    // must be implemented by inheriters
    //
    'assertState': function () {
      throw new Error("Player.assertState not implemented");
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
      if (debug) {
        console.log('initing player', this);
        this.on('all', function (name) {
          console.log("player event: ", arguments);
        });
      }
      // make this player's trackList
      this.trackList = new App.Players.Tracks.TrackList();
      // reassert state on state change
      this.on('change:state', this.assertState);
    },

    // toggle player between play and pause
    'playPause': function () {
      switch (this.get('state')) {
        case 'pause': case 'stop':
          this.play(); break;
        case 'play':
          this.pause(); break;
        default:
          console.error("WARNING: player in unknown state");
      }
    },

    'play': function () {
      this.set('state', 'play');
    },

    'pause': function () {
      this.set('state', 'pause');
    },

    'stop': function () {
      this.set({ 'state': 'stop'});
    },

    // TODO: move this into collection
    'destroyTracks': function () {
      var self = this;
      var tracks = this.trackList.models.slice();
      _.each(tracks, function (track) {
        track.destroy();
      });
    },

    'destroy': function () {
      if (debug) console.log("destroying player", this);
      // before this player is destroyed, destroy all its tracks
      this.destroyTracks();
      // destroy this player
      Backbone.Model.prototype.destroy.call(this);
    },

  });
});