import FactoryGuy from 'ember-data-factory-guy';
import Faker from 'npm:faker';

FactoryGuy.define('transition', {
  default: {
    numBeats(model) { return Faker.random.number({ min: 0, max: 32, precision: 1 }); },
    fromTrack: {},
    toTrack: {},
    _arrangement: {},
    fromTrackEndTime(model) { return Faker.random.number({ min: 50, max: 100, }); },
    toTrackStartTime(model) { return Faker.random.number({ min: 0, max: 50, }); },
  },
});
