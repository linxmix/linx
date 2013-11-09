var Linx = require('../app.js');

module.exports = Linx.module('Players', function (Players, App, Backbone, Marionette, $, _) {

  Players.SimplePlayer = Players.Player.extend({

    'defaults': function () {
      return {
        'type': 'player',
        'playerType': 'simple',
        'state': 'stop',
      };
    },

    'initialize': function () {
      Players.Player.prototype.initialize.call(this);

      var defer = $.Deferred();
      this.ready = defer.promise();

      this.trackList = new App.Players.Tracks.SimpleTrackList();
      // start player when all submodules are loaded
      $.when([this.trackList.ready]).done(defer.resolve);
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
      this.trackList.create({}, function (err, track) {
        if (err) throw err;
        // create new clip for that track
        track.clipList.create({ 'source': source.get('_id'), });
      });
    },

  });
});