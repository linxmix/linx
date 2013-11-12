var Linx = require('../');

module.exports = Linx.module('Library.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.Library = Marionette.Layout.extend({
    'tagName': 'div',
    'template': require('templates')['library/Library'],

    'regions': {
      'samples': '.samples',
      'transitions': '.transitions',
    },

    'initialize': function () {
      if (debug) {
        console.log("initing library view", this);
        this.on('all', function (e) { console.log("library view event: ", e); });
      }
      // initialize this library's sampleList view
      this.sampleListView = new App.Samples.Views.SampleListView({
        'collection': this.model.sampleList,
      });
      // initialize this library's transitionList view
      this.transitionListView = new App.Samples.Views.TransitionListView({
        'collection': this.model.transitionList,
      });
    },

    'onShow': function() {
      if (this.sampleListView) {
        if (debug) console.log("library showing samples", this.sampleListView);
        this.samples.show(this.sampleListView);
      }
      if (this.transitionListView) {
        if (debug) console.log("library showing transitions", this.transitionListView);
        this.transitions.show(this.transitionListView);
      }
    },

    'destroy': function () {
      this.model.destroy();
    },

  });
});