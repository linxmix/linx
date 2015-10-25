import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  RequireAttributes('clip', 'pxPerBeat'), {

  // optional params
  isPlaying: false,
  isFinished: false,
  clipSeekBeat: 0,
  syncBpm: null,
  visibleMarkers: null,
  clipEvent: null,

  classNames: ['Clip'],

  // params
  model: Ember.computed.reads('clip.model'),

  markerOptions: Ember.computed('visibleMarkers', function() {
    return this.getProperties('visibleMarkers');
  }),
});
