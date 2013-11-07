var Linx = require('../app.js');

module.exports = Linx.module('Tracks', function (Tracks, App, Backbone) {

  Tracks.Clip = Backbone.Model.extend({
  
    defaults: function () {
      return {
        'type': 'clip',
        'name': "unnamed clip",
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