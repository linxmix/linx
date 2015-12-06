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
    _fromTrackMarker: FactoryGuy.belongsTo('track/audio-meta/marker', {
      start: Faker.random.number({ min: 50, max: 100 }),
      type: TRANSITION_OUT_MARKER_TYPE,
    }),
    _toTrackMarker: FactoryGuy.belongsTo('track/audio-meta/marker', {
      start: Faker.random.number({ min: 0, max: 50 }),
      type: TRANSITION_IN_MARKER_TYPE,
    }),
  },
});
