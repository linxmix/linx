
var Linx = require('../')
console.log("Linx", Linx);

  console.log("asdf");
  
module.exports = Linx.module('Library', function () {

  this.samples = require('./samples');

  this.Source = require('./Source');
  this.Index = require('./Index');
  this.Library = require('./Library');
  this.LibraryView = require('./LibraryView');

  // player initialization
  this.addInitializer(function () {
    var Library = require('./Library');
    Library.library = new Library();

    // when library model is ready, show library view
    $.when(Library.library.ready).done(function () {
      if (debug) console.log("showing library");
      var LibraryView = require('./LibraryView');
      Linx.libraryRegion.show(new LibraryView({
        'model': Library.library,
      }));
    });

  });
});
