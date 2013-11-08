var Linx = require('../app.js');

module.exports = Linx.module('Tracks.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.ItemView = Marionette.ItemView.extend({
    'tagName': 'li',
    'template': require('templates')['clip'],
  });
});