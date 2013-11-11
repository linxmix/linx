var Linx = require('../../');

module.exports = Linx.module('Players.Tracks.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.TrackListView = Backbone.Marionette.CompositeView.extend({
    'template': require('templates')['players/tracks/TrackList'],
    'itemView': Views.TrackView,
    'itemViewContainer': '.trackList',
    
    'initialize': function () {
      if (debug) {
        console.log("initing trackList view", this);
        this.on('all', function (e) { console.log("trackList view event: ", e); });
      }
    },

  });
});