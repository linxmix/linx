var Backbone = require('backbone.marionette/node_modules/backbone');
var Marionette = require('backbone.marionette');
var BackbonePouch = require('backbone-pouch');
var _ = require('underscore');
var $ = require('jquery');

var App = require('../');

var attachments = BackbonePouch.attachments();

module.exports = Backbone.Model.extend({

  'initialize': function () {
    if (debug) {
      console.log('initing source', this);
      this.on('all', function (name) {
        console.log("source event: ", name);
      });
    }
  },

  'getBlob': function (callback) {
    this.attachment(this.attachments()[0], callback);
  },

  'getSource': function () {
    // TODO generalize mapping from type to function
    var type = this.get('type');
    switch (type) {
      case 'sample':
        App.Samples.Sample.prototype.makeWave.apply(this, arguments);
    }
  },

  // extend with PouchDB attachment functionality
  'attach': attachments.attach,
  'attachments': attachments.attachments,
  'attachment': attachments.attachment,

});
