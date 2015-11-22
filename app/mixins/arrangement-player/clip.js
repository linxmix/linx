import Ember from 'ember';

import _ from 'npm:underscore';

import RequireAttributes from 'linx/lib/require-attributes';
import AliasObjectPropertiesMixin from '../alias-object-properties';

export default Ember.Mixin.create(
  AliasObjectPropertiesMixin('clipEvent', [
    'isPlaying', 'isFinished', 'seekBeat', 'tick', 'syncBpm'
  ]),
  RequireAttributes('clip', 'clipEvent', 'pxPerBeat', 'sinkNode'), {

  // optional params
  sourceNode: null,

  getCurrentEventBeat() {
    return this.get('clipEvent').getCurrentBeat();
  },

  // TODO(REFACTOR): clip FX chain connection. need to abstract for any FX chain - ex arrangementclip

  // TODO: move view logic out of player?
  visibleMarkers: null,
  markerOptions: Ember.computed('visibleMarkers', function() {
    return this.getProperties('visibleMarkers');
  }),
});
