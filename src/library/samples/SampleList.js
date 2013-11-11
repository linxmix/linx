var Backbone = require('backbone.marionette/node_modules/backbone');
var Marionette = require('backbone.marionette');
var BackbonePouch = require('backbone-pouch');
var _ = require('underscore');
var $ = require('jquery');

module.exports = require('../').Backbone.Collection.extend({

  'model': require('./Sample'),

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

  'initialize': function () {
    var self = this;
    if (debug) {
      console.log('initing sampleList', self);
      self.on('all', function (name) {
        console.log("sampleList event: ", name);
      });
    }

    // sampleList is ready after fetch
    var defer = $.Deferred();
    self.ready = defer.promise();
    self.fetch({
      'success': function (coll) {
        if (debug) console.log("sampleList fetched and ready", self);
        defer.resolve();
      },
      'error': function (err) {
        throw err;
      },
    });
  },

  // parse view result, use doc property injected via `include_docs`
  'parse': function (result) {
    return _.pluck(result.rows, 'doc');
  },

});
