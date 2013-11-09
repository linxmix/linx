var Linx = require('../app.js');

module.exports = Linx.module('Tracks.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.SimpleTrackView = Views.TrackView.extend({
    'template': require('templates')['simpleTrack'],

    'initialize': function () {
      var self = this;
      // when the clip is (re-)loaded, view it
      var onLoadClips = function (clip) {
        self.clipsView = new App.Tracks.Views.ClipView({
          'model': clip,
        });
      };
      if (self.clips) onLoadClips(self.model.clips);
      else self.model.on('loadClips', onLoadClips);
      Views.TrackView.prototype.initialize.call(self);
    },
    
  });
});