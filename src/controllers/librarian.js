var Linx = require('../app.js');

Linx.module('Library', function (Library, App, Backbone, Marionette, $, _) {

  Library.Librarian = Marionette.Controller.extend(
  {
    'initialize': function () {
      this.library = new App.Library.SimpleLibrary();
    },

    'start': function () {
      this.library.fetch();
      this.show();
    },  

    'show': function () {
      App.library.show(new App.Library.Views.SimpleLibrary({
        'model': this.library,
      }));
    },
  });

  Library.addInitializer(function () {
    var librarian = Library.librarian = new Library.Librarian();
    librarian.start();
  });
});
