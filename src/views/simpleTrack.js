var Linx = require('../app.js');

module.exports = Linx.module('Players.Tracks.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.SimpleTrackView = Views.TrackView.extend({
    'template': require('templates')['simpleTrack'],

    'initialize': function () {
      Views.TrackView.prototype.initialize.call(this);

      // initialize this track's clipList view
      this.clipListView = new App.Players.Tracks.Clips.Views.SimpleClipListView({
        'collection': this.model.clipList,
      });
    },

  });
});