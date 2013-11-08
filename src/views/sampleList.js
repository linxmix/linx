var Linx = require('../app.js');

module.exports = Linx.module('Samples.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.SampleListView = Backbone.Marionette.CompositeView.extend({
    'template': '#template-sampleList',
    'itemView': Views.SampleView,
    'itemViewContainer': '#sample-list',

    'events': {
      'drop .sampleDrop': 'onDrop',
      'dragenter': 'onDragenter',
      'dragleave': 'onDragleave',
      'dragover': 'onDragover',
    },
    'onDrop': function (e) {
      e.stopPropagation();
      e.preventDefault();
      var dataTransfer = e.originalEvent.dataTransfer;
      this.create((dataTransfer && dataTransfer.files) && dataTransfer.files[0]);
    },
    'onDragover': function (e) {
      e.stopPropagation();
      e.preventDefault();
    },
    'onDragleave': function (e) {
      e.stopPropagation();
      e.preventDefault();
    },

    'create': function (file) {
      // save the given blob (if any) as an attachment
      var sample = new App.Samples.Sample();
      console.log(file, sample.attach);
      sample.attach(file, file.name, file.type, function (err, result) {
        if (err) throw err;
        App.Samples.sampler.sampleList.create(sample);
      });
    },    

  });

});