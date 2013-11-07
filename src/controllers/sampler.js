var Linx = require('../app.js');

Linx.module('Samples', function (Samples, App, Backbone, Marionette, $, _) {

  Samples.Sampler = function () {
    this.sampleList = new App.Samples.SampleList();
  };

  _.extend(Samples.Sampler.prototype, {
    // start the app by showing the appropriate views
    // and fetching the list of todo items, if there are any
    start: function () {
      this.showSamples(this.sampleList);
      this.sampleList.fetch();
    },  

    showSamples: function (samples) {
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