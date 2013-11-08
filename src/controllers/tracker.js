var Linx = require('../app.js');

Linx.module('Tracks', function (Tracks, App, Backbone, Marionette, $, _) {

  Tracks.Tracker = Marionette.Controller.extend(
  {

    'initialize': function () {
      var self = this;
      self.trackList = new App.Tracks.TrackList();

      // handle defference
      self.deferred = $.Deferred();
      Linx.on('initialize:after', function () {
        $.when(self.deferred, App.Samples.sampler.deferred).done(function() {
          self.show(self.trackList);
        });
      });
    },

    // start the app by showing the appropriate views
    // and fetching the list of todo items, if there are any
    'start': function () {
      var self = this;
      self.trackList.fetch({
        'success': function () {
          self.deferred.resolve();
        }
      });
    },  

    'show': function (tracks) {
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
