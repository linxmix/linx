var Linx = require('../app.js');

module.exports = Linx.module('Players.Tracks', function (Tracks, App, Backbone, Marionette, $, _) {

  Tracks.SimpleTrack = Tracks.Track.extend({

    'initialize': function () {
      Tracks.Track.prototype.initialize.call(this);

      var self = this;
      var defer = $.Deferred();
      self.ready = defer.promise();

      self.clipList = new Tracks.Clips.ClipList();
      // start player when all submodules are loaded
      $.when([self.clipList.ready]).done(function() {
        var clipId = self.get('clips');
        var clip = self.clips = self.clipList.get(clipId);
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

  });
});