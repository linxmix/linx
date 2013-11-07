var Linx = require('../app.js');

Linx.module('DAW', function (DAW, App, Backbone, Marionette, $, _) {
  DAW.Router = Marionette.AppRouter.extend({});

  DAW.Tracker = function () {
    this.trackList = new App.Tracks.TrackList();
  }

  _.extend(DAW.Tracker.prototype, {
    // start the app by showing the appropriate views
    // and fetching the list of todo items, if there are any
    start: function () {
      this.showTracks(this.trackList);
      this.trackList.fetch();
    },

    showTracks: function (tracks) {
      App.main.show(new App.Tracks.Views.ListView({
        'collection': tracks
      }));
    },
  });

  DAW.addInitializer(function () {
    var tracker = DAW.tracker = new DAW.Tracker();
    tracker.router = new DAW.Router({
      'controller': tracker
    });
    tracker.start();
  });
});