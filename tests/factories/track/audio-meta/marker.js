import FactoryGuy from 'ember-data-factory-guy';
import Faker from 'npm:faker';

import {
  GRID_MARKER_TYPE,
  SECTION_MARKER_TYPE,
  FADE_IN_MARKER_TYPE,
  FADE_OUT_MARKER_TYPE,
  USER_MARKER_TYPE,
  TRANSITION_IN_MARKER_TYPE,
  TRANSITION_OUT_MARKER_TYPE,
} from 'linx/models/track/audio-meta/marker';

FactoryGuy.define('track/audio-meta/marker', {
  default: {
    time(model) { return Faker.random.number({ min: 0, max: 100 }); },
    type: GRID_MARKER_TYPE,
  },
});
