var Linx = require('../../');

module.exports = Linx.module('Players.Tracks.Clips', function (Clips, App, Backbone) {

  Clips.ClipList = Backbone.Collection.extend({

    'model': Clips.Clip,

    // include documents in Map Reduce response.
    'pouch': {
      'listen': true,
      'fetch': 'query',
      'options': {
        'query': {
          'include_docs': true,
          'fun': {
            'map': function (doc) {
              if (doc.type === 'clip') {
                emit(doc, null);
              }
            },
          },
        },
        'changes': {
          'include_docs': true,
          'filter': function(doc) {
            return doc._deleted || doc.type === 'clip';
          }
        },
      },
    },

    'initialize': function () {
      var self = this;
      if (debug) {
        console.log('initing clipList', self);
        self.on('all', function (name) {
          console.log("clipList event: ", arguments);
        });
      }

      // clipList is ready after fetching and each clip is ready
      var defer = $.Deferred();
      self.ready = defer.promise();
      self.fetch({
        'success': function (coll) {
          if (debug) console.log("clipList fetched", self);
          // accumulate all clip.ready's into array
          var readys = _.map(self.models, function (clip) {
            return clip.ready;
          });
          // wait for all readys till resolution
          $.when.apply(this, readys).done(function () {
            if (debug) console.log("clipList ready", self);
            defer.resolve();
          });          
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
});