import FactoryGuy from 'ember-data-factory-guy';
import Faker from 'npm:faker';

import { isFunction } from 'linx/lib/utils';

import {
  TRANSITION_IN_MARKER_TYPE,
  TRANSITION_OUT_MARKER_TYPE,
} from 'linx/models/track/audio-meta/marker';

FactoryGuy.define('transition', {
  default: {
    numBeats(model) { return Faker.random.number({ min: 0, max: 32, precision: 1 }); },
    fromTrack: {},
    toTrack: {},
    _arrangement: {},
    _fromTrackMarker(model) {
      // If fromTrack is a real model, we have to make a real model
      if (isFunction(model.fromTrack.get)) {
        return FactoryGuy.make('track/audio-meta/marker', {
          audioMeta: model.fromTrack.get('audioMeta.content'),
          start: Faker.random.number({ min: 50, max: 100 }),
          type: TRANSITION_OUT_MARKER_TYPE,
        });
      }

      return FactoryGuy.belongsTo('track/audio-meta/marker', {
        audioMeta: model.fromTrack._audioMeta,
        start: Faker.random.number({ min: 50, max: 100 }),
        type: TRANSITION_OUT_MARKER_TYPE,
      })();
    },
    _toTrackMarker(model) {
      // If toTrack is a real model, we have to make a real model
      if (isFunction(model.toTrack.get)) {
        return FactoryGuy.make('track/audio-meta/marker', {
          audioMeta: model.toTrack.get('audioMeta.content'),
          start: Faker.random.number({ min: 0, max: 50 }),
          type: TRANSITION_IN_MARKER_TYPE,
        });
      }

      return FactoryGuy.belongsTo('track/audio-meta/marker', {
        audioMeta: model.toTrack._audioMeta,
        start: Faker.random.number({ min: 0, max: 50 }),
        type: TRANSITION_IN_MARKER_TYPE,
      })();
    }
  },
});
