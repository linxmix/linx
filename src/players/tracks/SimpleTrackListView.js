var Linx = require('../../');

module.exports = Linx.module('Players.Tracks.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.SimpleTrackListView = Views.TrackListView.extend({
    'itemView': Views.SimpleTrackView,
  });
  
});