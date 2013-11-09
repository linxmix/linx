var Linx = require('../app.js');

module.exports = Linx.module('Tracks.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.SimpleTrackView = Views.TrackView.extend({
    'template': require('templates')['simpleTrack'],

    'initialize': function () {
      var self = this;
      // when the clip is (re-)loaded, view it
      var onLoadClips = function (clip) {
        if (!debug) console.log("clip loaded", clip);

        self.clipsView = new App.Tracks.Views.ClipView({
          'model': clip,
        });
      };
      // if we have clips now, load them
      if (self.model.clips) onLoadClips(self.model.clips);
      // on event, load clips
      self.model.on('loadClips', onLoadClips);
      // call parent constructor
      Views.TrackView.prototype.initialize.call(self);
    },
    
  });
});