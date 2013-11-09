var Linx = require('../app.js');

module.exports = Linx.module('Tracks', function (Tracks, App, Backbone) {

  Tracks.SimpleTrack = Tracks.Track.extend({

    'initialize': function () {
      Tracks.Track.prototype.initialize.call(this);
      // this track should have a single clip
      var self = this;
      var clipId = self.get('clips');

      if (typeof clipId === 'string') {

        // load clip on sync
        clipList.on('sync', function () {
          var clip = self.clips = clipList.get(clipId);
          if (!debug) console.log(clipId, clip);

          // if this clip exists, view it
          if (clip) {
            // when this track's clip is destroyed, destroy the track
            self.listenTo(clip, 'destroy', self.destroy);
            self.trigger('loadClips', clip);
          }

          // clip doesn't exist -> log it as error
          else {
            console.error("WARNING: clip no longer exists: "+clipId);
          }
        });
      }
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

  });
});