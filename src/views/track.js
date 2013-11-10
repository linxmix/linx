var Linx = require('../app.js');

module.exports = Linx.module('Players.Tracks.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.TrackView = Marionette.Layout.extend({
    'tagName': 'li',
    'template': require('templates')['track'],

    'events': {
      'click .destroy': 'destroy',
    },

    'modelEvents': {
      'loadClips': 'onShow',
    },

    'regions': {
      'clips': '#trackClips'
    },

    'initialize': function () {
      if (debug) {
        console.log("initing track view", this);
        this.on('all', function (e) { console.log("track view event: ", e); });
      }
    },

    // display any clips
    'onShow': function() {
      if (this.clipListView) {
        if (debug) console.log("track showing clips", this.clipListView);
        this.clips.show(this.clipListView);
      }
    },

    'destroy': function () {
      this.model.destroy();
    },
    
  });
});