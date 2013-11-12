var Linx = require('../../');

module.exports = Linx.module('Samples.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.TransitionListView = Views.SampleListView.extend({
    'template': require('templates')['library/samples/TransitionList'],

    'initialize': function () {
      if (debug) {
        console.log("initing transitionList view", this);
        this.on('all', function (e) { console.log("transitionList view event: ", e); });
      }
    },

    'onDrop': function (e) {
      console.log("TRANSITION LIST CREATE CALLED");
      e.stopPropagation();
      e.preventDefault();
      var dataTransfer = e.originalEvent.dataTransfer;
      // create sample from given file
      var file = (dataTransfer && dataTransfer.files) && dataTransfer.files[0];
      this.collection.create({
        'file': file,
      });
    },
    // 
    // /transition drop
    // 

  });
});