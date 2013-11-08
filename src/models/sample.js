var Linx = require('../app.js');
var BackbonePouch = require('backbone-pouch');

var attachments = BackbonePouch.attachments();

module.exports = Linx.module('Samples', function (Samples, App, Backbone, Marionette, $, _) {

  Samples.Sample = App.Tracks.Clip.extend({
  
    'constructor': function (attributes, options) {
      // if constructor called with file attribute
      if (attributes && (attributes.file instanceof File)) {

        // extract file from attributes
        var file = attributes.file;
        delete attributes.file;

        // use file info to default undefined attributes
        _.defaults(attributes, {
          'name': file.name
        });

        // construct model
        Backbone.Model.call(this, attributes, options)
        
        // attach file
        this.once('sync', function () {
          this.attach(file, file.name, file.type, function (err, result) {
            if (err) throw err;
          });
        });
      } else {
        Backbone.Model.apply(this, arguments);
      }
    },

    'defaults': function () {
      return {
        'type': 'sample',
        'name': "unnamed sample",
      };
    },

    'getBlob': function (callback) {
      this.attachment(this.attachments()[0], callback);
    },

    // extend with PouchDB attachment functionality
    'attach': attachments.attach,
    'attachments': attachments.attachments,
    'attachment': attachments.attachment,

  });
});