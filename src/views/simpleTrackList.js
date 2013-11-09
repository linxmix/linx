var Linx = require('../app.js');

module.exports = Linx.module('Players.Tracks.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.SimpleTrackListView = Views.TrackListView.extend({
    'itemView': Views.SimpleTrackView,

    // create a new track for given clip
    'addClip': function (clip) {
      this.create({
        'clips': clip._id
      });
    },

  });
});