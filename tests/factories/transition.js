import FactoryGuy from 'ember-data-factory-guy';
import Faker from 'npm:faker';

import { isNumber } from 'linx/lib/utils';

FactoryGuy.define('transition', {
  default: {
    numBeats(model) { return Faker.random.number({ min: 0, max: 32, precision: 1 }); },
    fromTrack: {},
    toTrack: {},
  },

  afterMake(model, attributes) {
    // set fromTrackEnd and toTrackStart
    let { fromTrackEnd, toTrackStart } = attributes;

    fromTrackEnd = isNumber(fromTrackEnd) ? fromTrackEnd : Faker.random.number({ min: 50, max: 100 });
    model.setFromTrackEnd(fromTrackEnd);

    toTrackStart = isNumber(toTrackStart) ? toTrackStart : Faker.random.number({ min: 0, max: 50 });
    model.setToTrackStart(toTrackStart);
  },
});
