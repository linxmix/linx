import FactoryGuy from 'ember-data-factory-guy';

import {
  GRID_MARKER_TYPE,
  SECTION_MARKER_TYPE,
  FADE_IN_MARKER_TYPE,
  FADE_OUT_MARKER_TYPE,
  USER_MARKER_TYPE,
  TRANSITION_IN_MARKER_TYPE,
  TRANSITION_OUT_MARKER_TYPE,
} from 'linx/models/track/audio-meta/marker';

FactoryGuy.define('track/audio-meta/grid-marker', {
  default: {
    start(model) { return Faker.random.number({ min: 0, max: 100 }); },
    type: GRID_MARKER_TYPE,
  },
});

FactoryGuy.define('track/audio-meta/transition-in-marker', {
  default: {
    start(model) { return Faker.random.number({ min: 0, max: 50 }); },
    type: TRANSITION_IN_MARKER_TYPE,
  },
});

FactoryGuy.define('track/audio-meta/transition-out-marker', {
  default: {
    start(model) { return Faker.random.number({ min: 50, max: 100 }); },
    type: TRANSITION_OUT_MARKER_TYPE,
  },
});
