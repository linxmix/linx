var Linx = require('../app.js');

module.exports = Linx.module('Tracks.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.TrackListView = Backbone.Marionette.CompositeView.extend({
    'template': require('templates')['trackList'],
    'itemView': Views.TrackView,
    'itemViewContainer': '#trackList',

    'events': {
      'click .create': 'create',
    },

    'create': function () {
      App.Players.conductor.player.trackList.create();
    },

  });
});