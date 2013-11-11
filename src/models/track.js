var Linx = require('../app.js');

module.exports = Linx.module('Players.Tracks',
  function (Tracks, App, Backbone, Marionette, $, _) {

  Tracks.Track = Backbone.Model.extend({

    'defaults': function () {
      var order = App.Players.player.trackList.nextOrder();
      return {
        'type': 'track',
        'state': 'stop',
        'order': order,
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

      // reassert state on state change
      this.on('change:state', this.assertState);
    },

    'assertState': function () {
      // track's state should be reflected in its clip
      console.log("asserting state on track model", this.get('state'));
      (this.clips && this.clips.set('state', this.get('state')));
    },

    'getClipState': function (clipId) {
      // simple tracks have 1 sampleClip whose state is a reflection of the track state
      return this.get('state');
    },

    'queue': function (source) {
      var self = this;
      self.clipList.create({
        'source': source,
        'track': self.get('_id'),
        'state': self.getClipState()
      }, {
        'success': function (clip) {
          // when this track's clip is destroyed, destroy the track
          self.listenTo(clip, 'destroy', function () {
            if (debug) { console.log("track's clip destroyed", self, clip); }
            if (self.clipList.models.length === 0) {
              self.destroy();
            }
          });
        },
        'error': function (error) {
          throw error;
        },
      });
    },

    'destroy': function () {
      if (debug) console.log("destroying track", this);

      // before this track is destroyed, destroy all its clips
      var self = this;
      var clips = this.clipList.models.slice();
      _.each(clips, function (clip) {
        if (debug) console.log("removing clip from clipList", clip);
        clip.destroy();
      });
      // destroy this track
      Backbone.Model.prototype.destroy.call(this);
    },

  });
});