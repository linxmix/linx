import Ember from 'ember';

export default Ember.Component.extend({

  classNames: ['SearchTracks'],

  // expected params
  tracks: null,

  // params
  isReady: Ember.computed.bool('tracks'),

  initSearch: function() {
    var tracks = this.get('tracks');

    if (!tracks) { return; }

    var source = tracks.map(function(track) {
      return {
        title: track.get('title'),
        description: track.get('artist'),
        track: track
      };
    });
    var searchFields = ['title', 'artist'];

    // setup semantic search module
    this.$('.search').search({
      source: source,
      searchFields: searchFields,
      onSelect: (trackWrapper) => {
        console.log("did select track", trackWrapper);
        this.sendAction('action', trackWrapper.track);
      }
    });

    console.log('init search', source);
  }.on('didInsertElement').observes('tracks.@each'),
});
