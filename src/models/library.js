var Linx = require('../app.js');

module.exports = Linx.module('Library', function (Library, App, Backbone) {

  Library.Library = Backbone.Model.extend({

    'defaults': function () {
      return {
        'type': 'library',
        'libraryType': 'simple',
      };
    },

    'initialize': function () {
      this.index = new Library.Index();
      this.index.fetch();
      this.sampleList = new App.Samples.SampleList();
      this.sampleList.fetch();
    },

  });
});