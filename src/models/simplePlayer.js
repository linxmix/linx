var Linx = require('../app.js');

module.exports = Linx.module('Players', function (Players, App, Backbone) {

  Players.SimplePlayer = Players.Player.extend({

    'defaults': function () {
      return {
        'type': 'player',
        'playerType': 'simple',
        'state': 'stop',
      };
    },

    'initialize': function () {
      this.trackList = new App.Tracks.SimpleTrackList();
      Players.Player.prototype.initialize.call(this);
    },

    'assertState': function () {
      console.log("asserting state on player model", this.get('state'));
      // player's state should be reflected on 0th track
      var firstTrack = this.trackList.models[0];
      (firstTrack && firstTrack.set('state', this.get('state')));
    },

    'getTrackState': function (track) {
      // set first track to player state
      if (track.get('order') === 0) {
        return this.get('state');
      // set all other tracks to 'stop'
      } else {
        return 'stop';
      }
    },

    'queue': function (source) {
      if (debug) console.log('player queueing source', source);
      // create new track
      this.trackList.create({}, { 'success': function (track) {
        // create new clip for that track
        track.clipList.create({ 'source': source.get('_id'), });
      }});
    },

  });
});