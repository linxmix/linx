var Linx = require('../app.js');
var BackbonePouch = require('backbone-pouch');

var attachments = BackbonePouch.attachments();

module.exports = Linx.module('Library', function (Library, App, Backbone, Marionette, $, _) {

  Library.Source = Backbone.Model.extend({
  
    'getBlob': function (callback) {
      this.attachment(this.attachments()[0], callback);
    },

    'getSource': function () {
      // TODO generalize mapping from type to function
      var type = this.get('type');
      switch (type) {
        case 'sample':
          App.Samples.Sample.prototype.getWave.apply(this, arguments);
      }
    },

    // extend with PouchDB attachment functionality
    'attach': attachments.attach,
    'attachments': attachments.attachments,
    'attachment': attachments.attachment,

  });
});