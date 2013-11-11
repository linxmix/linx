var Linx = require('../');

module.exports = Linx.module('Library', function (Library, App, Backbone, Marionette, $, _) {

  // player initialization
  Library.addInitializer(function () {
    Library.library = new Library.Library();

    // when library model is ready, show library view
    $.when(Library.library.ready).done(function () {
      if (debug) console.log("showing library");
      App.library.show(new Library.Views.Library({
        'model': Library.library,
      }));
    });

  });
});
