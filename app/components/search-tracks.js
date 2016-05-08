import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  RequireAttributes('tracksPromise'), {

  classNames: ['SearchTracks'],

  // expected params
  tracksPromise: null,

  // params
  isReady: Ember.computed.not('tracksPromise.isPending'),

  initSearch: function() {
    let tracksPromise = this.get('tracksPromise');

    tracksPromise.then((tracks) => {
      let source = tracks.map((track) => {
        return {
          title: track.get('title'),
          description: track.get('artist'),
          track: track
        };
      });
      let searchFields = ['title', 'artist'];
      let $search = this.$('.ui.search');

      // destroy prev search
      $search.search('destroy');

      // setup semantic search module
      // TODO: make this use API?
      $search.search({
        source: source,
        searchFields: searchFields,
        onSelect: (trackWrapper) => {
          this.sendAction('action', trackWrapper.track);
        }
      });
    });
  }.on('didInsertElement').observes('tracksPromise.[]'),
});
