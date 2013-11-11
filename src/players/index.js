
var Linx = require('../');

module.exports = Linx.module('Players', function (Players, App, Backbone, Marionette, $, _) {

  // player initialization
  Players.addInitializer(function () {
    Players.player = new Players.SimplePlayer();

    // when player model is ready, show player view
    $.when(Players.player.ready).done(function () {
      if (debug) console.log("showing player");
      App.player.show(new Players.Views.SimplePlayer({
        'model': Players.player,
      }));
    });

  });
});