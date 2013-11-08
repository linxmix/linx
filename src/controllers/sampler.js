var Linx = require('../app.js');

Linx.module('Samples', function (Samples, App, Backbone, Marionette, $, _) {

  Samples.Sampler = Marionette.Controller.extend(
  {
    
    initialize: function () {
      var self = this;
      self.sampleList = new App.Samples.SampleList();

      // handle defference
      self.deferred = $.Deferred();
      Linx.on('initialize:after', function () {
        $.when(self.deferred).done(function() {
          self.show(self.sampleList);
        });
      });
    },

    // start the app by showing the appropriate views
    // and fetching the list of todo items, if there are any
    start: function () {
      var self = this;
      self.sampleList.fetch({
        'success': function () {
          self.deferred.resolve();
        }
      });
    },  

    show: function (samples) {
      App.samples.show(new App.Samples.Views.SampleListView({
        'collection': samples
      }));
    },
  });

  Samples.addInitializer(function () {
    var sampler = Samples.sampler = new Samples.Sampler();
    sampler.start();
  });

});