var Linx = require('../app.js');

module.exports = Linx.module('Players.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.SimplePlayer = Marionette.Layout.extend({
    'tagName': 'div',
    'template': require('templates')['simplePlayer'],

    'regions': {
      'tracks': '.tracks'
    },

    'initialize': function () {
      var self = this;

      // wait for trackList to sync
      self.model.trackList.once('sync', function (model, resp, options) {
        // add track list view
        self.trackListView = new App.Tracks.Views.TrackListView({
          'collection': self.model.trackList,
        });
        // render self
        self.show();
      });
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