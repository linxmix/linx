var Linx = require('../app.js');

module.exports = Linx.module('Players.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.SimplePlayer = Views.Player.extend({
    'template': require('templates')['simplePlayer'],

    'events': {
      'click .playPause': 'playPause',
      'click .stop': 'stop',
    },

    'initialize': function () {
      var self = this;
      var samplesReady = $.Deferred();
      var tracksReady = $.Deferred();

      App.on("initialize:after", function () {
        // wait for trackList to sync
        self.model.trackList.once('sync', function (model, resp, options) {
          tracksReady.resolve();
        });

        // wait for sampleList to sync
        App.Library.librarian.library.sampleList.once('sync', function (model, resp, options) {
          samplesReady.resolve();
        });

        // after sampleList and trackList have been synced,
        $.when(samplesReady, tracksReady).done(function () {
          // add track list view
          self.trackListView = new App.Tracks.Views.SimpleTrackListView({
            'collection': self.model.trackList,
          });
          // render self
          self.show();
        });
      });
    },

    'playPause': function() {
      this.model.playPause();
    },

    'stop': function() {
      this.model.stop();
    },
  });
});