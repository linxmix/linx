var Linx = require('../app.js');

module.exports = Linx.module('Tracks', function (Tracks, App, Backbone) {

  Tracks.SimpleTrack = Tracks.Track.extend({

    'initialize': function () {
      // this track should have a single clip
      var self = this;
      var clipId = self.get('clips');

      if (typeof clipId === 'string') {
        var sampleList = App.Library.librarian.library.sampleList;
        sampleList.once('sync', function () {
          var clip = self.clips = sampleList.get(clipId);

          // if this clip exists, view it
          if (clip) {
            // when this track's clip is destroyed, destroy the track
            self.listenTo(clip, 'destroy', self.destroy);
            Tracks.Track.prototype.initialize.call(self);
            self.trigger('loadClips', clip);
          }

          // clip doesn't exist -> log it as error
          else {
            console.error("clip no longer exists: "+clipId);
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