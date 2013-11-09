var Linx = require('../app.js');

module.exports = Linx.module('Library', function (Library, App, Backbone) {

  Library.Index = Backbone.Collection.extend({

    'model': Library.Source,

    // include documents in Map Reduce response. order by 'order'.
    'pouch': {
      'listen': true,
      'fetch': 'allDocs',
      'options': {
        'allDocs': {
          'include_docs': true,
          'attachments': true,
        },
        'changes': {
          'include_docs': true,
        },
      },
    },

    // parse view result, use doc property injected via `include_docs`
    'parse': function (result) {
      return _.pluck(result.rows, 'doc');
    },

  });
});