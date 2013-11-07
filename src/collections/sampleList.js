var Linx = require('../app.js');

module.exports = Linx.module('Samples', function (Samples, App, Backbone) {

  Samples.SampleList = Backbone.Collection.extend({

    'model': Samples.Sample,

    // include documents in Map Reduce response. order by 'order'.
    'pouch': {
      'listen': true,
      'fetch': 'query',
      'options': {
        'query': {
          'include_docs': true,
          'fun': {
            'map': function (doc) {
              if (doc.type === 'sample') {
                emit(doc.name, null);
              }
            },
          },
        },
        'changes': {
          'include_docs': true,
          'filter': function(doc) {
            return doc._deleted || doc.type === 'sample';
          }
        },
      },
    },

    // parse view result, use doc property injected via `include_docs`
    'parse': function (result) {
      return _.pluck(result.rows, 'doc');
    },

  });
});