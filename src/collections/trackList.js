var Linx = require('../app.js');

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

    // parse view result, use doc property injected via `include_docs`
    'parse': function (result) {
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