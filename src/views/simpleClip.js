var Linx = require('../app.js');

module.exports = Linx.module('Players.Tracks.Clips.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.SimpleClipView = Views.ClipView.extend({

    'events': {
      'click .play-pause': 'onPlayPause',
      'click .stop': 'onStop',
    },

    'initialize': function () {
      Views.ClipView.prototype.initialize.call(this);

      var self = this;
      // rerender wave on each new render
      // TODO: optimize (or remove) this
      self.on('render', function () {
        // TODO: generalize arguments for retrieving source
        if (debug) console.log('clip rendering source', self);
        self.model['source'].getSource({
          'container': self.$('.source')[0],
          'audioContext': App.audioContext,
        }, function (err, wave) {
          if (err) throw err;
          self['wave'] = wave;
        });
      });
    },

    'onPlayPause': function () {
      this.wave.playPause();
    },

    'onStop': function () {
      this.wave.stop();
    },

  });
});