var Linx = require('../app.js');

Linx.module('Tracks', function (Tracks, App, Backbone, Marionette, $, _) {

  Tracks.Tracker = function () {
    this.trackList = new App.Tracks.TrackList();
  };

  _.extend(Tracks.Tracker.prototype, {
    // start the app by showing the appropriate views
    // and fetching the list of todo items, if there are any
    start: function () {
      this.showTracks(this.trackList);
      this.trackList.fetch();
    },  

    showTracks: function (tracks) {
      App.tracks.show(new App.Tracks.Views.TrackListView({
        'collection': tracks
      }));
    },
  }); 

  Tracks.addInitializer(function () {
    var tracker = Tracks.tracker = new Tracks.Tracker();
    tracker.start();
  });
});