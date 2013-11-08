var Linx = require('../app.js');

Linx.module('Players', function (Players, App, Backbone, Marionette, $, _) {

  Players.Conductor = Marionette.Controller.extend(
  {
    'initialize': function () {
      this.player = new App.Players.SimplePlayer();
    },

    'start': function () {
      this.player.fetch();
      this.show();
    },  

    'show': function () {
      App.player.show(new App.Players.Views.SimplePlayer({
        'model': this.player,
      }));
    },
  });

  Players.addInitializer(function () {
    var conductor = Players.conductor = new Players.Conductor();
    conductor.start();
  });
});
