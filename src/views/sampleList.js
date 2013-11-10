var Linx = require('../app.js');

module.exports = Linx.module('Samples.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.SampleListView = Backbone.Marionette.CompositeView.extend({
    'template': require('templates')['sampleList'],
    'itemView': Views.SampleView,
    'itemViewContainer': '.sampleList',

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
      App.Library.librarian.library.sampleList.create({
        'file': file,
      });
    },    

  });

});