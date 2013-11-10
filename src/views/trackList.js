var Linx = require('../app.js');

module.exports = Linx.module('Players.Tracks.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.TrackListView = Backbone.Marionette.CompositeView.extend({
    'template': require('templates')['trackList'],
    'itemView': Views.TrackView,
    'itemViewContainer': '#trackList',
    
    'initialize': function () {
      if (debug) {
        console.log("initing trackListView", this);
        this.on('all', function (e) { console.log("trackList view event: ", e); });
      }
    },

  });
});