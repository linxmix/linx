var Linx = require('../app.js');

module.exports = Linx.module('Players.Tracks.Clips.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.ClipListView = Backbone.Marionette.CompositeView.extend({
    'template': require('templates')['clipList'],
    'itemView': Views.ClipView,
    'itemViewContainer': '.clipList',
    
    'initialize': function () {
      if (debug) {
        console.log("initing clipList view", this);
        this.on('all', function (e) { console.log("clipList view event: ", e); });
      }
    },

  });
});