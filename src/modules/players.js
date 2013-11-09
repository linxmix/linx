
var Linx = require('../app.js');

module.exports = Linx.module('Players', function (Players, App, Backbone, Marionette, $, _) {

  Players.addInitializer(function () {

    Players.player = new Players.SimplePlayer();

    $.when([Players.player.ready]).done(function () {

      Players.player.fetch(function (err, resp) {

        App.player.show(new Players.Views.SimplePlayer({
          'model': Players.player,
        }));
      });
    });
  });
});