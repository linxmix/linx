var Backbone = require('backbone.marionette/node_modules/backbone');
var Marionette = require('backbone.marionette');
var BackbonePouch = require('backbone-pouch');
var _ = require('underscore');
var $ = require('jquery');

module.exports = Backbone.Collection.extend({

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

  'initialize': function () {
    var self = this;
    if (debug) {
      console.log('initing index', self);
      self.on('all', function (name) {
        console.log("index event: ", name);
      });
    }

    // index is ready after fetch
    var defer = $.Deferred();
    self.ready = defer.promise();
    self.fetch({
      'success': function (coll) {
        if (debug) console.log("index fetched and ready", self);
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