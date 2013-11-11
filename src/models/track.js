var Linx = require('../app.js');

module.exports = Linx.module('Players.Tracks', function (Tracks, App, Backbone) {

  Tracks.Track = Backbone.Model.extend({

    'defaults': function () {
      var order = App.Players.player.trackList.nextOrder();
      return {
        'type': 'track',
        'state': 'stop',
        'order': order,
        'clips': undefined, // a single id string or a map of ids
      };
    },

    'initialize': function () {
      if (debug) {
        console.log('initing track', this);
        this.on('all', function (name) {
          console.log("track event: ", name);
        });
      }

      // track is ready after its clipList is ready
      var self = this;
      var defer = $.Deferred();
      self.ready = defer.promise();
      self.clipList = new Tracks.Clips.ClipList();
      $.when(self.clipList.ready).done(function() {
        if (debug) console.log("track ready", self);
        defer.resolve();
      });
    },

    'assertState': function () {
      // track's state should be reflected in its clip
      console.log("asserting state on track model", this.get('state'));
      (this.clips && this.clips.set('state', this.get('state')));
    },

    'getClipState': function (clip) {
      // simple tracks have 1 sampleClip whose state is a reflection of the track state
      return this.get('state');
    },

    'queue': function (source) {
      var self = this;
      self.clipList.create({
        'source': source,
        'track': self.get('_id'),
      }, {
        'success': function (clip) {
          // when this track's clip is destroyed, destroy the track
          self.listenTo(clip, 'destroy', self.destroy);
          console.log(self.clipList.remove);
        },
        'error': function (error) {
          throw error;
        },
      });
    },

    'destroy': function () {
      if (!debug) console.log("destroying track", this);
      var self = this;
      // before track is destroyed, destroy all its clips
      _.each(self.clipList.models, function (clip) {
        if (!debug) console.log("removing clip from clipList", clip);
        clip.destroy();
      });
      // destroy this track
      Backbone.Model.prototype.destroy.call(self);
    },

  });
});