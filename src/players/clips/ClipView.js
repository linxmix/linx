var Linx = require('../../');

module.exports = Linx.module('Players.Tracks.Clips.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.ClipView = Marionette.ItemView.extend({
    'tagName': 'li',
    'template': require('templates')['players/clips/Clip'],

    'modelEvents': {
      'destroy': 'close',
    },

    'initialize': function () {
      if (debug) {
        console.log("initing clip view", this);
        this.on('all', function (e) { console.log("clip view event: ", e); });
      }
    },

  });
});