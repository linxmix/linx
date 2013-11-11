var Backbone = require('backbone.marionette/node_modules/backbone');
var Marionette = require('backbone.marionette');
var _ = require('underscore');
var $ = require('jquery');

module.exports = Marionette.Layout.extend({
  'tagName': 'div',
  'template': require('templates')['library/Library'],

  'regions': {
    'samples': '.samples',
  },

  'initialize': function () {
    if (debug) {
      console.log("initing library view", this);
      this.on('all', function (e) { console.log("library view event: ", e); });
    }
    // initialize this library's sampleList view
    this.sampleListView = require('./samples').SampleListView({
      'collection': this.model.sampleList,
    });
  },

  'onShow': function() {
    if (this.sampleListView) {
      if (debug) console.log("library showing samples", this.sampleListView);
      this.samples.show(this.sampleListView);
    }
  },

  'destroy': function () {
    this.model.destroy();
  },

});