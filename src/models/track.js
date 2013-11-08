var Linx = require('../app.js');

module.exports = Linx.module('Tracks', function (Tracks, App, Backbone) {

  Tracks.Track = Backbone.Model.extend({
  
    'defaults': function () {
      var order = App.Tracks.tracker.trackList.nextOrder();
      return {
        'type': 'track',
        'name': "track" + order,
        'order': order,
        'clips': undefined, // a single id string or a map of ids
      };
    },

  });
});