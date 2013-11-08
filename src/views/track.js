var Linx = require('../app.js');

module.exports = Linx.module('Tracks.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.TrackView = Marionette.Layout.extend({
    'tagName': 'li',
    'template': require('templates')['track'],

    'events': {
      'click .destroy': 'destroy',
    },

    'regions': {
      'clips': '#track-clips'
    },

    'initialize': function () {
    },

    // display any clips
    'onShow': function() {
      if (this.clipsView) {
        this.clips.show(this.clipsView);
      }
    },

    'destroy': function () {
      this.model.destroy();
    },
    
  });
});