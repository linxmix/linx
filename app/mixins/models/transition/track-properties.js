import Ember from 'ember';
import DS from 'ember-data';

import withDefaultModel from 'linx/lib/computed/with-default-model';
import TrackTimeMarkerMixin from 'linx/mixins/models/track/audio-meta/beat-grid/time-marker';
import computedObject from 'linx/lib/computed/object';
import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';

export const TransitionMarker = Ember.Object.extend(TrackTimeMarkerMixin, {
  beatGrid: null,
});

// example of properties added:
// {
//   fromTrack,
//   fromTrackMarker,
//   fromTrackEndBeat,
//   fromTrackEndTime,
// }
export default function TrackPropertiesMixin(trackPath) {
  const markerPath = `${trackPath}Marker`;
  const audioMetaPath = `${trackPath}.audioMeta`;
  const beatGridPath = `${audioMetaPath}.beatGrid`;
  const automationClipsPath = `${trackPath}AutomationClips`;

  let beatPath, timePath;
  if (trackPath === 'fromTrack') {
    beatPath = 'fromTrackEndBeat';
    timePath = 'fromTrackEndTime';
  } else {
    beatPath = 'toTrackStartBeat';
    timePath = 'toTrackStartTime';
  }

  return Ember.Mixin.create({
    // TODO(TRANSITION)
    // DependentRelationshipMixin(automationClipsPath), {

    [trackPath]: DS.belongsTo('track', { async: true }),
    // [automationClipsPath]: DS.belongsTo('transition/track-automation-clip', { async: true }),

    [timePath]: DS.attr('number', { defaultValue: 0 }),

    // when setting beat, alias to time
    [beatPath]: Ember.computed(`${markerPath}.beat`, {
      get(key) {
        return this.get(`${markerPath}.beat`);
      },
      set(key, beat) {
        const marker = this.get(markerPath);
        marker.set('beat', beat);
        this.set(timePath, marker.get('time'));
        return beat;
      },
    }),

    // compute marker from time
    [markerPath]: computedObject(TransitionMarker, {
      'time': timePath,
      'beatGrid': beatGridPath,
    }),
  });
}
