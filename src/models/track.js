var Linx = require('../app.js');

module.exports = Linx.module('Tracks', function (Tracks, App, Backbone) {

  Tracks.Track = Backbone.Model.extend({
  
    defaults: function () {
      var order = App.DAW.tracker.trackList.nextOrder();
      return {
        'name': "track" + order,
        'order': order,
      };
    },

    initialize: function () {
      if (! this.get("name")) {
        this.set({
          name: this.defaults.name,
        });
      }
    },
  });
});