var Linx = require('../');

module.exports = Linx.module('Players.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.Player = Marionette.Layout.extend({
    'tagName': 'div',
    'template': require('templates')['players/Player'],

    'regions': {
      'tracks': '.tracks'
    },

    'initialize': function () {
      if (debug) {
        console.log("initing player view", this);
        this.on('all', function (e) { console.log("player view event: ", e); });
      }
    },

    'onShow': function() {
      if (this.trackListView) {
        if (debug) console.log("player showing tracks", this.trackListView);
        this.tracks.show(this.trackListView);
      }
    },

    'destroy': function () {
      this.model.destroy();
    },
  });
});