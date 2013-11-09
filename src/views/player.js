var Linx = require('../app.js');

module.exports = Linx.module('Players.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.Player = Marionette.Layout.extend({
    'tagName': 'div',
    'template': require('templates')['player'],

    'regions': {
      'tracks': '.tracks'
    },

    'initialize': function () {
      // add track list view
      this.trackListView = new App.Players.Tracks.Views.TrackListView({
        'collection': this.model.trackList,
      });
      // render this
      this.show();
    },

    'show': function() {
      if (this.trackListView) {
        this.tracks.show(this.trackListView);
      }
    },

    'destroy': function () {
      this.model.destroy();
    },
  });
});