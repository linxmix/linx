var Linx = require('../app.js');

module.exports = Linx.module('Library.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.Library = Marionette.Layout.extend({
    'tagName': 'div',
    'template': require('templates')['library'],

    'regions': {
      'samples': '.samples'
    },

    'initialize': function () {
      var self = this;

      // wait for sampleList to sync
      self.model.sampleList.once('sync', function (model, resp, options) {
        // add track list view
        self.sampleListView = new App.Samples.Views.SampleListView({
          'collection': self.model.sampleList,
        });
        // render self
        self.show();
      });
    },

    'show': function() {
      if (this.sampleListView) {
        this.samples.show(this.sampleListView);
      }
    },

    'destroy': function () {
      this.model.destroy();
    },
  });
});