var Linx = require('../app.js');

module.exports = Linx.module('Tracks', function (Tracks, App, Backbone) {

  Tracks.Clip = Backbone.Model.extend({
  
    'defaults': function () {
      return {
        'type': 'clip',
        'state': 'stop',
        'source': undefined,
      };
    },

  });
});