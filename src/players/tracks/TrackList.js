var Linx = require('../../');

module.exports = Linx.module('Players.Tracks', function (Tracks, App, Backbone) {

  Tracks.TrackList = Backbone.Collection.extend({

    'model': Tracks.Track,

    // include documents in Map Reduce response. order by 'order'.
    'pouch': {
      'listen': true,
      'fetch': 'query',
      'options': {
        'query': {
          'include_docs': true,
          'fun': {
            'map': function (doc) {
              if (doc.type === 'track') {
                emit(doc.order, null);
              }
            },
          },
        },
        'changes': {
          'include_docs': true,
          'filter': function(doc) {
            return doc._deleted || doc.type === 'track';
          }
        },
      },
    },

    // start trackList when all submodules are loaded
    'initialize': function () {
      var self = this;
      if (debug) {
        console.log('initing trackList', self);
        self.on('all', function (name) {
          console.log("trackList event: ", arguments);
        });
      }

      // trackList is ready after fetching and each track is ready
      var defer = $.Deferred();
      self.ready = defer.promise();
      self.fetch({
        'success': function (coll) {
          if (debug) console.log("trackList fetched", self);
          // accumulate all track.ready's into array
          var readys = _.map(self.models, function (track) {
            return track.ready;
          });
          // wait for all readys till resolution
          $.when.apply(this, readys).done(function () {
            if (debug) console.log("trackList ready", self);
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
      if (debug) { console.log("parsing trackList", result); }
      return _.pluck(result.rows, 'doc');
    },

    // we keep the Tracks in sequential order, despite being saved by unordered
    // GUID in the database. this generates the next order number for new items.
    'nextOrder': function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },

    // Tracks are sorted by their original insertion order.
    'comparator': function(track) {
      return track.get('order');
    }
  });
});