var Linx = require('../app.js');

module.exports = Linx.module('Players.Tracks.Clips.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.SimpleClipListView = Views.ClipListView.extend({
    'itemView': Views.SimpleClipView,
  });

});