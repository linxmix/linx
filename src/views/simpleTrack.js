var Linx = require('../app.js');

module.exports = Linx.module('Tracks.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.SimpleTrackView = Views.TrackView.extend({
    'template': require('templates')['simpleTrack'],

    'initialize': function () {
      var self = this;
      // when the clip is (re-)loaded, view it
      self.model.on('loadClips', function (clip) {
        self.template = require('templates')['simpleTrack'];
        self.clipsView = new App.Samples.Views.SampleClipView({
          'model': clip,
        });
      });
      Views.TrackView.prototype.initialize.call(self);
    },
    
  });
});