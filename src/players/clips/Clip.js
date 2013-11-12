var Linx = require('../../');

module.exports = Linx.module('Players.Tracks.Clips', function (Clips, App, Backbone, Marionette, $, _) {

  // TODO: generalize clip for source
  Clips.Clip = Backbone.Model.extend({
  
    'defaults': function () {
      return {
        'type': 'clip',
        'source': undefined, // the audio source behind this clip
        'track': undefined, // the track that contains this clip
        'trackPos': 0, // this clip's starting position on its track
      };
    },

    'initialize': function () {
      if (debug) {
        console.log('initing clip', this);
        this.on('all', function () {
          console.log("clip event: ", arguments);
        });
      // reassert state on state change
      this.on('change:state', this.assertState);
      }

      // get and attach source before ready
      var defer = $.Deferred();
      this.ready = defer.promise();
      this.source = App.Library.library.index.get(this.get('source'));
      // TODO: generalize arguments for retrieving source
      var self = this;
      this.source.getSource({
        'container': '#emptyWaves',
        'audioContext': App.audioContext,

      }, function (err, wave) {
        if (err) { throw err; }
        self.wave = wave;
        // emit seek event on wave seek
        wave.on('seek', function (percent) {
          self.trigger('seek', percent);
        });
        if (debug) console.log("clip ready", self);
        defer.resolve();
      });

    },

    'play': function (pos) {
      if (debug) { console.log("playing clip", this); }
      if (typeof pos === 'undefined') {
        pos = 0;
        console.log("WARNING: playing clip without pos");
      }
      // play this clip from appropriate position
      this.wave.backend.play(pos - this.get('trackPos'));
    },

    'pause': function () {
      if (debug) { console.log("pausing clip", this); }
      this.wave.pause();
    },

    'stop': function () {
      if (debug) { console.log("stopping clip", this); }
      this.wave.stop();
    },

    'getDuration': function () {
      var wave = this.wave;
      return wave ? wave.timings()[1] : 0;
    },

  });
});