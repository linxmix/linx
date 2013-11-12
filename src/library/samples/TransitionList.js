var Linx = require('../../');

module.exports = Linx.module('Samples', function (Samples, App, Backbone) {

  Samples.TransitionList = Samples.SampleList.extend({

    'model': Samples.Transition,

    // include documents in Map Reduce response. order by 'order'.
    'pouch': {
      'listen': true,
      'fetch': 'query',
      'options': {
        'query': {
          'include_docs': true,
          'fun': {
            'map': function (doc) {
              if (doc.type === 'sample' && doc.sampleType === 'transition') {
                emit(doc.name, null);
              }
            },
          },
        },
        'changes': {
          'include_docs': true,
          'filter': function(doc) {
            return doc._deleted ||
              (doc.type === 'sample' && doc.sampleType === 'transition');
          }
        },
      },
    },

  });
});