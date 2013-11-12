var Linx = require('../');

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
      // init events
      this.events = [];
    },

    'assertState': function () {
      if (debug) console.log("asserting player state: " + this.get('state'));

      // simple player only plays its 0th track
      var firstTrack = this.trackList.models[0];
      if (firstTrack) {
        switch (this.get('state')) {

          case 'play':
            // if there is a secondTrack, schedule it's play on firstTrack's end
            var self = this;
            this.addEvent(function () { self.cycle(); },
              firstTrack.getTimeRemaining());
            firstTrack.play(); break;

          case 'pause':
            this.clearEvents();
            firstTrack.pause(); break;

          case 'stop':
            this.clearEvents();
            firstTrack.stop(); break;

          default:
            console.error("WARNING: player in unknown state");
        }
      }
    },

    'cycle': function () {
      if (debug) console.log("player cycling tracks", this);
      //this.trackList.models[0].destroy();
      // start playing second track
      var nextTrack = this.trackList.models[1];
      (nextTrack && nextTrack.play());
    },

    // create and return new event from given callback and time
    'addEvent': function (callback, time) {
      var event = App.clock.setTimeout(callback, time);
      if (debug) console.log("adding event", event, callback, time);
      this.events.push(event);
      return event;
    },

    'clearEvent': function (event) {
      if (debug) console.log("clearing event", event);
      var eventIndex = this.events.indexOf(event);
      // if we have this event in our events, remove it
      if (eventIndex > -1) {
        this.events.splice(eventIndex, 1);
      }
      // clear event
      (event && event.clear());
    },

    'clearEvents': function () {
      if (debug) console.log("clearing player events", this);
      _.each(this.events, function (event) { event.clear(); });
      this.events = [];
    },

    'setupTrackListens': function (track) {
      // when track seeks, update events
      var self = this;
      this.listenTo(track, 'seek', function (percent) {
        // TODO: fix this
        if (typeof self.lastTimePlayed !== 'undefined') {
          self.clearEvents();
          self.addEvent(function () { self.cycle(); },
            track.getTimeRemaining());
        }
      });
    },

    // simple player queues each source into its own track
    'queue': function (source) {
      if (debug) console.log('player queueing source', source);
      // create new track
      var self = this;
      this.trackList.create({}, {
        'success': function (track) {
          if (debug) console.log("track", track);
          self.setupTrackListens(track);
          // when the track is ready
          $.when(track.ready).done(function () {
            // create new clip for that track
            // TODO: assert player state after clip is queued
            track.queue(source.get('_id'));
          });
        },
        'error': function (error) {
          throw error;
        },
      });
    },

  });
});