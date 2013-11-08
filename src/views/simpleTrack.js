var Linx = require('../app.js');

module.exports = Linx.module('Tracks.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.SimpleTrackView = Views.TrackView.extend({
    'tagName': 'li',
    'template': require('templates')['simpleTrack'],

    'regions': {
      'clips': '#track-clips'
    },

    'initialize': function () {
      if (typeof this.model.attributes.clips === 'string') {
        var clipId = this.model.attributes.clips;
        // if this track has a clip, view it
        this.clipsView = new App.Samples.Views.SampleClipView({
          'model': App.Library.librarian.library.sampleList.get(clipId)
        });
        // when this track's clip is destroyed, destroy the track
        this.listenTo(this.clipsView.model, 'destroy', this.close);
      }
    },
    
  });
});