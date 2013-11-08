var Linx = require('../app.js');
var BackbonePouch = require('backbone-pouch');

var attachments = BackbonePouch.attachments();

module.exports = Linx.module('Samples', function (Samples, App, Backbone) {

  Samples.Sample = App.Tracks.Clip.extend({
  
    'defaults': function () {
      return {
        'type': 'sample',
        'name': "unnamed sample",
      };
    },

    'getWave': function () {
      // TODO: return wave made from attachment
    },

    // extend with PouchDB attachment functionality
    'attach': attachments.attach,
    'attachments': attachments.attachments,
    'attachment': attachments.attachment,

  });
});