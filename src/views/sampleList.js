var Linx = require('../app.js');

module.exports = Linx.module('Samples.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.SampleListView = Backbone.Marionette.CompositeView.extend({
    'template': '#template-sampleList',
    'itemView': Views.SampleView,
    'itemViewContainer': '#sample-list',

    'events': {
      'click .create': 'create',
    },

    'create': function () {
      App.Samples.sampler.sampleList.create();
    }
  });

});