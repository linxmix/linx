var Linx = require('../app.js');

module.exports = Linx.module('Library', function (Library, App, Backbone) {

  Library.SimpleLibrary = Backbone.Model.extend({

    'defaults': function () {
      return {
        'type': 'player',
        'libraryType': 'simple',
      };
    },

    'initialize': function () {
      this.sampleList = new App.Samples.SampleList();
      this.sampleList.fetch();
    },

  });
});