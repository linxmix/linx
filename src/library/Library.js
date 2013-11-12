var Linx = require('../');

module.exports = Linx.module('Library', function (Library, App, Backbone) {

  Library.Library = Backbone.Model.extend({

    'defaults': function () {
      return {
        'type': 'library',
      };
    },

    'initialize': function () {
      if (debug) {
        console.log('initing library', this);
        this.on('all', function (name) {
          console.log("library event: ", arguments);
        });
      }

      // create sub-models
      this.index = new Library.Index();
      this.sampleList = new App.Samples.SampleList();
      var submodels = [this.index, this.sampleList];

      // player is ready when its sub-models are ready
      var defer = $.Deferred();
      this.ready = defer.promise();
      var self = this;
      $.when.apply(this, _.pluck(submodels, 'ready')).done(function () {
        if (debug) console.log("library ready", self);
        defer.resolve();
      });
    },

  });
});