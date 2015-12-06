import Ember from 'ember';

import withDefaultModel from 'linx/lib/computed/with-default-model';
import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';

import {
  TRANSITION_IN_MARKER_TYPE,
  TRANSITION_OUT_MARKER_TYPE,
} from 'linx/models/track/audio-meta/marker';

// example of properties added:
// {
//   fromTrack,
//   _fromTrackMarker,
//   fromTrackMarker,
//   fromTrackEndBeat,
// }
export default function TrackPropertiesMixin(trackPath) {
  let markerPath = `${trackPath}Marker`;
  let privateMarkerPath = `_${markerPath}`;
  let audioMetaPath = `${trackPath}.audioMeta`;

  let markerType, beatPath;
  if (trackPath === 'fromTrack') {
    beatPath = 'fromTrackEndBeat';
    markerType = TRANSITION_OUT_MARKER_TYPE;
  } else {
    beatPath = 'toTrackStartBeat';
    markerType = TRANSITION_IN_MARKER_TYPE;
  }

  return Ember.Mixin.create(
    DependentRelationshipMixin(markerPath), {

    [trackPath]: DS.belongsTo('track', { async: true }),
    [privateMarkerPath]: DS.belongsTo('track/audio-meta/marker', { async: true }),
    [markerPath]: withDefaultModel(privateMarkerPath, function() {
      return this.get('store').createRecord('track/audio-meta/marker', {
        type: markerType,
      });
    }),

    [beatPath]: Ember.computed.alias(`${markerPath}.startBeat`),

    // when track audio meta changes, update marker
    [`${trackPath}AudioMetaDidChange`]: Ember.observer(`${markerPath}.id`, `${audioMetaPath}.id`, function() {
      Ember.RSVP.all([
        this.get(markerPath),
        this.get(audioMetaPath),
      ]).then(([marker, audioMeta]) => {
        marker.set('audioMeta', this.get(audioMetaPath));
      });
    }).on('ready'),
  });
};
