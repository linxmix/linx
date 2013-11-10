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

      // player is ready when its trackList is ready
      var self = this;
      $.when(this.trackList.ready).done(function () {
        if (debug) console.log("player ready", self);
        defer.resolve();
      });
    },

    'assertState': function () {
      if (debug) console.log("asserting state on player model", this.get('state'));
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
      this.trackList.create({}, {
        'success': function (track) {
          if (debug) console.log("track", track);
          // create new clip for that track
          track.queue(source.get('_id'));
        },
        'error': function (error) {
          throw error;
        },
      });
    },

  });
});