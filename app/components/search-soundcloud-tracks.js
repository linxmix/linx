import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  RequireAttributes('store'), {

  actions: {
    executeSearch() {
      let q = this.$('.SearchSoundcloudTracks-Input').val();

      let tracks = this.get('store').query('soundcloud/track', { q });
      this.set('tracks', tracks);
    },
  },

  classNames: ['SearchSoundcloudTracks', 'ui fluid search'],
  classNameBindings: ['tracks.isPending:loading'],

  // params
  tracks: null,

  // search on enter
  keyDown(e) {
    if (e && e.keyCode === 13) {
      this.send('executeSearch');
    }
  },

  source: function() {
    let tracks = this.get('tracks.content') || [];

    return tracks.map((track) => {
      return {
        title: track.get('title'),
        description: track.get('duration'),
        track,
      };
    });
  }.property('tracks.content'),

  sourceDidChange: function() {
    Ember.run.once(this, 'updateSearchResults');
  }.observes('source.[]', 'tracks.[]'),

  updateSearchResults() {
    let source = this.get('source');

    if (source && source.length) {
      let searchFields = ['title', 'description'];
      let $search = this.$();

      // setup semantic search module
      $search.search({
        source,
        searchFields,
        onSelect: this.onTrackSelect.bind(this),
      });

      // display results
      $search.search('query');
    }
  },

  // create new track with this soundcloudTrack
  onTrackSelect(trackWrapper){
    let soundcloudTrack = trackWrapper.track;
    let track = this.get('store').createRecord('track', {
      soundcloudTrack,
      title: soundcloudTrack.get('title'),
      scStreamUrl: soundcloudTrack.get('streamUrl'),
    });

    this.sendAction('selectTrack', track);
  },
});
