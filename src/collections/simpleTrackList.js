var Linx = require('../app.js');

module.exports = Linx.module('Players.Tracks', function (Tracks, App, Backbone) {

  Tracks.SimpleTrackList = Tracks.TrackList.extend({

    'model': Tracks.SimpleTrack,
  });
});